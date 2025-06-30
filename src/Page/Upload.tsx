import React, { useEffect, useState } from 'react'
import { useNavigate }                from 'react-router-dom'
import { supabase }                   from '../App'
import { extractAndStoreJargons }     from '../Component/PdfExplainer'

const BUCKET = 'pdfs'

interface StorageFile {
  name: string
}

const Upload: React.FC = () => {
  const navigate = useNavigate()
  const [userId, setUserId]     = useState<string>('')
  const [files, setFiles]       = useState<StorageFile[]>([])
  const [loading, setLoading]   = useState<boolean>(true)
  const [error, setError]       = useState<string>('')

  //glossary of pdfs
  const listUserPdfs = async (uId: string) => {
    const { data, error } = await supabase
      .storage
      .from(BUCKET)
      .list(uId, { sortBy: { column: 'name', order: 'asc' } })
    if (error) throw error
    return data
  }

  // load existing PDFs via session
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError('')

      const {
        data: { session },
        error: sessErr,
      } = await supabase.auth.getSession()
      if (sessErr || !session?.user) {
        setError(sessErr?.message || 'Not signed in')
        setLoading(false)
        return
      }
      setUserId(session.user.id)

      try {
        const list = await listUserPdfs(session.user.id)
        setFiles(list)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      //uploads into bucket
      const storagePath = `${userId}/${file.name}`
      const { error: upErr } = await supabase
        .storage
        .from(BUCKET)
        .upload(storagePath, file, { upsert: true })
      if (upErr) throw upErr

      //helper function for jargons
      await extractAndStoreJargons(userId, storagePath)

      //declare new lists of pdfs
      const updated = await listUserPdfs(userId)
      setFiles(updated)

      //pass storage id to reader
      navigate('/reader', { state: { storagePath } })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading…</p>
  if (error)   return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div style={{ padding: 20 }}>
      <h2>Your PDFs</h2>

      <ul>
        {files.map((f, idx) => (
          <li key={idx}>
            {f.name}{' '}
            <button
              onClick={() =>
                navigate('/reader', { state: { storagePath: `${userId}/${f.name}` } })
              }
            >
              View
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <label>
          Upload new PDF:{' '}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
          />
        </label>
      </div>
    </div>
  )
}

export default Upload