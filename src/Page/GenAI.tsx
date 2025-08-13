// import React, { useEffect, useState } from 'react'
// import { supabase } from '../App'
// import { extractAndStoreJargons } from '../Component/PdfExplainer'

// interface UserPrompt {
//   id: number
//   user_id: string
//   prompt: string
//   prompt_name: string
// }


// // Helper to check if a file is empty
// async function isPdfEmpty(storagePath: string): Promise<boolean> {
//   const { data: fileBlob, error: fileErr } = await supabase
//     .storage
//     .from('pdfs')
//     .download(storagePath);
//   if (fileErr || !fileBlob) return true;
//   return fileBlob.size === 0;
// }

// const GenAI = () => {
//   const [storagePath, setStoragePath]           = useState<string>('')
//   const [prompts, setPrompts]                   = useState<UserPrompt[]>([])
//   const [selectedPrompt, setSelectedPrompt]     = useState<UserPrompt | null>(null)
//   const [newPromptName, setNewPromptName]       = useState('')
//   const [newPromptText, setNewPromptText]       = useState('')
//   const [status, setStatus]                     = useState('')

//   // Helper to get the current user's ID
//   const getUserId = async (): Promise<string> => {
//     const { data: { session }, error } = await supabase.auth.getSession()
//     if (error || !session?.user) {
//       throw new Error(error?.message || 'Not signed in')
//     }
//     return session.user.id
//   }

//   // On mount: fetch the latest PDF path and user prompts
//   useEffect(() => {
//     ;(async () => {
//       setStatus('Loading…')
//       try {
//         const uid = await getUserId()
//         // 1. Fetch the user's current PDF path
//         const { data: pdfData, error: pdfErr } = await supabase
//           .from('user_pdf_jargons')
//           .select('pdf_path')
//           .eq('user_id', uid)
//           .order('created_at', { ascending: false })
//           .limit(1)
//           .single()
//         if (pdfErr || !pdfData?.pdf_path) {
//           throw new Error(pdfErr?.message || 'No PDF found')
//         }
//         setStoragePath(pdfData.pdf_path)

//         // Fetch prompts for this user
//         const { data, error } = await supabase
//           .from('user_prompts')
//           .select('*')
//           .eq('user_id', uid)
//         if (error) {
//           throw error
//         }
//         setPrompts(data as UserPrompt[])
//         setStatus('')
//       } catch (err: any) {
//         setStatus('Error: ' + err.message)
//       }
//     })()
//   }, [])

//   // Create a new prompt for the current user
//   const handleCreatePrompt = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus('Saving prompt…');
//     try {
//       const uid = await getUserId();
//       const { error } = await supabase
//         .from('user_prompts')
//         .insert({ user_id: uid, prompt: newPromptText, prompt_name: newPromptName });
//       if (error) throw error;
//       setNewPromptName('');
//       setNewPromptText('');
//       // Refresh list
//       const { data } = await supabase
//         .from('user_prompts')
//         .select('*')
//         .eq('user_id', uid);
//       setPrompts(data as UserPrompt[]);
//       setStatus('Prompt saved!');
//     } catch (err: any) {
//       setStatus('Error: ' + err.message);
//     }
//   };

//   // Use the selected prompt to process the PDF
//   const handleUsePrompt = async () => {
//     if (!selectedPrompt) return;
//     // Check if the uploaded file is empty
//     if (!storagePath) {
//       setStatus('No PDF found.');
//       return;
//     }
//     if (await isPdfEmpty(storagePath)) {
//       setStatus('Prompt denied: The uploaded file is empty.');
//       return;
//     }
//     localStorage.setItem('selectedPrompt', selectedPrompt.prompt);
//     localStorage.setItem('selectedPromptName', selectedPrompt.prompt_name);
//     setStatus('Prompt selected! You can now upload a PDF.');
//   };

//   // Unselect the current prompt and use default
//   const handleUnselectPrompt = () => {
//     setSelectedPrompt(null);
//     localStorage.removeItem('selectedPrompt');
//     localStorage.setItem('selectedPromptName', 'Default');
//     setStatus('Default prompt in use.');
//   }

