import { Box, Button, Typography } from '@mui/material';
import { HomeOutlined as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', py: 12, px: 2 }}>
      <Typography variant="h1" sx={{ fontWeight: 800, color: 'text.disabled' }}>
        404
      </Typography>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        Not found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        The page you're looking for doesn't exist.
      </Typography>
      <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate('/')}>
        Back to home
      </Button>
    </Box>
  );
}