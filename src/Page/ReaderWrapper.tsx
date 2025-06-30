//this is to implement auto select of latest pdf path when no pdf is selected, still building
import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Reader                         from '../Page/Reader'

export default function ReaderWrapper() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { storagePath: string } }
  const path = state?.storagePath

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
