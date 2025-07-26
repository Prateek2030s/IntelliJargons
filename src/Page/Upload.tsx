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
