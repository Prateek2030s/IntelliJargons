// import React, { useEffect, useState } from 'react'
// import { useNavigate }                from 'react-router-dom'
// import { supabase }                   from '../App'
// import { extractAndStoreJargons }     from '../Component/PdfExplainer'

// const BUCKET = 'pdfs'

// interface StorageFile {
//   name: string,
//   created_at: string
// }

// const Upload: React.FC = () => {
//   const navigate = useNavigate()
//   const [userId, setUserId]     = useState<string>('')
//   const [files, setFiles]       = useState<StorageFile[]>([])
//   const [loading, setLoading]   = useState<boolean>(true)
//   const [error, setError]       = useState<string>('')
//   const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);

//   //glossary of pdfs
//   const listUserPdfs = async (uId: string) => {
//     const { data, error } = await supabase
//       .storage
//       .from(BUCKET)
//       .list(uId, { sortBy: { column: 'created_at', order: 'desc' } })
//     if (error) throw error
//     return data
//   }

//   // load existing PDFs via session
//   useEffect(() => {
//     ;(async () => {
//       setLoading(true)
//       setError('')

//       const {
//         data: { session },
//         error: sessErr,
//       } = await supabase.auth.getSession()
//       if (sessErr || !session?.user) {
//         setError(sessErr?.message || 'Not signed in')
//         setLoading(false)
//         return
//       }
//       setUserId(session.user.id)

//       try {
//         const list = await listUserPdfs(session.user.id)
//         setFiles(list)
//       } catch (err: any) {
//         setError(err.message)
//       } finally {
//         setLoading(false)
//       }
//     })()
//   }, [])

//   //code updated with: error handling for repeated file

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0]
//   if (!file) return

//   // Check if file already exists
//   const existingFile = files.find(f => f.name === file.name)
//   if (existingFile) {
//     const confirmOpen = window.confirm('File has been processed. Open?')
//     if (confirmOpen) {
//       // Just open the file, do NOT re-process or re-upload
//       navigate('/reader', { state: { storagePath: `${userId}/${file.name}` } })
//     }
//     // Cancel upload if user chooses not to open
//     return
//   }

//   // Only process if file does NOT exist
//   setLoading(true)
//   setError('')

//   try {
//     // uploads into bucket (no upsert, so it will fail if file exists)
//     const storagePath = `${userId}/${file.name}`;
//     const { error: upErr } = await supabase
//       .storage
//       .from(BUCKET)
//       .upload(storagePath, file, { upsert: false }); // <--- upsert: false
//     if (upErr) throw upErr;

//     // Get selected prompt from localStorage
//     const selectedPrompt = localStorage.getItem('selectedPrompt') || undefined;
//     const selectedPromptName = localStorage.getItem('selectedPromptName') || undefined;

//     // Only process new files with the selected prompt and marker
//     await extractAndStoreJargons(userId, storagePath, selectedPrompt, selectedPromptName);

//     // declare new lists of pdfs
//     const updated = await listUserPdfs(userId);
//     setFiles(updated);

//     // pass storage id to reader
//     navigate('/reader', { state: { storagePath } });
//   } catch (err: any) {
//     setError(err.message);
//   } finally {
//     setLoading(false);
//   }
// }

// const handleDelete = async (fileName: string) => {
//   const confirmDelete = window.confirm(
//     `Are you sure you want to delete "${fileName}" and all its explanations? This cannot be undone.`
//   );
//   if (!confirmDelete) return;
//   setLoading(true);
//   setError('');
//   try {
//     // 1. Delete from Supabase storage
//     const { error: storageErr } = await supabase
//       .storage
//       .from(BUCKET)
//       .remove([`${userId}/${fileName}`]);
//     if (storageErr) throw storageErr;

//     // 2. Delete all explanations for this file (any prompt name)
//     const { error: dbErr } = await supabase
//       .from('user_pdf_jargons')
//       .delete()
//       .eq('user_id', userId)
//       .eq('pdf_path', `${userId}/${fileName}`);

