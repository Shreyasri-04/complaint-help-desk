import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  AddOutlined as AddIcon,
  InboxOutlined as InboxIcon,
  RefreshOutlined as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { PageLoader } from '@/components/common/PageLoader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TicketList } from '@/components/tickets/TicketList';
import { TicketFormDialog } from '@/components/forms/TicketFormDialog';
import { ticketService } from '@/services/ticket.api';
import { categoryService } from '@/services/category.api';
import { ApiError } from '@/api/ApiError';
import { useAuth } from '@/context/useAuth';
import { ROUTES } from '@/utils/routes';
import { ALL_PRIORITIES, ALL_STATUSES, TICKET_PRIORITY_META, TICKET_STATUS_META } from '@/utils/constants';
import type { Category } from '@/types/category';
import type { Ticket, TicketFilters, TicketStatus, TicketPriority } from '@/types/ticket';

const ANY = '';

/**
 * Role-aware ticket list.
 *
 * Data always flows through the service layer (`ticketService`, token
 * attached by the axios interceptor); components never call APIs directly.
 *
 * Permission-based UI (UX only, backend is the final authority):
 * - USER/MANAGER → "My Tickets": View + Edit own tickets, "New ticket".
 *   No Delete, no Approve/Reject (those live on the ticket detail page for
 *   managers on assigned users' tickets).
 * - ADMIN → all tickets: View + Edit + Delete (delete behind confirmation).
 *   No "New ticket" — admins cannot create tickets.
 */
export function TicketListPage({ autoCreate = false }: { autoCreate?: boolean }) {
  const { isAdmin, isUser, isManager, username } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [status, setStatus] = useState<TicketStatus | typeof ANY>(ANY);
  const [priority, setPriority] = useState<TicketPriority | typeof ANY>(ANY);

  const [formOpen, setFormOpen] = useState(autoCreate);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [deleting, setDeleting] = useState<Ticket | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const canCreate = isUser || isManager;

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: TicketFilters = {};
      if (status) {
        filters.status = status;
      }
      if (priority) {
        filters.priority = priority;
      }
      const fetched = await ticketService.list(filters);
      // "My Tickets" must show only the logged-in user's own tickets.
      // GET /api/tickets can return other users' tickets for a manager's
      // token, so scope the rendered list to the session owner here (display
      // only — the backend remains the authorization boundary). Tickets with
      // no owner info are kept so nothing own is hidden by a missing field.
      // Admins are exempt: they are allowed to see all tickets.
      if (!isAdmin && username != null) {
        setTickets(
          fetched.filter((ticket) => {
            const owner = ticket.createdBy ?? ticket.username;
            return owner == null || owner === username;
          }),
        );
      } else {
        setTickets(fetched);
      }
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setLoading(false);
    }
  }, [status, priority, isAdmin, username]);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await categoryService.list());
    } catch {
      // Categories are only needed for the create form; tolerate failures here.
    }
  }, []);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const clearFilters = () => {
    setStatus(ANY);
    setPriority(ANY);
  };

  const hasFilters = Boolean(status || priority);

  const openTicket = (ticket: Ticket) => {
    if (ticket.id != null) {
      navigate(`${ROUTES.tickets}/${ticket.id}`);
    }
  };

  const handleDelete = async () => {
    if (deleting?.id == null) {
      return;
    }
    setDeleteLoading(true);
    try {
      await ticketService.delete(deleting.id);
      setDeleting(null);
      setNotice('Ticket deleted successfully.');
      await loadTickets();
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title={isAdmin ? 'Tickets' : 'My Tickets'}
        subtitle={
          isAdmin
            ? 'All tickets across the system.'
            : 'Tickets you created. Track their status here.'
        }
        actions={
          canCreate ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                if (categories.length === 0) {
                  void loadCategories();
                }
                setEditing(null);
                setFormOpen(true);
              }}
            >
              New ticket
            </Button>
          ) : undefined
        }
      />

      {/* ❌ Error state */}
      <ErrorBanner error={error} onRetry={() => void loadTickets()} />

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' } }}
        >
          <FormControl size="small" sx={{ minWidth: { sm: 180 }, flexGrow: 1 }}>
            <InputLabel id="filter-status-label">Status</InputLabel>
            <Select
              labelId="filter-status-label"
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus | typeof ANY)}
            >
              <MenuItem value={ANY}>Any status</MenuItem>
              {ALL_STATUSES.map((value) => (
                <MenuItem key={value} value={value}>
                  {TICKET_STATUS_META[value].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: { sm: 180 }, flexGrow: 1 }}>
            <InputLabel id="filter-priority-label">Priority</InputLabel>
            <Select
              labelId="filter-priority-label"
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority | typeof ANY)}
            >
              <MenuItem value={ANY}>Any priority</MenuItem>
              {ALL_PRIORITIES.map((value) => (
                <MenuItem key={value} value={value}>
                  {TICKET_PRIORITY_META[value].label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button startIcon={<RefreshIcon />} onClick={() => void loadTickets()} color="inherit">
              Apply
            </Button>
            {hasFilters ? (
              <Button onClick={clearFilters} color="inherit">
                Clear
              </Button>
            ) : null}
          </Box>
        </Stack>
      </Paper>

      {/* 🔄 Loading state */}
      {loading ? (
        <PageLoader />
      ) : tickets.length === 0 ? (
        /* 📭 Empty state */
        <Paper variant="outlined">
          <EmptyState
            icon={<InboxIcon fontSize="large" />}
            title="No tickets found"
            description={
              canCreate
                ? 'Try adjusting the filters or create a new ticket.'
                : 'Try adjusting the filters.'
            }
          />
        </Paper>
      ) : (
        /* ✅ Success state */
        <TicketList
          tickets={tickets}
          onView={openTicket}
          onEdit={(ticket) => {
            setEditing(ticket);
            setFormOpen(true);
          }}
          onDelete={isAdmin ? setDeleting : undefined}
        />
      )}

      {canCreate || editing ? (
        <TicketFormDialog
          open={formOpen}
          ticket={editing}
          categories={categories}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
            if (autoCreate) {
              navigate(ROUTES.tickets, { replace: true });
            }
          }}
          onSaved={() => void loadTickets()}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        title="Delete ticket"
        description={
          deleting ? `Are you sure you want to delete "${deleting.subject}"?` : ''
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) {
            setDeleting(null);
          }
        }}
        onConfirm={() => void handleDelete()}
      />

      <Snackbar
        open={notice !== null}
        autoHideDuration={4000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setNotice(null)} sx={{ width: '100%' }}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
}
