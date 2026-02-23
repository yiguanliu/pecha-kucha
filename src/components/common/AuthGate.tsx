import { useState, useEffect, type ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { supabase } from '../../services/supabase';
import { signInWithEmail, signInWithPassword, signUpWithPassword, signInWithGoogle } from '../../services/authService';
import type { Session } from '@supabase/supabase-js';

type Mode = 'signin' | 'signup';

interface Props {
  children: ReactNode;
}

export default function AuthGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const resetStatus = () => {
    setError('');
    setInfo('');
    setMagicLinkSent(false);
  };

  const handleModeChange = (_: React.SyntheticEvent, value: Mode) => {
    setMode(value);
    resetStatus();
    setPassword('');
    setConfirmPassword('');
  };

  const handleSignIn = async () => {
    if (!email || !password) return;
    setSubmitting(true);
    resetStatus();
    try {
      await signInWithPassword(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSubmitting(true);
    resetStatus();
    try {
      await signUpWithPassword(email, password);
      setInfo('Account created! Check your email to confirm, then sign in.');
      setMode('signin');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    resetStatus();
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
      setSubmitting(false);
    }
    // On success the browser redirects, so no finally cleanup needed
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter your email first');
      return;
    }
    setSubmitting(true);
    resetStatus();
    try {
      await signInWithEmail(email);
      setMagicLinkSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send link');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading spinner ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
      </Box>
    );
  }

  // ── Already authenticated ────────────────────────────────────────────────────
  if (session) return <>{children}</>;

  // ── Auth page ────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Brand */}
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Pecha Kucha
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, fontSize: 14 }}>
            Share what's inspired you this week — AI prompts, exhibitions,
            plugins, random cool things.
          </Typography>

          {/* Tabs */}
          <Tabs
            value={mode}
            onChange={handleModeChange}
            sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Sign in" value="signin" sx={{ textTransform: 'none', fontWeight: 600 }} />
            <Tab label="Create account" value="signup" sx={{ textTransform: 'none', fontWeight: 600 }} />
          </Tabs>

          {/* Alerts */}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={resetStatus}>{error}</Alert>}
          {info && <Alert severity="success" sx={{ mb: 2 }} onClose={resetStatus}>{info}</Alert>}
          {magicLinkSent && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Magic link sent — check your email.
            </Alert>
          )}

          {/* Email (shared) */}
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            autoFocus
            autoComplete="email"
          />

          {/* Password */}
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && mode === 'signin' && handleSignIn()}
            sx={{ mb: mode === 'signup' ? 2 : 3 }}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                    {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm password — sign up only */}
          {mode === 'signup' && (
            <TextField
              label="Confirm password"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
              sx={{ mb: 3 }}
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirmPassword((v) => !v)} edge="end">
                      {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}

          {/* Primary action */}
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={mode === 'signin' ? handleSignIn : handleSignUp}
            disabled={submitting || !email || !password || (mode === 'signup' && !confirmPassword)}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : mode === 'signin' ? 'Sign in' : 'Create account'}
          </Button>

          {/* Social + magic link options */}
          {!magicLinkSent && (
            <>
              <Divider sx={{ my: 2.5 }}>
                <Typography variant="caption" color="text.secondary">or</Typography>
              </Divider>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={handleGoogleSignIn}
                disabled={submitting}
                sx={{ mb: 1 }}
              >
                Continue with Google
              </Button>
              {mode === 'signin' && (
                <>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleMagicLink}
                    disabled={submitting || !email}
                  >
                    Send magic link instead
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    We'll email you a one-click sign-in link — no password needed.
                  </Typography>
                </>
              )}
            </>
          )}

          {/* Footer hint */}
          {mode === 'signin' && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
              No account yet?{' '}
              <Link component="button" variant="caption" onClick={() => handleModeChange({} as React.SyntheticEvent, 'signup')}>
                Create one
              </Link>
            </Typography>
          )}
          {mode === 'signup' && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
              Already have an account?{' '}
              <Link component="button" variant="caption" onClick={() => handleModeChange({} as React.SyntheticEvent, 'signin')}>
                Sign in
              </Link>
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
