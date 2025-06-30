import React, { useEffect, useState } from 'react'
import { supabase }                   from '../App'

interface JargonItem {    //expected types to get back from supabase
  term:        string
  explanation: string
}

interface PdfJargonRow {    //jargons stored as binary array of pair(string,string), each with address of pdf_path which is a string
  pdf_path: string
  jargons:   JargonItem[]
}

const Glossary: React.FC = () => {
  const [rows,    setRows]    = useState<PdfJargonRow[]>([])    
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string|null>(null)
  //set jargons in rows, state of loading/possible error

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      //start with loading state+no error

      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession()
      if (sessErr || !session?.user) {
        setError(sessErr?.message || 'Not signed in')
        setLoading(false)
        return
      }
      const userId = session.user.id

    const { data, error } = await supabase
      .from('user_pdf_jargons')
      .select('pdf_path, jargons')
      .eq('user_id', userId)

      if (error) {
        setError(error.message)
      } else {
        setRows(data || [])
      }

      setLoading(false)
    })()
  }, [])

  if (loading) return <p>Loading glossary…</p>
  if (error)   return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Glossary</h1>
      {rows.length === 0 && <p>No jargon explanations found.</p>}

      {rows.map(({ pdf_path, jargons }) => {
        const filename = pdf_path.split('/').pop() || pdf_path
        return (
          <section key={pdf_path} style={{ marginBottom: 24 }}>
            <h2>{filename}</h2>
            {jargons.length === 0 ? (
              <p><em>No terms extracted.</em></p>
            ) : (
              <ul>
                {jargons.map(({ term, explanation }) => (
                  <li key={term}>
                    <strong>{term}</strong>: {explanation}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}

export default Glossary
