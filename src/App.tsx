import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient, Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import './index.css'
import LogIn from "./Page/LogIn";
import ActualApp from "./Page/ActualApp";



  export const supabase = createClient('https://swwrcuscnlrmwerlhtar.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3d3JjdXNjbmxybXdlcmxodGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTk4NDgsImV4cCI6MjA2NDY5NTg0OH0.D7zUdxLaZwUmN66qNaL4HiwryHUGZBt5lNpwND2HAc4')


  export default function App() {
    const [session, setSession] = useState< Session | null >(null)

    useEffect(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session)
      })

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

      return () => subscription.unsubscribe()
    }, [])

    if (!session) {
      return <LogIn />
    }
    else {
      return <ActualApp />
    }

}
// App.tsx
// import { createClient, Session } from '@supabase/supabase-js';
// import { useEffect, useState } from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { CssBaseline } from '@mui/material';

// import Entry from './Page/Entry';
// import LogIn from './Page/LogIn';
// import ActualApp from './Page/ActualApp';

// export const supabase = createClient(
//   'https://swwrcuscnlrmwerlhtar.supabase.co',
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3d3JjdXNjbmxybXdlcmxodGFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMTk4NDgsImV4cCI6MjA2NDY5NTg0OH0.D7zUdxLaZwUmN66qNaL4HiwryHUGZBt5lNpwND2HAc4'
// );

// export default function App() {
//   const [session, setSession] = useState<Session | null>(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   return (
//     <Router>
//       <CssBaseline />
//       <Routes>
//         <Route path="/" element={<Entry />} />
//         <Route path="/LogIn" element={session ? <Navigate to="/home" /> : <LogIn />} />
//         <Route path="/*" element={session ? <ActualApp /> : <Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }
// App.tsx
// import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
// import { createClient } from '@supabase/supabase-js';
// import { useEffect, useState } from 'react';
// import { Session } from '@supabase/supabase-js';

// import Entry from './Page/Entry';
// import LogIn from './Page/LogIn';
// import Home from './Page/Home';
// import Upload from './Page/Upload';
// import ReaderWrapper from './Page/ReaderWrapper';
// import Glossary from './Page/Glossary';
// import GenAI from './Page/GenAI';
// import NavBar from './Component/NavBar';

// export const supabase = createClient('https://swwrcuscnlrmwerlhtar.supabase.co', 
//   'your-anon-key'); // 

// export default function App() {
//   const [session, setSession] = useState<Session | null>(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   return (
//     <Router>
//       {session && <NavBar />} {/* Show navbar only when logged in */}
//       <Routes>
//         <Route path="/" element={<Entry />} />
//         <Route path="/login" element={<LogIn />} />
//         {session && (
//           <>
//             <Route path="/home" element={<Home />} />
//             <Route path="/upload" element={<Upload />} />
//             <Route path="/reader" element={<ReaderWrapper />} />
//             <Route path="/glossary" element={<Glossary />} />
//             <Route path="/genai" element={<GenAI />} />
//           </>
//         )}
//       </Routes>
//     </Router>
//   );
// }

