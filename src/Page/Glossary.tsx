// import React, { useEffect, useState } from 'react'
// import { supabase } from '../App'
// import './Glossary.css'

// interface JargonItem {
//   term: string
//   explanation: string
// }

// interface PdfJargonRow {
//   pdf_path: string
//   jargons: JargonItem[]
//   prompt_name: string
// }

// const Glossary: React.FC = () => {
//   const [rows, setRows] = useState<PdfJargonRow[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const [expandedFile, setExpandedFile] = useState<string | null>(null)
//   const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null)
//   const [editStates, setEditStates] = useState<Record<string, string>>({})
//   const [bulkEdit, setBulkEdit] = useState<string>('')
//   const [bulkEditPrompt, setBulkEditPrompt] = useState<{ file: string, prompt: string } | null>(null)
//   const [saving, setSaving] = useState(false)

//   useEffect(() => {
//     ;(async () => {
//       setLoading(true)
//       setError(null)
//       const { data, error } = await supabase
//         .from('user_pdf_jargons')
//         .select('pdf_path, jargons, prompt_name')
//       if (error) {
//         setError(error.message)
//         setLoading(false)
//         return
//       }
//       setRows(data as PdfJargonRow[])
//       setLoading(false)
//     })()
//   }, [])

//   // Group by file name, then by prompt name
//   const grouped: Record<string, Record<string, JargonItem[]>> = {}
//   rows.forEach(({ pdf_path, jargons, prompt_name }) => {
//     const file = pdf_path.split('/').pop() || pdf_path
//     if (!grouped[file]) grouped[file] = {}
//     grouped[file][prompt_name] = jargons
//   })

//   const handleDownload = (file: string, prompt: string, jargons: JargonItem[]) => {
//     const lines = [
//       `Jargon Glossary for ${file} (${prompt})`,
//       ...jargons.map(j => `${j.term}: ${j.explanation}`)
//     ]
//     const text = lines.join('\n\n')
//     const blob = new Blob([text], { type: 'text/plain' })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = `${file}_${prompt}_jargons.txt`
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   // Save a single explanation edit
//   const handleSaveExplanation = async (
//     file: string,
//     prompt: string,
//     term: string,
//     newExplanation: string
//   ) => {
//     setSaving(true)
//     setError(null)
//     // Find the row to update
//     const pdf_path = rows.find(r => r.pdf_path.endsWith(file) && r.prompt_name === prompt)?.pdf_path
//     if (!pdf_path) {
//       setError('Could not find the PDF row to update.')
//       setSaving(false)
//       return
//     }
//     // Get current jargons
//     const row = rows.find(r => r.pdf_path === pdf_path && r.prompt_name === prompt)
//     if (!row) {
//       setError('Could not find the PDF row to update.')
//       setSaving(false)
//       return
//     }
//     // Update the explanation for the term
//     const updatedJargons = row.jargons.map(j =>
//       j.term === term ? { ...j, explanation: newExplanation } : j
//     )
//     // Update in Supabase
//     const { error: updateErr } = await supabase
//       .from('user_pdf_jargons')
//       .update({ jargons: updatedJargons })
//       .eq('pdf_path', pdf_path)
//       .eq('prompt_name', prompt)
//     if (updateErr) {
//       setError(updateErr.message)
//     } else {
//       // Update local state
//       setRows(rows =>
//         rows.map(r =>
//           r.pdf_path === pdf_path && r.prompt_name === prompt
//             ? { ...r, jargons: updatedJargons }
//             : r
//         )
//       )
//       setEditStates(s => ({ ...s, [`${file}|${prompt}|${term}`]: '' }))
//     }
//     setSaving(false)
//   }

//   // Bulk edit handler
//   const handleBulkEdit = (file: string, prompt: string, jargons: JargonItem[]) => {
//     setBulkEditPrompt({ file, prompt })
//     setBulkEdit(
//       jargons.map(j => `${j.term}: ${j.explanation}`).join('\n')
//     )
//   }