//     if (dbErr) throw dbErr;

//     // 3. Refresh file list
//     const updated = await listUserPdfs(userId);
//     setFiles(updated);
//   } catch (err: any) {
//     setError(err.message);
//   } finally {
//     setLoading(false);
//   }
// };

// const handleView = async (fileName: string) => {
//   setLoading(true);
//   setError('');
//   try {
//     const { data: { session }, error: sessErr } = await supabase.auth.getSession();
//     if (sessErr || !session?.user) throw new Error(sessErr?.message ?? 'Not signed in');
//     const userId = session.user.id;
//     const storagePath = `${userId}/${fileName}`;
//     const promptName = localStorage.getItem('selectedPromptName') || 'default';
//     const selectedPrompt = localStorage.getItem('selectedPrompt') || undefined;

//     // 1. Check if explanation exists
//     const { data, error } = await supabase
//       .from('user_pdf_jargons')
//       .select('jargons')
//       .eq('user_id', userId)
//       .eq('pdf_path', storagePath)
//       .eq('prompt_name', promptName)
//       .single();

//     // 2. If not, generate and store
//     if (error && error.code === 'PGRST116') {
//       await extractAndStoreJargons(userId, storagePath, selectedPrompt, promptName);
//     }

//     // 3. Navigate to reader
//     navigate('/reader', { state: { storagePath } });
//   } catch (err: any) {
//     setError(err.message);
//   } finally {
//     setLoading(false);
//   }
// };

//   if (loading) return <p>Loading…</p>
//   if (error)   return <p style={{ color: 'red' }}>{error}</p>

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Your PDFs</h2>

//       <ul>
//   {files.map((f, idx) => (
//     <li key={idx}>
//       {f.name}{' '}
//       <button
//         onClick={() => handleView(f.name)}
//       >
//         View
//       </button>
//       <button
//         disabled={generatingIdx === idx}
//         onClick={async () => {
//           setGeneratingIdx(idx);
//           const selectedPrompt = localStorage.getItem('selectedPrompt') || undefined;
//           const selectedPromptName = localStorage.getItem('selectedPromptName') || 'default';

//           // Check if explanations already exist for this file and prompt
//           const { data, error } = await supabase
//             .from('user_pdf_jargons')
//             .select('id')
//             .eq('user_id', userId)
//             .eq('pdf_path', `${userId}/${f.name}`)
//             .eq('prompt_name', selectedPromptName)
//             .single();

//           if (data) {
//             alert('Explanations for this document with this prompt already exist. Only one generation allowed per document per prompt.');
//             setGeneratingIdx(null);
//             return;
//           }

//           await extractAndStoreJargons(userId, `${userId}/${f.name}`, selectedPrompt, selectedPromptName);
//           alert('Explanations generated with selected prompt!');
//           setGeneratingIdx(null);
//         }}
//       >
//         {generatingIdx === idx ? 'Generating...' : 'Generate explanations with selected prompt'}
//       </button>
//       <button
//         style={{ marginLeft: 8, color: 'red' }}
//         onClick={() => handleDelete(f.name)}
//       >
//         Delete
//       </button>
//     </li>
//   ))}
//       </ul>

//       <div style={{ marginTop: 20 }}>
//         <label>
//           Upload new PDF:{' '}
//           <input
//             type="file"
//             accept="application/pdf"
//             onChange={handleUpload}
//           />
//         </label>
//       </div>
//     </div>
//   )
// }

// export default Upload;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../App';
import { extractAndStoreJargons } from '../Component/PdfExplainer';

import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Stack,
  Alert,
} from '@mui/material';

const BUCKET = 'pdfs';

