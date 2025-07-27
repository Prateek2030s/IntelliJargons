import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../App";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import PsychologyIcon from "@mui/icons-material/Psychology";

function LogIn() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f27575ff, #3387ccff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <Grid
          container
          direction={isMobile ? "column" : "row"}
          sx={{ width: "100%" }}
        >
          {/* Left: Description */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#ffffffcc",
              p: { xs: 3, sm: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: isMobile ? "100%" : "50%",
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <img
                src="/il.png"
                alt="IntelliJargons Logo"
                style={{
                  height: 60,
                  marginRight: 12,
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
              <Typography
                variant={isMobile ? "h4" : "h3"}
                color="primary"
                fontWeight="bold"
              >
                IntelliJargons
              </Typography>
            </Box>

            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ fontStyle: "italic" }}
            >
              Decode complexity. Understand faster.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Stack spacing={3}>
              <Box display="flex" alignItems="center">
                <DescriptionIcon sx={{ mr: 2, fontSize: 24, color: "#1565c0" }} />
                <Typography fontSize={16}>Upload PDFs to extract jargon.</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <MenuBookIcon sx={{ mr: 2, fontSize: 24, color: "#1565c0" }} />
                <Typography fontSize={16}>Reader highlights important terms.</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <AutoStoriesIcon sx={{ mr: 2, fontSize: 24, color: "#1565c0" }} />
                <Typography fontSize={16}>Glossary for every document.</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <PsychologyIcon sx={{ mr: 2, fontSize: 24, color: "#1565c0" }} />
                <Typography fontSize={16}>
                  GenAI prompts to personalize learning.
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Right: Sign In */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#f5faff",
              p: { xs: 3, sm: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: isMobile ? "100%" : "50%",
            }}
          >
            <Typography
              variant={isMobile ? "h5" : "h4"}
              gutterBottom
              fontWeight="bold"
            >
              Sign in to your account
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Secured access to your personalized glossary tools.
            </Typography>

            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#1472d0ff",
                      brandAccent: "#1565c0",
                      inputBackground: "#e6f2feff",
                    },
                  },
                },
              }}
              providers={[]}
            />
          </Box>
        </Grid>
      </Paper>
    </Box>
  );
}

export default LogIn;
