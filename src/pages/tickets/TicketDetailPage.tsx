import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Grid,
  Link,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowBackOutlined as BackIcon,
  CheckOutlined as ApproveIcon,
  CloseOutlined as RejectIcon,
  DeleteOutlined as DeleteIcon,
  EditOutlined as EditIcon,
  InboxOutlined as InboxIcon,
  ArrowForwardOutlined as AdvanceIcon,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { PageLoader } from '@/components/common/PageLoader';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CommentBox } from '@/components/common/CommentBox';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { PriorityBadge } from '@/components/badges/PriorityBadge';
import { SlaBadge } from '@/components/badges/SlaBadge';
import { AccessDenied } from '@/pages/errors/AccessDenied';
import { TicketFormDialog } from '@/components/forms/TicketFormDialog';
import { ticketService } from '@/services/ticket.api';
import { categoryService } from '@/services/category.api';
import { ApiError } from '@/api/ApiError';
import { useAuth } from '@/context/useAuth';
import { ROUTES } from '@/utils/routes';
import { STATUS_TRANSITIONS, TICKET_STATUS_META } from '@/utils/constants';
import { formatDateTime } from '@/utils/format';
import { TICKET_STATUS } from '@/types/ticket';
import type { Category } from '@/types/category';
import type { Comment, Ticket, TicketStatus } from '@/types/ticket';

function parseId(raw: string | undefined): number | null {
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}

/** Tickets a manager may still act on. Terminal states hide the actions. */
function isActionable(status: TicketStatus | undefined): boolean {
  return status === TICKET_STATUS.OPEN || status === TICKET_STATUS.IN_PROGRESS;
}

type Decision = 'approve' | 'reject';