//   // Add this function inside your GenAI component
//   const handleDeletePrompt = async (promptId: number) => {
//     setStatus('Deleting prompt…');
//     try {
//       const { error } = await supabase
//         .from('user_prompts')
//         .delete()
//         .eq('id', promptId);
//       if (error) throw error;
//       // Refresh list
//       const uid = await getUserId();
//       const { data } = await supabase
//         .from('user_prompts')
//         .select('*')
//         .eq('user_id', uid);
//       setPrompts(data as UserPrompt[]);
//       setStatus('Prompt deleted!');
//       // Unselect if the deleted prompt was selected
//       if (selectedPrompt?.id === promptId) {
//         setSelectedPrompt(null);
//         localStorage.removeItem('selectedPrompt');
//         localStorage.setItem('selectedPromptName', 'Default');
//       }
//     } catch (err: any) {
//       setStatus('Error: ' + err.message);
//     }
//   };

//   return (
//     <div>
//       <h1>GenAI Prompt Portal</h1>
//       <div style={{ display: 'flex', gap: 40 }}>
//         <div>
//           <h3>Your Prompts</h3>
//           <button
//             style={{ marginBottom: 16, background: '#eee', color: '#333', border: '1px solid #ccc' }}
//             onClick={handleUnselectPrompt}
//             disabled={!selectedPrompt}
//           >
//             Unselect Prompt (Use Default)
//           </button>
//           {prompts.map(p => (
//             <div key={p.id} style={{ marginBottom: 10 }}>
//               <button onClick={() => setSelectedPrompt(p)}>
//                 {p.prompt_name}
//               </button>
//               {selectedPrompt?.id === p.id && (
//                 <div style={{ marginTop: 5, padding: '5px 10px', background: '#f4f4f4' }}>
//                   <strong>Prompt:</strong>
//                   <div>{p.prompt}</div>
//                   <button style={{ marginTop: 5 }} onClick={handleUsePrompt}>
//                     Use this prompt
//                   </button>
//                   <button style={{ marginTop: 5, marginLeft: 8, background: 'red', color: 'white' }} onClick={() => handleDeletePrompt(p.id)}>
//                     Delete this prompt
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//         <div>
//           <h3>Create New Prompt</h3>
//           <form onSubmit={handleCreatePrompt}>
//             <input
//               type="text"
//               placeholder="Prompt Name"
//               value={newPromptName}
//               onChange={e => setNewPromptName(e.target.value)}
//               required
//               style={{ width: '100%', marginBottom: 8 }}
//             />
//             <textarea
//               placeholder="Prompt Text"
//               value={newPromptText}
//               onChange={e => setNewPromptText(e.target.value)}
//               rows={4}
//               cols={40}
//               required
//               style={{ width: '100%', marginBottom: 8 }}
//             />
//             <br />
//             <button type="submit">Save Prompt</button>
//           </form>
//         </div>
//       </div>
//       <p>{status}</p>
//     </div>
//   )
// }

// export default GenAI
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import { supabase } from '../App';
import { extractAndStoreJargons } from '../Component/PdfExplainer';

interface UserPrompt {
  id: number;
  user_id: string;
  prompt: string;
  prompt_name: string;
}

async function isPdfEmpty(storagePath: string): Promise<boolean> {
  const { data: fileBlob, error: fileErr } = await supabase
    .storage
    .from('pdfs')
    .download(storagePath);
  if (fileErr || !fileBlob) return true;
  return fileBlob.size === 0;
}

