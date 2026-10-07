import Alert from '@mui/material/Alert';
import type { AlertProps } from '@mui/material/Alert';
import type { SystemStyleObject } from '@mui/system';

const baseSx = {
  borderRadius: 2,
  alignItems: 'center',
  '& .MuiAlert-icon': { fontSize: 20 },
} as const;

interface AuthAlertProps extends Omit<AlertProps, 'sx'> {
  sx?: object;
}

export function AuthAlert({ sx, ...rest }: AuthAlertProps) {
  return <Alert {...rest} sx={{ ...baseSx, ...sx } as SystemStyleObject} />;
}