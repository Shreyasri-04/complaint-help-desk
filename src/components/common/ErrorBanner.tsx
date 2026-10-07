import { Alert, Button, List, ListItem, ListItemText } from '@mui/material';
import type { ApiError } from '@/api/ApiError';

interface ErrorBannerProps {
  error: ApiError | null;
  /** Optional retry action rendered as a button on the banner. */
  onRetry?: () => void;
}

export function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  if (!error) {
    return null;
  }

  const fields = error.hasFieldErrors ? Object.entries(error.fieldErrors) : [];

  return (
    <Alert
      severity="error"
      sx={{ mb: 2 }}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
    >
      <div>{error.message}</div>
      {fields.length > 0 ? (
        <List dense disablePadding sx={{ mt: 1 }}>
          {fields.map(([field, reason]) => (
            <ListItem key={field} disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary={reason}
                secondary={field}
              />
            </ListItem>
          ))}
        </List>
      ) : null}
    </Alert>
  );
}