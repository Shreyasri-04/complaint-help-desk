import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowForwardOutlined as ArrowIcon,
  RefreshOutlined as RefreshIcon,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { PageLoader } from '@/components/common/PageLoader';
import { TicketList } from '@/components/tickets/TicketList';
import { ticketService } from '@/services/ticket.api';
import { userService } from '@/services/user.api';
import { categoryService } from '@/services/category.api';
import { dashboardService, summarizeTickets } from '@/services/dashboard.api';
import { ApiError } from '@/api/ApiError';
import { useAuth } from '@/context/useAuth';
import { ROUTES } from '@/utils/routes';
import type { Ticket } from '@/types/ticket';

type StatColor = 'primary' | 'info' | 'success' | 'error' | 'warning';

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

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel: string; onAction: () => void }) {
  return (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, mt: 3 }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Button size="small" endIcon={<ArrowIcon />} onClick={onAction} color="inherit">
        {actionLabel}
      </Button>
    </Stack>
  );
}

/**
 * The single shared dashboard (`/dashboard`) for every authenticated role.
 * The route never changes — only the content below adapts to the role from
 * the auth store:
 * - USER → own ticket stats + recent tickets (backend-scoped list).
 * - MANAGER → assigned users' ticket stats + recent assigned tickets.
 * - ADMIN → user / ticket / category overview counts.
 * All numbers come from backend APIs; nothing is hardcoded.
 */
export function DashboardPage() {
  const { username, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [userEnabled, setUserEnabled] = useState(0);
  const [categoryTotal, setCategoryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        const [users, allTickets, categories] = await Promise.all([
          userService.list(),
          ticketService.list(),
          categoryService.list().catch(() => []),
        ]);
        setUserTotal(users.length);
        setUserEnabled(users.filter((user) => user.enabled !== false).length);
        setCategoryTotal(categories.length);
        setTickets(allTickets);
      } else if (isManager) {
        const data = await dashboardService.getDashboardData();
        setTickets(data.tickets);
      } else {
        setTickets(await ticketService.list());
      }
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isManager]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => summarizeTickets(tickets), [tickets]);
  const recent = useMemo(() => tickets.slice(0, 5), [tickets]);

  const openTicket = (ticket: Ticket) => {
    if (ticket.id != null) {
      navigate(`${ROUTES.tickets}/${ticket.id}`);
    }
  };

  const subtitle = username ? `Welcome back, ${username}.` : 'Ticket overview.';

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <Button startIcon={<RefreshIcon />} color="inherit" onClick={() => void load()}>
            Refresh
          </Button>
        }
      />

      <ErrorBanner error={error} onRetry={() => void load()} />

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {isAdmin ? (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Total users" value={userTotal} color="primary" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Enabled users" value={userEnabled} color="success" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Disabled users" value={userTotal - userEnabled} color="warning" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Categories" value={categoryTotal} color="info" />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Total tickets" value={stats.total} color="primary" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Open" value={stats.open} color="info" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Approved" value={stats.approved} color="success" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Rejected" value={stats.rejected} color="error" />
                </Grid>
              </Grid>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button variant="outlined" onClick={() => navigate(ROUTES.adminUsers)}>
                  Manage users
                </Button>
                <Button variant="outlined" onClick={() => navigate(ROUTES.tickets)}>
                  View all tickets
                </Button>
                <Button variant="outlined" onClick={() => navigate(ROUTES.categories)}>
                  Manage categories
                </Button>
              </Stack>
            </>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard
                    label={isManager ? 'Assigned tickets' : 'My tickets'}
                    value={stats.total}
                    color="primary"
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Open" value={stats.open} color="info" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Approved" value={stats.approved} color="success" />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <StatCard label="Rejected" value={stats.rejected} color="error" />
                </Grid>
              </Grid>

              <SectionHeader
                title={isManager ? 'Recent assigned tickets' : 'Recent tickets'}
                actionLabel={isManager ? 'Assigned tickets' : 'My tickets'}
                onAction={() => navigate(isManager ? ROUTES.assigned : ROUTES.tickets)}
              />
              <TicketList
                tickets={recent}
                showUser={isManager}
                showCategory={false}
                emptyTitle={isManager ? 'No assigned tickets yet.' : 'No tickets yet.'}
                emptyDescription={
                  isManager
                    ? 'Tickets raised by users assigned to you will appear here.'
                    : 'Create your first ticket to get started.'
                }
                onView={openTicket}
              />
            </>
          )}
        </>
      )}
    </Box>
  );
}
