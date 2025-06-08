import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../App";

function LogIn() {
  return (
  <>
    <h1
      style = {{
        textAlign: "center",
      }}
    >
        IntelliJargons
        </h1>

        <Auth 
          supabaseClient={supabase} 
          appearance={{theme: ThemeSupa}} 
          providers={[]}
          />
  </>
  );
}

export default LogIn;