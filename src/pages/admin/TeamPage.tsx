import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { GroupOutlined as GroupIcon } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/PageLoader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { TablePaginationBar } from '@/components/common/TablePaginationBar';
import { userService } from '@/services/user.api';
import { ApiError } from '@/api/ApiError';
import { useAuth } from '@/context/useAuth';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import type { User } from '@/types/user';

type StatusAction = { user: User; enable: boolean };

function isEnabled(user: User): boolean {
  // Older payloads may omit the flag — treat missing as enabled.
  return user.enabled !== false;
}

/**
 * ADMIN-only user management: full user list with ID, role, account status,
 * assigned manager, and enable/disable actions behind a confirmation dialog.
 * All data flows through `userService`; the backend remains the source of
 * truth and the final authorization boundary. An admin cannot disable their
 * own account from this UI. Never renders passwords, hashes, or tokens.
 */
export function TeamPage() {
  const { username: currentUsername } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [pending, setPending] = useState<StatusAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<ApiError | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadUsers = useCallback(async (requestedPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await userService.listPage({
        page: requestedPage,
        size: DEFAULT_PAGE_SIZE,
      });
      setUsers(result.content);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadManagers = useCallback(async () => {
    try {
      setManagers(await userService.listManagers());
    } catch {
      setManagers([]);
    }
  }, []);

  useEffect(() => {
    void loadUsers(page);
  }, [loadUsers, page]);

  useEffect(() => {
    void loadManagers();
  }, [loadManagers]);

  const confirmAction = async () => {
    if (pending == null) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await userService.setEnabled(pending.user.id, pending.enable);
      setUsers((previous) =>
        previous.map((user) => (user.id === updated.id ? updated : user)),
      );
      setPending(null);
      setNotice(
        pending.enable ? 'User enabled successfully.' : 'User disabled successfully.',
      );
    } catch (err) {
      // Keep the dialog open so the backend message stays visible.
      setActionError(ApiError.from(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignManager = async (user: User, managerId: number | null) => {
    setAssigningId(user.id);
    setError(null);
    try {
      const updated = await userService.assignManager(user.id, managerId);
      setUsers((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(`Manager assignment updated for "${user.username}".`);
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <Box>
      <PageHeader
        title="User Management"
        subtitle="View users, account status, manager assignment, and enable or disable access."
      />

      <ErrorBanner error={error} onRetry={() => void loadUsers(page)} />

      {loading ? (
        <PageLoader />
      ) : users.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={<GroupIcon fontSize="large" />}
            title="No users found."
            description="Users registered in the system will appear here."
          />
        </Paper>
      ) : (
        <>
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 720 }} aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned Manager</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const enabled = isEnabled(user);
                const isSelf = currentUsername != null && user.username === currentUsername;
                return (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.username}
                        {isSelf ? ' (you)' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={user.role} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={enabled ? 'Enabled' : 'Disabled'}
                        size="small"
                        color={enabled ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                          value={user.managerId != null ? String(user.managerId) : ''}
                          displayEmpty
                          disabled={assigningId === user.id}
                          onChange={(e) => {
                            const value = e.target.value;
                            void handleAssignManager(
                              user,
                              value === '' ? null : Number(value),
                            );
                          }}
                          aria-label={`Assign manager for ${user.username}`}
                        >
                          <MenuItem value="">None</MenuItem>
                          {managers.map((manager) => (
                            <MenuItem key={manager.id} value={String(manager.id)}>
                              {manager.username}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color={enabled ? 'error' : 'success'}
                        disabled={isSelf || actionLoading}
                        onClick={() => {
                          setActionError(null);
                          setPending({ user, enable: !enabled });
                        }}
                      >
                        {enabled ? 'Disable' : 'Enable'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
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

      <ConfirmDialog
        open={pending !== null}
        title={pending?.enable ? 'Enable User' : 'Disable User'}
        description={
          <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span>
              {pending?.enable
                ? `Are you sure you want to enable "${pending?.user.username}"?`
                : `Are you sure you want to disable "${pending?.user.username}"?`}
            </span>
            <span>
              {pending?.enable
                ? 'This user will be allowed to log in again.'
                : 'This user will no longer be able to log in.'}
            </span>
            {actionError ? (
              <Alert severity="error">{actionError.message}</Alert>
            ) : null}
          </Box>
        }
        confirmLabel={pending?.enable ? 'Enable' : 'Disable'}
        tone={pending?.enable ? 'success' : 'error'}
        loading={actionLoading}
        onClose={() => {
          if (!actionLoading) {
            setPending(null);
            setActionError(null);
          }
        }}
        onConfirm={() => void confirmAction()}
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
