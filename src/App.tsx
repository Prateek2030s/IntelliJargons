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
