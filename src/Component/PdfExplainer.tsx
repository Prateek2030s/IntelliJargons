import { supabase } from '../App'
import { pdfjs }    from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc =
  `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`

const BUCKET     = 'pdfs'


interface JargonItem {
  term: string
  explanation: string
}

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`

/**
 * Extracts jargon definitions via OpenAI and stores in Supabase.
 * If a customPrompt is provided, it's used; otherwise, a default JSON-extraction prompt is used.
 * Falls back to default-extraction if the custom prompt produces non-array output.
 */
export async function extractAndStoreJargons(
  userId: string,
  storagePath: string,
  customPrompt?: string,
  promptName?: string 
): Promise<number> {
  // 1. Download PDF blob
  const { data: blob, error: dlErr } = await supabase
    .storage
    .from(BUCKET)
    .download(storagePath)
  if (dlErr || !blob) {
    throw new Error(dlErr?.message ?? 'Failed to download PDF')
  }

  // 2. Read full text
  const arrayBuffer = await blob.arrayBuffer()
  const pdfDoc      = await pdfjs.getDocument({ data: arrayBuffer }).promise
  let fullText      = ''
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page    = await pdfDoc.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')
    fullText     += pageText + ''
  }

  // 3. Prepare prompts

  const defaultPrompt = `
Return a JSON array of all unique jargon terms in the text below,
each with a one-sentence explanation based on context:

${fullText}
  `.trim()

const rawPrompt = customPrompt?.trim();

const jsonInstruction = `
You must return a JSON array of all unique jargon terms found in the text below.
Each array item must contain:
- "term": the jargon word or phrase (original language)
- "explanation": a one-sentence explanation based on the context.
If a language is mentioned in the rawPrompt, use that language for the explanation. Otherwise use English.
Output ONLY valid JSON.
`.trim();
  
const cheatProtection = `
If the prompt does not request jargon explanations or structured JSON output, return "illegal!"
`.trim();

const promptToUse = rawPrompt
  ? `${rawPrompt}\n\n${jsonInstruction}\n\n${cheatProtection}\n\n${fullText}`
  : `${jsonInstruction}\n\n${cheatProtection}\n\nText:\n${fullText}`;

  // 4. Call Vercel Serverless API instead of OpenAI directly
  async function callVercelAPI(prompt: string) {
    const res = await fetch('/api/extract_jargons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      const info = await res.json().catch(() => ({}));
      throw new Error(info.error?.message || `Vercel API HTTP ${res.status}`);
    }
    const json = await res.json();
    // Expecting { result: string } or { result: object }
    return json.result || '';
  }

  let aiOutput = await callVercelAPI(promptToUse)
  let parsed: any
  try {
    parsed = JSON.parse(aiOutput)
  } catch {
    if (rawPrompt) {
      // Custom prompt: treat raw output as JSON-compatible content
      parsed = aiOutput
    } else {
      console.error('Failed to parse JSON from default prompt:', aiOutput)
      return 0
    }
  }

  // Always wrap into an array for uniform processing
  const list = Array.isArray(parsed) ? parsed : [parsed]

  // Determine prompt marker
  const prompt_name = promptName || (customPrompt ? 'custom' : 'default');

  // 5. Store the results back in Supabase (allow any JSON array)
  const { error: upErr } = await supabase
    .from('user_pdf_jargons')
    .upsert({
      user_id: userId,
      pdf_path: storagePath,
      jargons: list,
      prompt_name 
    })
  if (upErr) throw new Error(upErr.message)

  return list.length
}