interface StorageFile {
  name: string;
  created_at: string;
}

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);

  const listUserPdfs = async (uId: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).list(uId, {
      sortBy: { column: 'created_at', order: 'desc' },
    });
    if (error) throw error;
    return data;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !session?.user) {
        setError(sessErr?.message || 'Not signed in');
        setLoading(false);
        return;
      }
      const uid = session.user.id;
      setUserId(uid);
      try {
        const list = await listUserPdfs(uid);
        setFiles(list);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const existingFile = files.find((f) => f.name === file.name);
    if (existingFile) {
      const confirmOpen = window.confirm('File has been processed. Open?');
      if (confirmOpen) {
        navigate('/reader', { state: { storagePath: `${userId}/${file.name}` } });
      }
      return;
    }

    setLoading(true);
    setError('');

    try {
      const storagePath = `${userId}/${file.name}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
        upsert: false,
      });
      if (upErr) throw upErr;

      const selectedPrompt = localStorage.getItem('selectedPrompt') || undefined;
      const selectedPromptName = localStorage.getItem('selectedPromptName') || undefined;

      await extractAndStoreJargons(userId, storagePath, selectedPrompt, selectedPromptName);

      const updated = await listUserPdfs(userId);
      setFiles(updated);
      navigate('/reader', { state: { storagePath } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    const confirmDelete = window.confirm(`Delete "${fileName}" and all explanations?`);
    if (!confirmDelete) return;

    setLoading(true);
    setError('');
    try {
      await supabase.storage.from(BUCKET).remove([`${userId}/${fileName}`]);
      await supabase
        .from('user_pdf_jargons')
        .delete()
        .eq('user_id', userId)
        .eq('pdf_path', `${userId}/${fileName}`);

      const updated = await listUserPdfs(userId);
      setFiles(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (fileName: string) => {
    setLoading(true);
    setError('');
    try {
      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !session?.user) throw new Error(sessErr?.message ?? 'Not signed in');

      const storagePath = `${session.user.id}/${fileName}`;
      const promptName = localStorage.getItem('selectedPromptName') || 'default';
      const selectedPrompt = localStorage.getItem('selectedPrompt') || undefined;

      const { data, error } = await supabase
        .from('user_pdf_jargons')
        .select('jargons')
        .eq('user_id', userId)
        .eq('pdf_path', storagePath)
        .eq('prompt_name', promptName)
        .single();

      if (error?.code === 'PGRST116') {
        await extractAndStoreJargons(userId, storagePath, selectedPrompt, promptName);
      }

      navigate('/reader', { state: { storagePath } });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Uploaded PDFs
      </Typography>

      {loading && <CircularProgress />}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {files.map((file, idx) => (
          <Card key={idx} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{file.name}</Typography>
            </CardContent>
            <CardActions>
              <Button onClick={() => handleView(file.name)}>View</Button>
              <Button
                disabled={generatingIdx === idx}
                onClick={async () => {
                  setGeneratingIdx(idx);
                  const selectedPrompt = localStorage.getItem('selectedPrompt') || undefined;
                  const selectedPromptName = localStorage.getItem('selectedPromptName') || 'default';

                  const { data, error } = await supabase
                    .from('user_pdf_jargons')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('pdf_path', `${userId}/${file.name}`)
                    .eq('prompt_name', selectedPromptName)
                    .single();

                  if (data) {
                    alert('Explanations for this document with this prompt already exist.');
                    setGeneratingIdx(null);
                    return;
                  }

                  await extractAndStoreJargons(userId, `${userId}/${file.name}`, selectedPrompt, selectedPromptName);
                  alert('Explanations generated!');
                  setGeneratingIdx(null);
                }}
              >
                {generatingIdx === idx ? 'Generating...' : 'Generate with Prompt'}
              </Button>
              <Button color="error" onClick={() => handleDelete(file.name)}>
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </List>

      <Box sx={{ mt: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <label htmlFor="upload-pdf">
            <input
              style={{ display: 'none' }}
              id="upload-pdf"
              name="upload-pdf"
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
            />
            <Button variant="contained" component="span">
              Upload New PDF
            </Button>
          </label>
        </Stack>
      </Box>
    </Container>
  );
};

export default Upload;
