import { useState, useEffect } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import ActualApp from "./Page/ActualApp";
import LoginPage from "./Page/LogIn";

export const supabase = createClient(
  "https://esskyretsubkvgeelcvj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzc2t5cmV0c3Via3ZnZWVsY3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NzA1ODEsImV4cCI6MjA2MzI0NjU4MX0.65U5znd8MqriyXmoEKl5FrENR1Wi-NjZcm0S5AlGkH8"
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
    return <ActualApp />;
  }
}
