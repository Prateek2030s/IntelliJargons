// import React from 'react';
// import './ActualApp.css';
// import NavBar from '../Component/NavBar';
// import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
// import Home from './Home';
// import Upload from './Upload';
// import ReaderWrapper from './ReaderWrapper';
// import Glossary from './Glossary';
// import GenAI from './GenAI';
// import {Button} from '../Component/button'
// //import links to page

// import { useEffect, useState } from "react";
// import type { Session } from "@supabase/supabase-js";

// interface UserProps {
//   user: Session["user"];
// }

// function App() {    //will input user details here

//   return (
//     <>
//     <Router>
      
//       <NavBar />
//       <Routes>
//         <Route path = '/exact'/>
//         <Route path="/upload"   element={<Upload />} />
//         <Route path="/reader"   element={<ReaderWrapper />} />
//         <Route path="/glossary" element={<Glossary />} />
//         <Route path="/GenAI"    element={<GenAI />} />  
//       </Routes>
//     </Router>
//     </>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, Box, CssBaseline } from '@mui/material';

import NavBar from '../Component/NavBar';
import Home from './Home';
import Upload from './Upload';
import ReaderWrapper from './ReaderWrapper';
import Glossary from './Glossary';
import GenAI from './GenAI';

function App() {
  return (
    <Router>
      <CssBaseline /> {/* Reset browser styles for consistency */}
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#6d92eeff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <NavBar />

        {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Box
            sx={{
              backgroundColor: '#fff',
              padding: 3,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
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

export default App;

