import { supabase } from '../App'
import { pdfjs }    from 'react-pdf'

pdfjs.GlobalWorkerOptions.workerSrc = 
  `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`

const BUCKET     = 'pdfs'
const OPENAI_KEY = process.env.REACT_APP_OPENAI_API_KEY!

interface JargonItem {
  term: string
  explanation: string
}

pdfjs.GlobalWorkerOptions.workerSrc =
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`

export async function extractAndStoreJargons(
  userId: string,
  storagePath: string
): Promise<number> {

  //download pdf
  const { data: blob, error: dlErr } = await supabase
    .storage
    .from(BUCKET)
    .download(storagePath)
  if (dlErr || !blob) {
    throw new Error(dlErr?.message ?? 'Failed to download PDF')
  }

  //parse with pdfjs
  const arrayBuffer = await blob.arrayBuffer()
  const pdfDoc      = await pdfjs.getDocument({ data: arrayBuffer }).promise
  let fullText      = ''
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page    = await pdfDoc.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')
    fullText     += pageText + '\n\n'
  }

  //openai api for prompt
  const prompt = `
Return a JSON array of all unique jargon terms in the text below,
each with a one-sentence explanation based on context:

${fullText}
  `.trim()

  //actual ai job: do prompt, then store into supabase. it should output texts
  const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`
    },
    body: JSON.stringify({
      model:       'gpt-4.1-nano-2025-04-14',
      temperature: 0,
      max_tokens:  1500,
      messages: [
        { role: 'system', content: 'Output ONLY valid JSON.' },
        { role: 'user',   content: prompt }
      ]
    })
  })
  if (!aiRes.ok) {
    const AiErr = await aiRes.json().catch(() => ({}))
    throw new Error(AiErr.error?.message || `OpenAI HTTP ${aiRes.status}`)
  }

  //case where ai fails to generate
  const generated = (await aiRes.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  if (!generated.choices || generated.choices.length === 0) {
    console.warn('ChatGPT returned no choices; treating as no jargon.')
    return 0
  }
//case where gpt doesnt generate storable type
  if (typeof generated.choices[0]?.message?.content !== 'string') {
    console.warn('Unexpected ChatGPT output format:', generated.choices[0])
    return 0
  }

  //make outputs into json
  let list: JargonItem[]
  try {
    list = JSON.parse(generated.choices[0]?.message?.content)
  } catch {
    console.error('Failed to parse JSON from model response:', generated.choices[0]?.message?.content)
    return 0
  }

  //put into array
  const jargons = Array.from(
    new Map(list.map(item => [item.term.toLowerCase(), item])).values()
  )

  //store into supabase
  const { error: upErr } = await supabase
    .from('user_pdf_jargons')
    .upsert({
      user_id:  userId,
      pdf_path: storagePath,
      jargons:  jargons
    })

  if (upErr) throw new Error(upErr.message)

  return jargons.length
}