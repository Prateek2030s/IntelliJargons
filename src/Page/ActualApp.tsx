//just a bunch of routers
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box, CssBaseline } from '@mui/material';

import NavBar from '../Component/NavBar';
import Home from './Home';
import Upload from './Upload';
import ReaderWrapper from './ReaderWrapper';
import Glossary from './Glossary';
import GenAI from './GenAI';
import LogIn from './LogIn';

function ActualApp() {
  return (
    <Router>
      <CssBaseline /> {/* Reset browser styles for consistency */}
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#dee37aff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <NavBar />

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              backgroundColor: '#ffffffff',
              padding: 10,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/LogIn" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/reader" element={<ReaderWrapper />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/GenAI" element={<GenAI />} />
            </Routes>
          </Box>
        </Container>
      </Box>
    </Router>
  );
}

export default ActualApp;