//   // Save bulk edits
//   const handleSaveBulkEdit = async () => {
//     if (!bulkEditPrompt) return
//     setSaving(true)
//     setError(null)
//     const { file, prompt } = bulkEditPrompt
//     const pdf_path = rows.find(r => r.pdf_path.endsWith(file) && r.prompt_name === prompt)?.pdf_path
//     if (!pdf_path) {
//       setError('Could not find the PDF row to update.')
//       setSaving(false)
//       return
//     }
//     // Parse lines: "jargon: explanation"
//     const newJargons: JargonItem[] = bulkEdit
//       .split('\n')
//       .map(line => {
//         const idx = line.indexOf(':')
//         if (idx === -1) return null
//         return {
//           term: line.slice(0, idx).trim(),
//           explanation: line.slice(idx + 1).trim()
//         }
//       })
//       .filter(Boolean) as JargonItem[]
//     // Update in Supabase
//     const { error: updateErr } = await supabase
//       .from('user_pdf_jargons')
//       .update({ jargons: newJargons })
//       .eq('pdf_path', pdf_path)
//       .eq('prompt_name', prompt)
//     if (updateErr) {
//       setError(updateErr.message)
//     } else {
//       // Update local state
//       setRows(rows =>
//         rows.map(r =>
//           r.pdf_path === pdf_path && r.prompt_name === prompt
//             ? { ...r, jargons: newJargons }
//             : r
//         )
//       )
//       setBulkEdit('')
//       setBulkEditPrompt(null)
//     }
//     setSaving(false)
//   }

//   // Delete all explanations for a file and prompt
//   const handleDeletePrompt = async (file: string, prompt: string) => {
//     const confirmDelete = window.confirm(
//       `Are you sure you want to delete all explanations for "${file}" with prompt "${prompt}"? This cannot be undone.`
//     );
//     if (!confirmDelete) return;
//     setSaving(true);
//     setError(null);
//     const pdf_path = rows.find(r => r.pdf_path.endsWith(file) && r.prompt_name === prompt)?.pdf_path;
//     if (!pdf_path) {
//       setError('Could not find the PDF row to delete.');
//       setSaving(false);
//       return;
//     }
//     // Delete from Supabase
//     const { error: delErr } = await supabase
//       .from('user_pdf_jargons')
//       .delete()
//       .eq('pdf_path', pdf_path)
//       .eq('prompt_name', prompt);
//     if (delErr) {
//       setError(delErr.message);
//     } else {
//       // Remove from local state
//       setRows(rows =>
//         rows.filter(r => !(r.pdf_path === pdf_path && r.prompt_name === prompt))
//       );
//       // Also collapse the expanded prompt if it was just deleted
//       setExpandedPrompt(expandedPrompt === prompt ? null : expandedPrompt);
//     }
//     setSaving(false);
//   };

//   if (loading) return <p>Loading…</p>
//   if (error) return <p style={{ color: 'red' }}>{error}</p>

//   return (
//     <div className="glossary-container">
//       <h2>Glossary</h2>
//       {Object.keys(grouped).length === 0 && <p>No extracted jargons found.</p>}
//       {Object.entries(grouped).map(([file, prompts]) => (
//         <section key={file} className="glossary-section">
//           <h3
//             className={`glossary-file${expandedFile === file ? ' expanded' : ''}`}
//             onClick={() => setExpandedFile(expandedFile === file ? null : file)}
//           >
//             {file}
//           </h3>
//           {expandedFile === file && (
//             <div className="glossary-prompts">
//               {Object.entries(prompts).map(([promptName, jargons]) => (
//                 <div key={promptName} style={{ marginBottom: 16 }}>
//                   <div
//                     className={`glossary-prompt${expandedPrompt === promptName ? ' expanded' : ''}`}
//                     onClick={() => setExpandedPrompt(expandedPrompt === promptName ? null : promptName)}
//                   >
//                     {promptName}
//                     <button
//                       style={{ marginLeft: 16, color: 'red' }}
//                       disabled={saving}
//                       onClick={e => {
//                         e.stopPropagation();
//                         handleDeletePrompt(file, promptName);
//                       }}
//                     >
//                       Delete All
//                     </button>
//                   </div>
//                   {expandedPrompt === promptName && (
//                     <div className="glossary-explanations">
//                       <button
//                         className="glossary-download-btn"
//                         onClick={() => handleDownload(file, promptName, jargons)}
//                       >
//                         Download Explanations
//                       </button>
//                       <button
//                         className="glossary-download-btn"
//                         style={{ marginLeft: 8 }}
//                         onClick={() => handleBulkEdit(file, promptName, jargons)}
//                       >
//                         Edit All
//                       </button>
//                       <ul className="glossary-list">
//                         {jargons.map(({ term, explanation }) => (
//                           <li key={term}>
//                             <strong>{term}</strong>: {explanation}{' '}
//                             <button
//                               style={{ marginLeft: 8 }}
//                               onClick={() =>
//                                 setEditStates(s => ({
//                                   ...s,
//                                   [`${file}|${promptName}|${term}`]: explanation
//                                 }))
//                               }
//                             >
//                               Edit
//                             </button>
//                             {editStates[`${file}|${promptName}|${term}`] !== undefined && (
//                               <span style={{ display: 'block', marginTop: 4 }}>
//                                 <input
//                                   type="text"
//                                   value={editStates[`${file}|${promptName}|${term}`]}
//                                   onChange={e =>
//                                     setEditStates(s => ({
//                                       ...s,
//                                       [`${file}|${promptName}|${term}`]: e.target.value
//                                     }))
//                                   }
//                                   style={{ width: 300 }}
//                                   disabled={saving}
//                                 />
//                                 <button
//                                   style={{ marginLeft: 8 }}
//                                   disabled={saving}
//                                   onClick={() =>
//                                     handleSaveExplanation(
//                                       file,
//                                       promptName,
//                                       term,
//                                       editStates[`${file}|${promptName}|${term}`]
//                                     )
//                                   }
//                                 >
//                                   Save
//                                 </button>
//                                 <button
//                                   style={{ marginLeft: 4 }}
//                                   disabled={saving}
//                                   onClick={() =>
//                                     setEditStates(s => {
//                                       const copy = { ...s }
//                                       delete copy[`${file}|${promptName}|${term}`]
//                                       return copy
//                                     })
//                                   }
//                                 >
//                                   Cancel
//                                 </button>
//                               </span>
//                             )}
//                           </li>
//                         ))}
//                       </ul>
//                       {bulkEditPrompt &&
//                         bulkEditPrompt.file === file &&
//                         bulkEditPrompt.prompt === promptName && (
//                           <div style={{ marginTop: 16 }}>
//                             <textarea
//                               rows={Math.max(6, bulkEdit.split('\n').length)}
//                               style={{ width: 400 }}
//                               value={bulkEdit}
//                               onChange={e => setBulkEdit(e.target.value)}
//                               disabled={saving}
//                             />
//                             <div>
//                               <button
//                                 style={{ marginTop: 8 }}
//                                 disabled={saving}
//                                 onClick={handleSaveBulkEdit}
//                               >
//                                 Save All
//                               </button>
//                               <button
//                                 style={{ marginLeft: 8 }}
//                                 disabled={saving}
//                                 onClick={() => {
//                                   setBulkEdit('')
//                                   setBulkEditPrompt(null)
//                                 }}
//                               >
//                                 Cancel
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       ))}
//     </div>
//   )
// }

