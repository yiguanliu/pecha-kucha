import { AppBar, Toolbar, Typography, Button, Stack, IconButton, Tooltip } from '@mui/material';
import { Link, useNavigate } from 'react-router';
import AddIcon from '@mui/icons-material/Add';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { signOut } from '../../services/authService';
import { useThemeMode } from '../../context/ThemeContext';

export default function AppHeader() {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Pecha Kucha
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton size="small" onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
              {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/editor/new')}
            size="small"
          >
            New
          </Button>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={handleSignOut} sx={{ color: 'text.secondary' }}>
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
