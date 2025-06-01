import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../LogInTab";
import './LogIn.css';

function LoginPage() {
  return (
    <>
      <h1
        style={{
          textAlign: "center",
        }}
      >
        Orbitals ToDoList
      </h1>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
      ></Auth>
    </>
  );
}

export default LoginPage;