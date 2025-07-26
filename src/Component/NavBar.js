import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Button, Drawer, List, ListItem, ListItemText, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { supabase } from '../App';

function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentPromptName, setCurrentPromptName] = useState('default');

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

  const navigate = useNavigate();

  const handleLogOut = async () => {
    // const { error } = await supabase.auth.signOut({ scope: 'local' });
    // if (error) {
    //   console.error('Error logging out: ' + error.message);
    // }
    await supabase.auth.signOut();
    navigate('/LogIn');
  };

  const navLinks = [
    { text: 'Home', path: '/home'},
    { text: 'Upload', path: '/upload' },
    { text: 'Reader', path: '/reader' },
    { text: 'Glossary', path: '/glossary' },
    { text: 'Gen AI', path: '/GenAI' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ width: 250 }}>
      <List>
        {navLinks.map((item) => (
          <ListItem button key={item.text} component={RouterLink} to={item.path}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo / Title */}
          <Typography
            variant="h4"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            IntelliJargons
          </Typography>

          {/* Mobile Menu Icon */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Desktop Navigation Links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {navLinks.map((item) => (
              <Button
                key={item.text}
                component={RouterLink}
                to={item.path}
                color="inherit"
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

      {/* Drawer for Mobile */}
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
