import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import { categoryService } from '@/services/category.api';
import { ApiError } from '@/api/ApiError';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { categoryFormSchema } from '@/schemas/categorySchema';
import { VALIDATION } from '@/utils/constants';
import type { Category } from '@/types/category';

type CategoryFieldName = 'name' | 'slaHours';

interface CategoryFormDialogProps {
  open: boolean;
  category?: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryFormDialog({ open, category, onClose, onSaved }: CategoryFormDialogProps) {
  const isEdit = Boolean(category);

  const [name, setName] = useState('');
  const [slaHours, setSlaHours] = useState('1');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? '');
      setSlaHours(String(category?.slaHours ?? 1));
      setFieldErrors({});
      setError(null);
    }
  }, [open, category]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    const parsed = categoryFormSchema.safeParse({ name, slaHours });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Partial<
        Record<CategoryFieldName, string[]>
      >;
      setFieldErrors({
        name: fieldErrors.name?.[0] ?? '',
        slaHours: fieldErrors.slaHours?.[0] ?? '',
      });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = parsed.data;
      if (category?.id != null) {
        await categoryService.update(category.id, payload);
      } else {
        await categoryService.create(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      const apiError = ApiError.from(err);
      setError(apiError);
      if (apiError.hasFieldErrors) {
        setFieldErrors(apiError.fieldErrors);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{isEdit ? 'Edit Category' : 'New Category'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <ErrorBanner error={error} />
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name || `Max ${VALIDATION.categoryName.max} characters`}
              slotProps={{ htmlInput: { maxLength: VALIDATION.categoryName.max } }}
            />
            <TextField
              label="SLA Hours"
              value={slaHours}
              onChange={(e) => setSlaHours(e.target.value)}
              required
              fullWidth
              type="number"
              slotProps={{ htmlInput: { min: VALIDATION.slaHours.min, max: VALIDATION.slaHours.max } }}
              error={Boolean(fieldErrors.slaHours)}
              helperText={
                fieldErrors.slaHours ||
                `Between ${VALIDATION.slaHours.min} and ${VALIDATION.slaHours.max}`
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}