import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { RefreshOutlined as RefreshIcon } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { TicketList } from '@/components/tickets/TicketList';
import { dashboardService, summarizeTickets } from '@/services/dashboard.api';
import { ApiError } from '@/api/ApiError';
import { useAuth } from '@/context/useAuth';
import { MESSAGES } from '@/utils/messages';
import type { Ticket } from '@/types/ticket';

type StatColor = 'primary' | 'info' | 'success' | 'error';

function StatCard({ label, value, color }: { label: string; value: number; color: StatColor }) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, color: `${color}.main` }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

/**
 * Manager-only assigned-tickets list (`/assigned`): tickets raised by users
 * assigned to the logged-in manager (backend relationship, never hardcoded).
 * The table is View-only; View navigates to `/tickets/:id` where
 * Approve/Reject live behind a confirmation dialog. Stats derive from the
 * fetched list and refresh whenever the data is refetched.
 */
export function ManagerDashboard() {
  const { username } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getDashboardData();
      setTickets(data.tickets);
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  // Stats derive from the ticket list, so they refresh with every fetch.
  const stats = useMemo(() => summarizeTickets(tickets), [tickets]);

  const openTicket = (ticket: Ticket) => {
    if (ticket.id != null) {
      navigate(`/tickets/${ticket.id}`);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Assigned Tickets"
        subtitle={
          username
            ? `Tickets raised by users assigned to you (${username}).`
            : 'Tickets raised by users assigned to you.'
        }
        actions={
          <Button startIcon={<RefreshIcon />} color="inherit" onClick={() => void loadTickets()}>
            Refresh
          </Button>
        }
      />

      <ErrorBanner error={error} onRetry={() => void loadTickets()} />

      {!loading ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label={MESSAGES.dashboard.stats.total} value={stats.total} color="primary" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label={MESSAGES.dashboard.stats.open} value={stats.open} color="info" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label={MESSAGES.dashboard.stats.approved}
              value={stats.approved}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label={MESSAGES.dashboard.stats.rejected}
              value={stats.rejected}
              color="error"
            />
          </Grid>
        </Grid>
      ) : null}

      <TicketList
        tickets={tickets}
        loading={loading}
        showUser
        showCategory={false}
        emptyTitle={MESSAGES.dashboard.empty}
        emptyDescription={MESSAGES.dashboard.emptyDescription}
        onView={openTicket}
      />
    </Box>
  );
}
