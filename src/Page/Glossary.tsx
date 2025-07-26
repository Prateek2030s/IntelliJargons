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