const GenAI = () => {
  const [storagePath, setStoragePath] = useState<string>('');
  const [prompts, setPrompts] = useState<UserPrompt[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<UserPrompt | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [status, setStatus] = useState('');

  const getUserId = async (): Promise<string> => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      throw new Error(error?.message || 'Not signed in');
    }
    return session.user.id;
  };

  useEffect(() => {
    (async () => {
      setStatus('Loading…');
      try {
        const uid = await getUserId();

        const { data: pdfData, error: pdfErr } = await supabase
          .from('user_pdf_jargons')
          .select('pdf_path')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if (pdfErr || !pdfData?.pdf_path) {
          throw new Error(pdfErr?.message || 'No PDF found');
        }
        setStoragePath(pdfData.pdf_path);

        const { data, error } = await supabase
          .from('user_prompts')
          .select('*')
          .eq('user_id', uid);
        if (error) throw error;
        setPrompts(data as UserPrompt[]);
        setStatus('');
      } catch (err: any) {
        setStatus('Error: ' + err.message);
      }
    })();
  }, []);

  const handleCreatePrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving prompt…');
    try {
      const uid = await getUserId();
      const { error } = await supabase
        .from('user_prompts')
        .insert({ user_id: uid, prompt: newPromptText, prompt_name: newPromptName });
      if (error) throw error;

      setNewPromptName('');
      setNewPromptText('');

      const { data } = await supabase
        .from('user_prompts')
        .select('*')
        .eq('user_id', uid);
      setPrompts(data as UserPrompt[]);
      setStatus('Prompt saved!');
    } catch (err: any) {
      setStatus('Error: ' + err.message);
    }
  };

  const handleUsePrompt = async () => {
    if (!selectedPrompt) return;
    if (!storagePath) {
      setStatus('No PDF found.');
      return;
    }
    if (await isPdfEmpty(storagePath)) {
      setStatus('Prompt denied: The uploaded file is empty.');
      return;
    }
    localStorage.setItem('selectedPrompt', selectedPrompt.prompt);
    localStorage.setItem('selectedPromptName', selectedPrompt.prompt_name);
    setStatus('Prompt selected! You can now upload a PDF.');
  };

  const handleUnselectPrompt = () => {
    setSelectedPrompt(null);
    localStorage.removeItem('selectedPrompt');
    localStorage.setItem('selectedPromptName', 'Default');
    setStatus('Default prompt in use.');
  };

  const handleDeletePrompt = async (promptId: number) => {
    setStatus('Deleting prompt…');
    try {
      const { error } = await supabase
        .from('user_prompts')
        .delete()
        .eq('id', promptId);
      if (error) throw error;

      const uid = await getUserId();
      const { data } = await supabase
        .from('user_prompts')
        .select('*')
        .eq('user_id', uid);
      setPrompts(data as UserPrompt[]);
      setStatus('Prompt deleted!');

      if (selectedPrompt?.id === promptId) {
        setSelectedPrompt(null);
        localStorage.removeItem('selectedPrompt');
        localStorage.setItem('selectedPromptName', 'Default');
      }
    } catch (err: any) {
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>GenAI Prompt Portal</Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>

        {/* Prompt List */}
        <Box flex={1}>
          <Typography variant="h6">Your Prompts</Typography>
          <Button
            onClick={handleUnselectPrompt}
            disabled={!selectedPrompt}
            variant="outlined"
            sx={{ mt: 2, mb: 2 }}
          >
            Unselect Prompt (Use Default)
          </Button>

          {prompts.map(p => (
            <Paper key={p.id} sx={{ p: 2, mb: 2 }} elevation={3}>
              <Typography variant="subtitle1" fontWeight="bold">
                {p.prompt_name}
              </Typography>
              <Button variant="text" onClick={() => setSelectedPrompt(p)}>
                {selectedPrompt?.id === p.id ? 'Selected' : 'View Prompt'}
              </Button>
              {selectedPrompt?.id === p.id && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{p.prompt}</Typography>
                  <Stack direction="row" spacing={2} mt={2}>
                    <Button variant="contained" onClick={handleUsePrompt}>Use this prompt</Button>
                    <Button variant="outlined" color="error" onClick={() => handleDeletePrompt(p.id)}>
                      Delete this prompt
                    </Button>
                  </Stack>
                </Box>
              )}
            </Paper>
          ))}
        </Box>

        {/* Create Prompt Form */}
        <Box flex={1}>
          <Typography variant="h6">Create New Prompt</Typography>
          <Paper sx={{ p: 3, mt: 2 }} elevation={3}>
            <form onSubmit={handleCreatePrompt}>
              <TextField
                label="Prompt Name"
                value={newPromptName}
                onChange={e => setNewPromptName(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
              />
              <TextField
                label="Prompt Text"
                value={newPromptText}
                onChange={e => setNewPromptText(e.target.value)}
                fullWidth
                multiline
                minRows={4}
                required
                sx={{ mb: 2 }}
              />
              <Button type="submit" variant="contained">Save Prompt</Button>
            </form>
          </Paper>
        </Box>
      </Stack>

      {/* Status Message */}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
        {status}
      </Typography>
    </Box>
  );
};

export default GenAI;

