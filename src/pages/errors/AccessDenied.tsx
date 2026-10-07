import { Box, Button, Stack, Typography } from '@mui/material';
import { ArrowBackOutlined as BackIcon, HomeOutlined as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/routes';

/**
 * 403 page rendered when an authenticated user lacks the required role.
 * Reached via RoleRoute (see `src/components/guards/RoleRoute.tsx`).
 * Backend remains the final authority — this page is UX only.
 */
export function AccessDenied() {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: 'center', py: 12, px: 2 }}>
      <Typography variant="h1" sx={{ fontWeight: 800, color: 'error.main' }}>
        403
      </Typography>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
        403 - Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        You don&apos;t have permission to view this page.
      </Typography>
      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
        <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate(-1)}>
          Go back
        </Button>
        <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate(ROUTES.dashboard)}>
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
  );
}
