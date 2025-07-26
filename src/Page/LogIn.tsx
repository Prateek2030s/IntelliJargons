import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../App";
import { Box, Typography, Paper, Container } from "@mui/material";

function LogIn() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f27575ff, #3387ccff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 10, textAlign: "center" }}>
          <Typography variant="h3" gutterBottom color="primary">
            IntelliJargons
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Welcome! Please sign in to continue.
          </Typography>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1472d0ff',
                    brandAccent: '#1565c0',
                    inputBackground: '#e6f2feff',
                  },
                },
              },
            }}
            providers={[]}
          />
        </Paper>
      </Container>
    </Box>
  );
}

export default LogIn;
