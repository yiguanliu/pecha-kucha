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
} from '@mui/material';
import { supabase } from '../../services/supabase';
import { signInWithEmail } from '../../services/authService';
import type { Session } from '@supabase/supabase-js';

interface Props {
  children: ReactNode;
}

export default function AuthGate({ children }: Props) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleSignIn = async () => {
    if (!email) return;
    setSubmitting(true);
    setError('');
    try {
      await signInWithEmail(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send link');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
          px: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Pecha Kucha
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Share what's inspired you this week — AI prompts, exhibitions,
              plugins, random cool things. Sign in with your work email.
            </Typography>

            {!sent ? (
              <>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <TextField
                  label="Work email"
                  type="email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  sx={{ mb: 2 }}
                  autoFocus
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSignIn}
                  disabled={submitting || !email}
                  size="large"
                >
                  {submitting ? 'Sending...' : 'Send magic link'}
                </Button>
              </>
            ) : (
              <Alert severity="success">
                Check your email for a sign-in link. You can close this tab.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
}
