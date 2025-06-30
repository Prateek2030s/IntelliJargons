import React, { useState, useEffect } from 'react'
import { Document, Page, pdfjs }      from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { supabase }                   from '../App'
import WordDefinition                 from '../Component/WordDefinition'

pdfjs.GlobalWorkerOptions.workerSrc =
  `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`

export interface ReaderProps {    //expects a string of userId
  storagePath: string
  onBack?:     () => void
}

interface JargonItem {
  term:        string
  explanation: string
}

const Reader: React.FC<ReaderProps> = ({ storagePath, onBack }) => {
  const [blobUrl,  setBlobUrl]  = useState<string|null>(null)
  const [numPages, setNumPages] = useState(0)
  const [jargons,  setJargons]  = useState<JargonItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string|null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)

      //download Pdf, as blob
      const { data: blob, error: dlErr } = await supabase
        .storage.from('pdfs').download(storagePath)
      if (dlErr || !blob) {
        setError(dlErr?.message ?? 'Failed to download PDF')
        setLoading(false)
        return
      }
      const url = URL.createObjectURL(blob)
      setBlobUrl(url)

      //fetch stored jargons
      const { data: { session }, error: sessErr } = await supabase.auth.getSession()
      if (sessErr || !session?.user) {
        setError(sessErr?.message ?? 'Not signed in')
        setLoading(false)
        return
      }
      const { data, error: jqErr } = await supabase
        .from('user_pdf_jargons')
        .select('jargons')
        .eq('user_id',    session.user.id)
        .eq('pdf_path',   storagePath)
        .single()
      if (jqErr) {
        setError(jqErr.message)
      } else if (data?.jargons) {
        setJargons((data as { jargons: JargonItem[] }).jargons)
      }
      setLoading(false)
    })()
  }, [storagePath])

  if (loading)   return <p>Loading…</p>
  if (error)     return <p style={{ color: 'red' }}>{error}</p>
  if (!blobUrl)  return null

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* ==== PDF pane ==== */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {onBack && (
          <button onClick={onBack} style={{ marginBottom: 12 }}>
            ← Back
          </button>
        )}
        <h2>PDF Reader</h2>
        <Document
          file={blobUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={<p>Rendering PDF…</p>}
          error={<p style={{ color: 'red' }}>Failed to render PDF.</p>}
        >
          {Array.from({ length: numPages }).map((_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={600}               /* adjust width if you like */
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      </div>

     //side window
      <div
        style={{
          width: 300,
          borderLeft: '1px solid #ddd',
          padding: 20,
          overflowY: 'auto',
          background: '#fafafa'
        }}
      >
        <h3>Jargon Terms</h3>
        {jargons.length === 0 && <p>No terms available.</p>}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {jargons.map((j, idx) => (
            <li key={idx} style={{ marginBottom: 12 }}>
              <WordDefinition definition={j.explanation}>
                {j.term}
              </WordDefinition>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Reader
