import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import { supabase } from '../App';
import WordDefinition from '../Component/WordDefinition';
import TextLayer from '../Component/TextLayer';
import { Box, Typography, IconButton, Divider, List, ListItem, Paper, CircularProgress, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

export interface ReaderProps {
  storagePath: string;
  onBack?: () => void;
}

interface JargonItem {
  term: string;
  explanation: string;
}

const DEFAULT_WIDTH = 600;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.2;

function getCurrentPromptName() {
  return localStorage.getItem('selectedPromptName') || 'default';
}

async function extractTextFromPdf(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n\n';
  }
  return fullText;
}

const Reader: React.FC<ReaderProps> = ({ storagePath, onBack }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageMap, setPageMap] = useState<Record<number, pdfjs.PDFPageProxy>>({});
  const [jargons, setJargons] = useState<JargonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: blob, error: dlErr } = await supabase.storage.from('pdfs').download(storagePath);
      if (dlErr || !blob) {
        setError(dlErr?.message ?? 'Failed to download PDF');
        setLoading(false);
        return;
      }
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
      await extractTextFromPdf(blob);

      const { data: { session }, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !session?.user) {
        setError(sessErr?.message ?? 'Not signed in');
        setLoading(false);
        return;
      }

      const promptName = getCurrentPromptName();
      const { data, error: jqErr } = await supabase
        .from('user_pdf_jargons')
        .select('jargons')
        .eq('user_id', session.user.id)
        .eq('pdf_path', storagePath)
        .eq('prompt_name', promptName)
        .single();
      if (jqErr) {
        setError(jqErr.message);
      } else if (data?.jargons) {
        setJargons((data as { jargons: JargonItem[] }).jargons);
      }
      setLoading(false);
    })();
  }, [storagePath]);

  useEffect(() => {
    const updateWidth = () => {
      if (pdfContainerRef.current) {
        setContainerWidth(pdfContainerRef.current.offsetWidth || DEFAULT_WIDTH);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const pageWidth = containerWidth * zoom;

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!blobUrl) return null;

  return (
    <Box display="flex" height="100vh">
      <Box flex={1} overflow="auto" p={2}>
        {onBack && (
          <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ mb: 2 }}>
            Back
          </Button>
        )}

        <Typography variant="h5" gutterBottom>PDF Reader</Typography>

        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))} disabled={zoom <= MIN_ZOOM}>
            <ZoomOutIcon />
          </IconButton>
          <Typography sx={{ mx: 2 }}>{Math.round(zoom * 100)}%</Typography>
          <IconButton onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))} disabled={zoom >= MAX_ZOOM}>
            <ZoomInIcon />
          </IconButton>
        </Box>

        <Box ref={pdfContainerRef} position="relative" bgcolor="#fff">
          <Document
            file={blobUrl}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            loading={<Typography>Rendering PDF…</Typography>}
            error={<Typography color="error">Failed to render PDF.</Typography>}
          >
            {Array.from({ length: numPages }).map((_, index) => {
              const pageNumber = index + 1;
              return (
                <Box key={pageNumber} position="relative" mb={3}>
                  <Page
                    pageNumber={pageNumber}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={(page: pdfjs.PDFPageProxy) =>
                      setPageMap(prev => ({ ...prev, [pageNumber]: page }))
                    }
                  />
                  {pageMap[pageNumber] && (
                    <TextLayer
                      page={pageMap[pageNumber]}
                      jargons={jargons}
                      width={pageWidth}
                    />
                  )}
                </Box>
              );
            })}
          </Document>
        </Box>
      </Box>

      <Divider orientation="vertical" flexItem />

      <Box width={300} bgcolor="#fafafa" p={2} overflow="auto">
        <Typography variant="h6">Jargon Terms</Typography>
        {jargons.length === 0 ? (
          <Typography>No terms available.</Typography>
        ) : (
          <List>
            {jargons.map((j, idx) => (
              <ListItem key={idx} disablePadding sx={{ mb: 1 }}>
                <WordDefinition definition={j.explanation}>{j.term}</WordDefinition>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default Reader;
