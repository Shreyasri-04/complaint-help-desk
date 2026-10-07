import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckOutlined as ApproveIcon,
  CloseOutlined as RejectIcon,
  DeleteOutlined as DeleteIcon,
  EditOutlined as EditIcon,
  InboxOutlined as InboxIcon,
  VisibilityOutlined as ViewIcon,
} from '@mui/icons-material';
import { StatusBadge } from '@/components/badges/StatusBadge';
import { PriorityBadge } from '@/components/badges/PriorityBadge';
import { SlaBadge } from '@/components/badges/SlaBadge';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/PageLoader';
import { formatDateTime } from '@/utils/format';
import type { Ticket } from '@/types/ticket';

interface TicketListProps {
  tickets: Ticket[];
  loading?: boolean;
  showCategory?: boolean;
  showUser?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  busyId?: number | null;
  onView?: (ticket: Ticket) => void;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
  onApprove?: (ticket: Ticket) => void;
  onReject?: (ticket: Ticket) => void;
}

export function TicketList({
  tickets,
  loading = false,
  showCategory = true,
  showUser = false,
  emptyTitle = 'No tickets found',
  emptyDescription = 'Try adjusting the filters or create a new ticket.',
  busyId = null,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}: TicketListProps) {
  const navigate = useNavigate();
  const hasActions = Boolean(onView || onEdit || onDelete || onApprove || onReject);

  if (loading) {
    return <PageLoader />;
  }

  if (tickets.length === 0) {
    return (
      <Paper variant="outlined">
        <EmptyState
          icon={<InboxIcon fontSize="large" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      </Paper>
    );
  }

  const openTicket = (ticket: Ticket) => {
    if (onView) {
      onView(ticket);
      return;
    }
    navigate(`/tickets/${ticket.id}`);
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table sx={{ minWidth: 720 }} aria-label="tickets table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
            {showUser ? <TableCell sx={{ fontWeight: 600 }}>User</TableCell> : null}
            {showCategory ? <TableCell sx={{ fontWeight: 600 }}>Category</TableCell> : null}
            <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>SLA</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
            {hasActions ? <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {tickets.map((ticket) => {
            const busy = ticket.id != null && ticket.id === busyId;
            return (
              <TableRow
                key={ticket.id}
                hover
                onClick={() => openTicket(ticket)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {ticket.subject}
                  </Typography>
                </TableCell>
                {showUser ? (
                  <TableCell>{ticket.createdBy ?? ticket.username ?? '—'}</TableCell>
                ) : null}
                {showCategory ? (
                  <TableCell>{ticket.categoryName ?? `#${ticket.categoryId}`}</TableCell>
                ) : null}
                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>
                  <SlaBadge deadline={ticket.slaDeadline} breached={ticket.breached} />
                </TableCell>
                <TableCell>
                  <Box component="span" sx={{ typography: 'body2', whiteSpace: 'nowrap' }}>
                    {formatDateTime(ticket.createdDate)}
                  </Box>
                </TableCell>
                {hasActions ? (
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ justifyContent: 'flex-end' }}
                    >
                      {onView ? (
                        <Tooltip title="View">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="View ticket"
                              onClick={(event) => {
                                event.stopPropagation();
                                onView(ticket);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                      {onEdit ? (
                        <Tooltip title="Edit">
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Edit ticket"
                              onClick={(event) => {
                                event.stopPropagation();
                                onEdit(ticket);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                      {onDelete ? (
                        <Tooltip title="Delete">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="Delete ticket"
                              disabled={busy}
                              onClick={(event) => {
                                event.stopPropagation();
                                onDelete(ticket);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                      {onApprove ? (
                        <Tooltip title="Approve">
                          <span>
                            <IconButton
                              size="small"
                              color="success"
                              aria-label="Approve ticket"
                              disabled={busy}
                              onClick={(event) => {
                                event.stopPropagation();
                                onApprove(ticket);
                              }}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                      {onReject ? (
                        <Tooltip title="Reject">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              aria-label="Reject ticket"
                              disabled={busy}
                              onClick={(event) => {
                                event.stopPropagation();
                                onReject(ticket);
                              }}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      ) : null}
                    </Stack>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
