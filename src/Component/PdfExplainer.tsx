//handles session and pdf rendering. 
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

/* define jargons via OpenAI and store them in Supabase according to userId and prompt name.
If a customPrompt is provided, it's used; otherwise, a default JSON-extraction prompt is used.
Falls back to default-extraction if the custom prompt produces non-array output. */
export async function extractAndStoreJargons(
  userId: string,
  storagePath: string,
  customPrompt?: string,
  promptName?: string 
): Promise<number> {
  // Download PDF blob
  const { data: blob, error: dlErr } = await supabase
    .storage
    .from(BUCKET)
    .download(storagePath)
  if (dlErr || !blob) {
    throw new Error(dlErr?.message ?? 'Failed to download PDF')
  }

  // Read full text
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

  // prompts

  const defaultPrompt = `
Return a JSON array of all unique jargon terms in the text below,
each with a one-sentence explanation based on context:

${fullText}
  `.trim()

const rawPrompt = customPrompt?.trim();

const jsonInstruction = `
You must return a JSON array of all unique jargon terms found in the text below.
Each array item must contain:
- "term": the jargon word or phrase (in original language)
- "explanation": a one-sentence explanation based on the context.

If the rawPrompt contains a phrase like "explain in [language]" or "use [language] for explanation",
then write the explanations in that language.
For example, if the prompt is "explain in Japanese", return explanations in Japanese.
Otherwise, default to English.

Output ONLY valid JSON.
`.trim();
//fortified prompt set for online customisable prompts. 
  //added block against questions asking for genAI model. Added specific instructions for langauge
  
const cheatProtection = `
If the prompt does not request jargon explanations or structured JSON output, return "illegal!"
`.trim();
//fortified prompt against missuse, such as analysing resume
  
const promptToUse = rawPrompt
  ? `${rawPrompt}\n\n${jsonInstruction}\n\n${cheatProtection}\n\n${fullText}`
  : `${jsonInstruction}\n\n${cheatProtection}\n\nText:\n${fullText}`;
  //connect functional prompt with defence blocks. text also passed in

  //update to API call, instead of local genAI
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
      //rawprompt gives JSON obj for sure
      parsed = aiOutput
    } else {
      console.error('Failed to parse JSON from default prompt:', aiOutput)
      return 0
    }
  }

  // wrap the jsons in an array
  const list = Array.isArray(parsed) ? parsed : [parsed]
  
  const prompt_name = promptName || (customPrompt ? 'custom' : 'default');

  // store into supabase according to uuid then pdf then prompt name
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
  //marker for end of processing, for async function, also to check is any jargon identified at all
}

