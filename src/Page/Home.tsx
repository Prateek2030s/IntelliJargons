
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid'; 
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import SmartToyIcon from '@mui/icons-material/SmartToy';


const features = [
  {
    title: 'Upload',
    description: 'Upload your files to start generating explanations.',
    icon: <CloudUploadIcon fontSize="large" color="primary" />,
    path: '/upload',
  },
  {
    title: 'Reader',
    description: 'View your PDFs with jargon highlighted and explained.',
    icon: <MenuBookIcon fontSize="large" color="primary" />,
    path: '/reader',
  },
  {
    title: 'Glossary',
    description: 'Browse all extracted terms and their explanations.',
    icon: <LibraryBooksIcon fontSize="large" color="primary" />,
    path: '/glossary',
  },
  {
    title: 'Gen AI',
    description: 'Customize AI prompts for better glossary generation.',
    icon: <SmartToyIcon fontSize="large" color="primary" />,
    path: '/GenAI',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb:20 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome to IntelliJargons
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
        Your AI-powered glossary assistant for Documents
      </Typography>

      <Grid container spacing={4} sx={{ mt: 3 }}>
        {features.map((feature) => (
          <Grid size={{ xs: 12, sm: 6, md: 3}} > 
            <Card
              variant="outlined"
              sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}
            >
              <CardActionArea onClick={() => navigate(feature.path)} sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box mb={2}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Home;
