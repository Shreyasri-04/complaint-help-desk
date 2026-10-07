import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
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
  AddOutlined as AddIcon,
  DeleteOutlined as DeleteIcon,
  EditOutlined as EditIcon,
  CategoryOutlined as CategoryIcon,
  RefreshOutlined as RefreshIcon,
} from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { EmptyState } from '@/components/common/EmptyState';
import { PageLoader } from '@/components/common/PageLoader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { CategoryFormDialog } from '@/components/forms/CategoryFormDialog';
import { categoryService } from '@/services/category.api';
import { ApiError } from '@/api/ApiError';
import { useAuth } from '@/context/useAuth';
import type { Category } from '@/types/category';

export function CategoriesPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting?.id) {
      return;
    }
    setDeletingInProgress(true);
    try {
      await categoryService.delete(deleting.id);
      setDeleting(null);
      await loadCategories();
    } catch (err) {
      setError(ApiError.from(err));
    } finally {
      setDeletingInProgress(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Categories"
        subtitle="Complaint categories and their SLA windows."
        actions={
          isAdmin ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              New category
            </Button>
          ) : undefined
        }
      />

      <ErrorBanner error={error} onRetry={() => void loadCategories()} />

      {loading ? (
        <PageLoader />
      ) : categories.length === 0 ? (
        <Paper variant="outlined">
          <EmptyState
            icon={<CategoryIcon fontSize="large" />}
            title="No categories yet"
            description={isAdmin ? 'Create the first category to get started.' : 'No categories available.'}
          />
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 640 }} aria-label="categories table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SLA (hours)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tickets</TableCell>
                {isAdmin ? <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  hover
                  onClick={() => navigate(`/categories/${category.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{category.slaHours} h</TableCell>
                  <TableCell>
                    {category.ticketCount != null ? (
                      <Chip label={category.ticketCount} size="small" variant="outlined" />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  {isAdmin ? (
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              openEdit(category);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(event) => {
                              event.stopPropagation();
                              setDeleting(category);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button startIcon={<RefreshIcon />} onClick={() => void loadCategories()} color="inherit">
          Refresh
        </Button>
      </Box>

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => void loadCategories()}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category"
        description={
          deleting
            ? `Delete "${deleting.name}"? This cannot be undone.`
            : ''
        }
        loading={deletingInProgress}
        onClose={() => setDeleting(null)}
        onConfirm={() => void handleDelete()}
      />
    </Box>
  );
}