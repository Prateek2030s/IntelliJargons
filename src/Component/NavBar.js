import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { supabase } from '../App';

function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPromptName, setCurrentPromptName] = useState('default');
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      const name = localStorage.getItem('selectedPromptName') || 'default';
      setCurrentPromptName(name);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    navigate('/LogIn');
  };

  const navLinks = [
    { text: 'Home', path: '/home', icon: <HomeIcon /> },
    { text: 'Upload', path: '/upload', icon: <CloudUploadIcon /> },
    { text: 'Reader', path: '/reader', icon: <MenuBookIcon /> },
    { text: 'Glossary', path: '/glossary', icon: <LibraryBooksIcon /> },
    { text: 'Gen AI', path: '/GenAI', icon: <PsychologyIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
      <List>
        {navLinks.map((item) => (
          <ListItem
            button
            key={item.text}
            component={RouterLink}
            to={item.path}
          >
            {item.icon}
            <ListItemText primary={item.text} sx={{ ml: 2 }} />
          </ListItem>
        ))}
        <ListItem
          button
          onClick={handleLogOut}
          sx={{ mt: 2, color: 'error.main' }}
        >
          <LogoutIcon sx={{ mr: 1 }} />
          <ListItemText primary="Log out" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box
            component={RouterLink}
            to="/home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'white',
            }}
          >
            <img src="/il.png" alt="Logo" style={{ height: 60, marginRight: 8 }} />
            <Typography variant="h4" fontWeight="bold">
              IntelliJargons
            </Typography>
          </Box>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navLinks.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                color="inherit"
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogOut}
            >
              Log out
            </Button>
          </Box>

          {/* Prompt Display */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, ml: 2 }}>
            <Typography variant="body2" sx={{ color: '#e9f2f8ff', fontWeight: 'bold' }}>
              Prompt: {currentPromptName}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default NavBar;

