import { useState, useEffect } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import ActualApp from "./Page/ActualApp";
import LoginPage from "./Page/LogIn";

export const supabase = createClient(
  "https://ifdladrstacrdjykbofz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZGxhZHJzdGFjcmRqeWtib2Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MjkzNTAsImV4cCI6MjA2NDQwNTM1MH0.Qw0_WrOPvRloXf6nxyzzqotbCymnm9RtI70ILBblvfg"
);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return <LoginPage />;
  } else {
    return <ActualApp/>; //next patch will be App that takes in an input for user
  }
}