// export default Glossary
import React, { useEffect, useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, Box, Button, TextField, Divider, CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { supabase } from '../App';

interface JargonItem {
  term: string;
  explanation: string;
}

interface PdfJargonRow {
  pdf_path: string;
  jargons: JargonItem[];
  prompt_name: string;
}

const Glossary: React.FC = () => {
  const [rows, setRows] = useState<PdfJargonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editStates, setEditStates] = useState<Record<string, string>>({});
  const [bulkEdit, setBulkEdit] = useState<string>('');
  const [bulkEditPrompt, setBulkEditPrompt] = useState<{ file: string; prompt: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_pdf_jargons')
        .select('pdf_path, jargons, prompt_name');
      if (error) {
        setError(error.message);
      } else {
        setRows(data as PdfJargonRow[]);
      }
      setLoading(false);
    })();
  }, []);

  const grouped: Record<string, Record<string, JargonItem[]>> = {};
  rows.forEach(({ pdf_path, jargons, prompt_name }) => {
    const file = pdf_path.split('/').pop() || pdf_path;
    if (!grouped[file]) grouped[file] = {};
    grouped[file][prompt_name] = jargons;
  });

  const handleDownload = (file: string, prompt: string, jargons: JargonItem[]) => {
    const text = [`Jargon Glossary for ${file} (${prompt})`, ...jargons.map(j => `${j.term}: ${j.explanation}`)].join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${file}_${prompt}_jargons.txt`;
    a.click();
  };

  const handleSaveExplanation = async (file: string, prompt: string, term: string, newExplanation: string) => {
    setSaving(true);
    const pdf_path = rows.find(r => r.pdf_path.endsWith(file) && r.prompt_name === prompt)?.pdf_path;
    if (!pdf_path) return setSaving(false);
    const row = rows.find(r => r.pdf_path === pdf_path && r.prompt_name === prompt);
    const updatedJargons = row!.jargons.map(j => j.term === term ? { ...j, explanation: newExplanation } : j);
    const { error } = await supabase
      .from('user_pdf_jargons')
      .update({ jargons: updatedJargons })
      .eq('pdf_path', pdf_path)
      .eq('prompt_name', prompt);
    if (!error) {
      setRows(rows.map(r =>
        r.pdf_path === pdf_path && r.prompt_name === prompt
          ? { ...r, jargons: updatedJargons }
          : r
      ));
      setEditStates(prev => {
        const newState = { ...prev };
        delete newState[`${file}|${prompt}|${term}`];
        return newState;
      });
    }
    setSaving(false);
  };

  const handleBulkEdit = (file: string, prompt: string, jargons: JargonItem[]) => {
    setBulkEditPrompt({ file, prompt });
    setBulkEdit(jargons.map(j => `${j.term}: ${j.explanation}`).join('\n'));
  };

  const handleSaveBulkEdit = async () => {
    if (!bulkEditPrompt) return;
    const { file, prompt } = bulkEditPrompt;
    const pdf_path = rows.find(r => r.pdf_path.endsWith(file) && r.prompt_name === prompt)?.pdf_path;
    const newJargons: JargonItem[] = bulkEdit.split('\n').map(line => {
      const idx = line.indexOf(':');
      return idx === -1 ? null : {
        term: line.slice(0, idx).trim(),
        explanation: line.slice(idx + 1).trim(),
      };
    }).filter(Boolean) as JargonItem[];
    const { error } = await supabase
      .from('user_pdf_jargons')
      .update({ jargons: newJargons })
      .eq('pdf_path', pdf_path!)
      .eq('prompt_name', prompt);
    if (!error) {
      setRows(rows.map(r =>
        r.pdf_path === pdf_path && r.prompt_name === prompt
          ? { ...r, jargons: newJargons }
          : r
      ));
      setBulkEdit('');
      setBulkEditPrompt(null);
    }
    setSaving(false);
  };

  const handleDeletePrompt = async (file: string, prompt: string) => {
    if (!window.confirm(`Delete all jargons for ${file} / ${prompt}?`)) return;
    const pdf_path = rows.find(r => r.pdf_path.endsWith(file) && r.prompt_name === prompt)?.pdf_path;
    const { error } = await supabase
      .from('user_pdf_jargons')
      .delete()
      .eq('pdf_path', pdf_path!)
      .eq('prompt_name', prompt);
    if (!error) {
      setRows(rows.filter(r => !(r.pdf_path === pdf_path && r.prompt_name === prompt)));
    }
  };

  if (loading) return <CircularProgress sx={{ m: 4 }} />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Glossary</Typography>
      {Object.entries(grouped).length === 0 && (
        <Typography>No extracted jargons found.</Typography>
      )}
      {Object.entries(grouped).map(([file, prompts]) => (
        <Accordion key={file}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">{file}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {Object.entries(prompts).map(([promptName, jargons]) => (
              <Box key={promptName} sx={{ mb: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Prompt: {promptName}
                  <Button
                    color="error"
                    size="small"
                    sx={{ ml: 2 }}
                    onClick={() => handleDeletePrompt(file, promptName)}
                    disabled={saving}
                  >
                    Delete All
                  </Button>
                </Typography>
                <Button variant="outlined" size="small" sx={{ mt: 1, mr: 1 }} onClick={() => handleDownload(file, promptName, jargons)}>Download</Button>
                <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={() => handleBulkEdit(file, promptName, jargons)}>Edit All</Button>
                <Divider sx={{ my: 2 }} />
                <Box component="ul" sx={{ pl: 2 }}>
                  {jargons.map(({ term, explanation }) => {
                    const key = `${file}|${promptName}|${term}`;
                    const isEditing = editStates[key] !== undefined;
                    return (
                      <li key={term}>
                        <Typography component="span" fontWeight="bold">{term}:</Typography>{' '}
                        {!isEditing ? (
                          <>
                            {explanation}
                            <Button size="small" sx={{ ml: 1 }} onClick={() =>
                              setEditStates(s => ({ ...s, [key]: explanation }))
                            }>Edit</Button>
                          </>
                        ) : (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              multiline
                              minRows={3}
                              fullWidth
                              size="small"
                              value={editStates[key]}
                              onChange={e => setEditStates(s => ({ ...s, [key]: e.target.value }))}
                              disabled={saving}
                            />
                            <Button size="small" sx={{ ml: 1 }} disabled={saving}
                              onClick={() => handleSaveExplanation(file, promptName, term, editStates[key])}>
                              Save
                            </Button>
                            <Button size="small" sx={{ ml: 1 }} disabled={saving}
                              onClick={() =>
                                setEditStates(s => {
                                  const copy = { ...s };
                                  delete copy[key];
                                  return copy;
                                })
                              }>
                              Cancel
                            </Button>
                          </Box>
                        )}
                      </li>
                    );
                  })}
                </Box>
                {bulkEditPrompt?.file === file && bulkEditPrompt.prompt === promptName && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      multiline
                      minRows={6}
                      fullWidth
                      value={bulkEdit}
                      onChange={e => setBulkEdit(e.target.value)}
                    />
                    <Box sx={{ mt: 1 }}>
                      <Button variant="contained" onClick={handleSaveBulkEdit} disabled={saving}>Save All</Button>
                      <Button sx={{ ml: 2 }} onClick={() => {
                        setBulkEdit('');
                        setBulkEditPrompt(null);
                      }}>Cancel</Button>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Glossary;
