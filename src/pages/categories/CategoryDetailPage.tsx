import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { ArrowBackOutlined as BackIcon } from '@mui/icons-material';
import { CategoryOutlined as CategoryIcon } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { PageLoader } from '@/components/common/PageLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { TicketList } from '@/components/tickets/TicketList';
import { categoryService } from '@/services/category.api';
import { ApiError } from '@/api/ApiError';
import type { Category } from '@/types/category';
import type { Ticket } from '@/types/ticket';

function parseId(raw: string | undefined): number | null {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export function CategoryDetailPage() {
  const { id: rawId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState<Category | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const id = parseId(rawId);

  const load = useCallback(async () => {
    if (id == null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [categoryData, ticketsData] = await Promise.all([
        categoryService.getById(id),
        categoryService.getTickets(id),
      ]);
      setCategory(categoryData);
      setTickets(ticketsData);
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (id == null) {
    return <Navigate to="/categories" replace />;
  }

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Box>
      <PageHeader title="Category detail" />
      <ErrorBanner error={error} onRetry={() => void load()} />

      {category ? (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ mb: 3, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              {category.name}
            </Typography>
            <Chip label={`SLA: ${category.slaHours} hours`} variant="outlined" size="small" />
            {category.ticketCount != null ? (
              <Chip label={`${category.ticketCount} tickets`} size="small" />
            ) : (
              <Chip label={`${tickets.length} tickets`} size="small" />
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Button startIcon={<BackIcon />} onClick={() => navigate('/categories')} color="inherit">
              Back to categories
            </Button>
          </Stack>
          <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Tickets assigned to this category.
            </Typography>
          </Paper>
        </>
      ) : null}

      {!error ? <TicketList tickets={tickets} showCategory={false} /> : null}
      {error?.status === 404 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={<CategoryIcon fontSize="large" />}
            title="Category not found"
            description="It may have been deleted or you followed an invalid link."
          />
        </Paper>
      ) : null}
    </Box>
  );
}