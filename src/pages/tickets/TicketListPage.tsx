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
import { TablePaginationBar } from '@/components/common/TablePaginationBar';
import { TicketList } from '@/components/tickets/TicketList';
import { TicketFormDialog } from '@/components/forms/TicketFormDialog';
import { ticketService } from '@/services/ticket.api';
import { categoryService } from '@/services/category.api';
import { ApiError } from '@/api/ApiError';
import { useAuth } from '@/context/useAuth';
import { ROUTES } from '@/utils/routes';
import { ALL_PRIORITIES, ALL_STATUSES, DEFAULT_PAGE_SIZE, TICKET_PRIORITY_META, TICKET_STATUS_META } from '@/utils/constants';
import type { Category } from '@/types/category';
import type { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';

const ANY = '';

/**
 * Role-aware ticket list with server-side pagination.
 *
 * Data always flows through the service layer (`ticketService`, token
 * attached by the axios interceptor); components never call APIs directly.
 * Only the requested backend page (`?page=&size=`, 0-based) is fetched —
 * the full dataset is never transferred. Changing a filter resets to page 0.
 *
 * Permission-based UI (UX only, backend is the final authority):
 * - USER/MANAGER → "My Tickets": View + Edit own tickets, "New ticket".
 *   No Delete, no Approve/Reject (those live on the ticket detail page for
 *   managers on assigned users' tickets).
 * - ADMIN → all tickets: View + Edit + Delete (delete behind confirmation).
 *   No "New ticket" — admins cannot create tickets.
 */
export function TicketListPage({ autoCreate = false }: { autoCreate?: boolean }) {
  const { isAdmin, isUser, isManager } = useAuth();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  // In create mode (/tickets/new) the page is only a host for the create
  // dialog — the ticket list is never fetched or rendered.
  const [loading, setLoading] = useState(!autoCreate);
  const [error, setError] = useState<ApiError | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [status, setStatus] = useState<TicketStatus | typeof ANY>(ANY);
  const [priority, setPriority] = useState<TicketPriority | typeof ANY>(ANY);

  const [formOpen, setFormOpen] = useState(autoCreate);
  const [editing, setEditing] = useState<Ticket | null>(null);
  const [deleting, setDeleting] = useState<Ticket | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const canCreate = isUser || isManager;

  const loadTickets = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ticketService.list({
        page: requestedPage,
        size: DEFAULT_PAGE_SIZE,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
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
  }, [status, priority]);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await categoryService.list());
    } catch {
      // Categories are only needed for the create form; tolerate failures here.
    }
  }, []);

  useEffect(() => {
    if (autoCreate) {
      return;
    }
    void loadTickets(page);
  }, [loadTickets, page, autoCreate]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const clearFilters = () => {
    setStatus(ANY);
    setPriority(ANY);
    setPage(0);
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
      // If the last row of the page was removed, step back so the page
      // never renders empty while earlier pages still have rows.
      if (tickets.length <= 1 && page > 0) {
        setPage(page - 1);
      } else {
        await loadTickets(page);
      }
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
      <ErrorBanner error={error} onRetry={() => void loadTickets(page)} />

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
              onChange={(e) => {
                setStatus(e.target.value as TicketStatus | typeof ANY);
                setPage(0);
              }}
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
              onChange={(e) => {
                setPriority(e.target.value as TicketPriority | typeof ANY);
                setPage(0);
              }}
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
            <Button startIcon={<RefreshIcon />} onClick={() => void loadTickets(page)} color="inherit">
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
        <>
          <TicketList
            tickets={tickets}
            onView={openTicket}
            onEdit={(ticket) => {
              setEditing(ticket);
              setFormOpen(true);
            }}
            onDelete={isAdmin ? setDeleting : undefined}
          />
          <TablePaginationBar
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={DEFAULT_PAGE_SIZE}
            disabled={loading}
            onChange={setPage}
          />
        </>
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
          onSaved={() => {
            // In create mode the dialog closes onto the ticket list route,
            // which loads its own page — no list fetch needed here.
            if (!autoCreate) {
              void loadTickets(page);
            }
          }}
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
