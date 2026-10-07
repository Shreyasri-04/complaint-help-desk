import { useCallback, useEffect, useState } from 'react';
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
import { TablePaginationBar } from '@/components/common/TablePaginationBar';
import { TicketList } from '@/components/tickets/TicketList';
import { ticketService } from '@/services/ticket.api';
import { dashboardService } from '@/services/dashboard.api';
import type { DashboardStats } from '@/services/dashboard.api';
import { ApiError } from '@/api/ApiError';
import { useAuth } from '@/context/useAuth';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
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
 * Uses `GET /api/tickets/manager?page=&size=` — only the requested page is
 * fetched. The table is View-only; View navigates to `/tickets/:id` where
 * Approve/Reject live behind a confirmation dialog. Stat cards come from
 * page metadata (no full dataset fetch).
 */
export function ManagerDashboard() {
  const { username } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, open: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      setStats(await dashboardService.getTicketStats('manager'));
    } catch (err) {
      setError(ApiError.from(err));
    }
  }, []);

  const loadTickets = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.getManagerTickets({
        page: requestedPage,
        size: DEFAULT_PAGE_SIZE,
      });
      setTickets(result.content);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void loadTickets(page);
  }, [loadTickets, page]);

  const handleRefresh = () => {
    void loadStats();
    void loadTickets(page);
  };

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
          <Button startIcon={<RefreshIcon />} color="inherit" onClick={handleRefresh}>
            Refresh
          </Button>
        }
      />

      <ErrorBanner error={error} onRetry={handleRefresh} />

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
      {!loading ? (
        <TablePaginationBar
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={DEFAULT_PAGE_SIZE}
          disabled={loading}
          onChange={setPage}
        />
      ) : null}
    </Box>
  );
}
