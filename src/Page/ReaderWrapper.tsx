import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Reader from '../Page/Reader'
import { supabase } from '../App'

export default function ReaderWrapper() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { storagePath: string } }
  const [latestPath, setLatestPath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const path = state?.storagePath || latestPath

  useEffect(() => {
    if (!state?.storagePath) {
      setLoading(true)
      setError(null)
      ;(async () => {
        // Get current user session
        const { data: { session }, error: sessErr } = await supabase.auth.getSession()
        if (sessErr || !session?.user) {
          setError('Not signed in')
          setLoading(false)
          return
        }
        // Fetch latest uploaded file for this user
        const { data, error } = await supabase
          .from('user_pdf_jargons')
          .select('pdf_path')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (error || !data?.pdf_path) {
          setError('No PDF found for this user.')
        } else {
          setLatestPath(data.pdf_path)
        }
        setLoading(false)
      })()
    }
  }, [state?.storagePath])

  // NEW: Check if explanation exists for the current prompt name
  useEffect(() => {
    if (!path) return;
    (async () => {
      setLoading(true);
      setError(null);
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !session?.user) {
        setError('Not signed in');
        setLoading(false);
        return;
      }
      const promptName = localStorage.getItem('selectedPromptName') || 'default';
      const { data, error } = await supabase
        .from('user_pdf_jargons')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('pdf_path', path)
        .eq('prompt_name', promptName)
        .single();
      if (error || !data) {
        // Extract file name from path
        const fileName = path.split('/').pop() || path;
        setError(
          `No explanation using "${promptName}" was generated for "${fileName}". Head to upload to generate jargons first!`
        );
        setLoading(false);
        return;
      }
      setLoading(false);
    })();
  }, [path]);

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>
  if (error) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    )
  }
  if (!path) {
    return (
      <div style={{ padding: 20 }}>
        <p style={{ color: 'red' }}>No PDF selected. Please upload or select one.</p>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    )
  }

  return <Reader storagePath={path} onBack={() => navigate(-1)} />
}