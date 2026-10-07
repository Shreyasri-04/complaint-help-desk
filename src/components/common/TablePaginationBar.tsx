import { Box, Pagination, Typography } from '@mui/material';

interface TablePaginationBarProps {
  /** Current backend page (0-based). */
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  disabled?: boolean;
  /** Called with the new backend page (0-based). */
  onChange: (page: number) => void;
}

/**
 * Reusable server-side pagination bar. Converts between the backend's
 * 0-based pages and MUI's 1-based Pagination. Hidden when there is nothing
 * to paginate; stacks vertically on small screens.
 */
export function TablePaginationBar({
  page,
  totalPages,
  totalElements,
  pageSize,
  disabled = false,
  onChange,
}: TablePaginationBarProps) {
  if (totalElements === 0) {
    return null;
  }

  const start = page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, totalElements);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
        mt: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
        Showing {start}–{end} of {totalElements}
      </Typography>
      <Pagination
        page={page + 1}
        count={Math.max(totalPages, 1)}
        onChange={(_, value) => onChange(value - 1)}
        color="primary"
        disabled={disabled}
        siblingCount={0}
        boundaryCount={1}
        sx={{ alignSelf: { xs: 'center', sm: 'auto' } }}
      />
    </Box>
  );
}
