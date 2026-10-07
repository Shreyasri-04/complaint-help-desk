import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material';
import { ticketService } from '@/services/ticket.api';
import { ApiError } from '@/api/ApiError';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { ALL_PRIORITIES, TICKET_PRIORITY_META, VALIDATION } from '@/utils/constants';
import { ticketFormSchema } from '@/schemas/ticketSchema';
import { TICKET_PRIORITY } from '@/types/ticket';
import type { Category } from '@/types/category';
import type { Ticket, TicketPriority } from '@/types/ticket';

type TicketFieldName = 'subject' | 'description' | 'categoryId';

interface TicketFormDialogProps {
  open: boolean;
  ticket?: Ticket | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export function TicketFormDialog({ open, ticket, categories, onClose, onSaved }: TicketFormDialogProps) {
  const isEdit = Boolean(ticket);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TICKET_PRIORITY.LOW);
  const [categoryId, setCategoryId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject(ticket?.subject ?? '');
      setDescription(ticket?.description ?? '');
      setPriority(ticket?.priority ?? TICKET_PRIORITY.LOW);
      setCategoryId(ticket?.categoryId != null ? String(ticket.categoryId) : '');
      setFieldErrors({});
      setError(null);
    }
  }, [open, ticket]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) {
      return;
    }

    const parsed = ticketFormSchema.safeParse({ subject, description, categoryId, priority });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Partial<
        Record<TicketFieldName, string[]>
      >;
      setFieldErrors({
        subject: fieldErrors.subject?.[0] ?? '',
        description: fieldErrors.description?.[0] ?? '',
        categoryId: fieldErrors.categoryId?.[0] ?? '',
      });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = { ...parsed.data, status: ticket?.status };
      if (ticket?.id != null) {
        await ticketService.update(ticket.id, payload);
      } else {
        await ticketService.create(payload);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{isEdit ? 'Edit Ticket' : 'New Ticket'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <ErrorBanner error={error} />
            <TextField
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              fullWidth
              error={Boolean(fieldErrors.subject)}
              helperText={
                fieldErrors.subject || `Max ${VALIDATION.subject.max} characters`
              }
              slotProps={{ htmlInput: { maxLength: VALIDATION.subject.max } }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              fullWidth
              multiline
              minRows={4}
              error={Boolean(fieldErrors.description)}
              helperText={
                fieldErrors.description ||
                `Max ${VALIDATION.description.max} characters`
              }
              slotProps={{ htmlInput: { maxLength: VALIDATION.description.max } }}
            />
            <FormControl fullWidth required>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                label="Category"
                value={categoryId}
                onChange={(e) => setCategoryId(String(e.target.value))}
                error={Boolean(fieldErrors.categoryId)}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.categoryId ? (
                <FormHelperText error>{fieldErrors.categoryId}</FormHelperText>
              ) : null}
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="priority-select-label">Priority</InputLabel>
              <Select
                labelId="priority-select-label"
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                {ALL_PRIORITIES.map((value) => (
                  <MenuItem key={value} value={value}>
                    {TICKET_PRIORITY_META[value].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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