export function TicketDetailPage() {
  const { id: rawId } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isManager, username } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [advanceError, setAdvanceError] = useState<ApiError | null>(null);

  // Manager approve/reject decision flow.
  const [decision, setDecision] = useState<Decision | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<ApiError | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Comments (reuses the existing comment service + CommentBox).
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentPosting, setCommentPosting] = useState(false);

  const id = parseId(rawId);

  const load = useCallback(async () => {
    if (id == null) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [fetched, fetchedComments] = await Promise.all([
        ticketService.getById(id),
        ticketService.getComments(id).catch(() => [] as Comment[]),
      ]);
      setTicket(fetched);
      setComments(fetchedComments);
      try {
        setCategories(await categoryService.list());
      } catch {
        setCategories([]);
      }
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
    return <Navigate to="/tickets" replace />;
  }

  const handleAdvance = async () => {
    if (!ticket || ticket.status == null) {
      return;
    }
    const nextStatus = STATUS_TRANSITIONS[ticket.status];
    if (!nextStatus) {
      return;
    }
    setMutating(true);
    setAdvanceError(null);
    try {
      const updated = await ticketService.update(id, {
        subject: ticket.subject,
        description: ticket.description ?? '',
        priority: ticket.priority,
        categoryId: ticket.categoryId,
        status: nextStatus,
      });
      setTicket(updated);
    } catch (err) {
      setAdvanceError(ApiError.from(err));
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async () => {
    setMutating(true);
    try {
      await ticketService.delete(id);
      navigate('/tickets', { replace: true });
    } catch (err) {
      setDeleteOpen(false);
      setError(ApiError.from(err));
      setMutating(false);
    }
  };

  const handleAddComment = async (message: string): Promise<boolean> => {
    setCommentPosting(true);
    try {
      const comment = await ticketService.addComment(id, message);
      setComments((previous) => [...previous, comment]);
      return true;
    } catch {
      return false;
    } finally {
      setCommentPosting(false);
    }
  };

  const confirmDecision = async () => {
    if (decision == null) {
      return;
    }
    // Keep the dialog open on failure so the backend message stays visible.
    setDecisionLoading(true);
    setDecisionError(null);
    try {
      const updated =
        decision === 'approve'
          ? await ticketService.approveTicket(id)
          : await ticketService.rejectTicket(id);
      setTicket(updated);
      setDecision(null);
      setNotice(
        decision === 'approve'
          ? 'Ticket approved successfully.'
          : 'Ticket rejected successfully.',
      );
    } catch (err) {
      setDecisionError(ApiError.from(err));
    } finally {
      setDecisionLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  // Authenticated but forbidden (e.g. another user's ticket): show 403 inline.
  // Never redirect to login — the session is still valid.
  if (error?.status === 403) {
    return <AccessDenied />;
  }

  const nextStatus: TicketStatus | null = ticket?.status ? STATUS_TRANSITIONS[ticket.status] ?? null : null;
  const owner = ticket?.createdBy ?? ticket?.username ?? null;
  const isOwnTicket = owner != null && username != null && owner === username;
  // Managers decide on assigned users' tickets only — never their own.
  const canDecide = isManager && !isOwnTicket && ticket != null && isActionable(ticket.status);
  // Admins edit where the backend permits; users/managers edit own tickets.
  const canEdit = isAdmin || isOwnTicket;
  const canAdvance = isAdmin || isManager;

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate(ROUTES.dashboard)}
        >
          Dashboard
        </Link>
        <Typography color="text.primary">Ticket Details</Typography>
      </Breadcrumbs>

      <PageHeader
        title={`Ticket #${ticket?.id ?? id}`}
        subtitle="Full ticket information and SLA tracking."
        actions={
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            color="inherit"
          >
            Back
          </Button>
        }
      />

      <ErrorBanner error={error} onRetry={() => void load()} />
      <ErrorBanner error={advanceError} />

      {ticket ? (
        <>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                  {ticket.subject}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  {ticket.categoryName ? <Chip label={ticket.categoryName} size="small" variant="outlined" /> : null}
                  {ticket.username ? <Chip label={ticket.username} size="small" variant="outlined" /> : null}
                </Stack>
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailRow label="User" value={ticket.createdBy ?? ticket.username ?? '—'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailRow label="Priority" value={ticket.priority} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailRow label="Category" value={ticket.categoryName ?? `#${ticket.categoryId}`} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailRow label="Status" value={ticket.status ? TICKET_STATUS_META[ticket.status].label : '—'} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailRow label="Created" value={formatDateTime(ticket.createdDate)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DetailRow label="SLA" value={<SlaBadge deadline={ticket.slaDeadline} breached={ticket.breached} />} />
                </Grid>
              </Grid>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Description
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {ticket.description || '—'}
                </Typography>
              </Box>

              {canDecide ? (
                <>
                  <Divider />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    sx={{ justifyContent: 'flex-end' }}
                  >
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      disabled={decisionLoading || mutating}
                      onClick={() => {
                        setDecisionError(null);
                        setDecision('reject');
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      disabled={decisionLoading || mutating}
                      onClick={() => {
                        setDecisionError(null);
                        setDecision('approve');
                      }}
                    >
                      Approve
                    </Button>
                  </Stack>
                </>
              ) : null}

              <Box>
                {nextStatus && canAdvance ? (
                  <Button
                    variant={canDecide ? 'text' : 'contained'}
                    startIcon={<AdvanceIcon />}
                    onClick={() => void handleAdvance()}
                    disabled={mutating || decisionLoading}
                  >
                    {mutating
                      ? 'Updating…'
                      : `Move to ${TICKET_STATUS_META[nextStatus].label}`}
                  </Button>
                ) : ticket?.status === TICKET_STATUS.APPROVED ||
                  ticket?.status === TICKET_STATUS.REJECTED ||
                  ticket?.status === TICKET_STATUS.CLOSED ? (
                  <Chip
                    label={`Status: ${ticket.status ? TICKET_STATUS_META[ticket.status].label : '—'}`}
                    color={ticket.status === TICKET_STATUS.APPROVED ? 'success' : 'default'}
                  />
                ) : null}
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Comments
                </Typography>
                <CommentBox
                  comments={comments}
                  onAddComment={handleAddComment}
                  loading={commentPosting}
                />
              </Box>
            </Stack>
          </Paper>

          {canEdit ? (
            <Stack direction="row" spacing={1}>
              {canEdit ? (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
              ) : null}
              {isAdmin ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              ) : null}
            </Stack>
          ) : null}
        </>
      ) : error?.status === 404 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={<InboxIcon fontSize="large" />}
            title="Ticket not found"
            description="It may have been deleted or you followed an invalid link."
          />
        </Paper>
      ) : null}

      <TicketFormDialog
        open={editOpen}
        ticket={ticket}
        categories={categories}
        onClose={() => setEditOpen(false)}
        onSaved={() => void load()}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete ticket"
        description={
          ticket ? `Delete "${ticket.subject}"? This cannot be undone.` : ''
        }
        loading={mutating}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void handleDelete()}
      />

      <ConfirmDialog
        open={decision !== null}
        title={decision === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        description={
          <Stack spacing={1}>
            <span>
              {decision === 'approve'
                ? 'Are you sure you want to approve this ticket?'
                : 'Are you sure you want to reject this ticket?'}
            </span>
            {ticket ? (
              <span>
                <strong>Ticket:</strong> {ticket.subject}
              </span>
            ) : null}
            <span>
              {decision === 'approve'
                ? 'This action will change the ticket status to Approved.'
                : 'This action will change the ticket status to Rejected.'}
            </span>
            {decisionError ? (
              <Alert severity="error">{decisionError.message}</Alert>
            ) : null}
          </Stack>
        }
        confirmLabel={decision === 'approve' ? 'Approve' : 'Reject'}
        tone={decision === 'approve' ? 'success' : 'error'}
        loading={decisionLoading}
        onClose={() => {
          if (!decisionLoading) {
            setDecision(null);
            setDecisionError(null);
          }
        }}
        onConfirm={() => void confirmDecision()}
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
