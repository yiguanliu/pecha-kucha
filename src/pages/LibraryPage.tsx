import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Box,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router';
import type { Presentation } from '../types/presentation';
import { getPublishedPresentations } from '../services/presentationService';
import InspirationCard from '../components/library/InspirationCard';

export default function LibraryPage() {
  const navigate = useNavigate();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getPublishedPresentations()
      .then(setPresentations)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load inspirations');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = presentations.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.authorName.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Inspiration Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            5 slides · 20 seconds each · share what caught your eye this week
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/editor/new')}
        >
          New Presentation
        </Button>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title, author, or tag..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 4 }}
        size="small"
      />

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check your Supabase credentials in .env.local
          </Typography>
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {search ? 'No results found' : 'No inspirations shared yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {search
              ? 'Try a different search term'
              : 'Be the first to share something that inspired you this week!'}
          </Typography>
          {!search && (
            <Button variant="contained" onClick={() => navigate('/editor/new')}>
              Create your first
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filtered.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <InspirationCard presentation={p} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
