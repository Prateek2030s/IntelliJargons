import React from 'react';
import './ActualApp.css';
import NavBar from '../Component/NavBar';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Home';
import Upload from './Upload';
import Reader from './Reader';
import Glossary from './Glossary';
import GenAI from './GenAI';
import {Button} from '../Component/button'
//import links to page

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

interface UserProps {
  user: Session["user"];
}

function App() {    //will input user details here

  return (
    <>
    <Router>
      
      <NavBar />
      <Routes>
        <Route path = '/exact'/>
        <Route path="/upload"   element={<Upload />} />
        <Route path="/reader"   element={<Reader />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/GenAI"    element={<GenAI />} />  
      </Routes>
    </Router>
    </>
  );
}

export default App;

