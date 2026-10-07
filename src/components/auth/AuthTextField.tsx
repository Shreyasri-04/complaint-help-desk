import type { ReactNode } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import type { TextFieldProps } from '@mui/material/TextField';

export interface AuthTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  icon?: ReactNode;
  endAdornment?: ReactNode;
}

export function AuthTextField({ icon, endAdornment, slotProps, ...rest }: AuthTextFieldProps) {
  const input = {
    ...(slotProps as { input?: Record<string, unknown> }).input,
    ...(icon
      ? {
          startAdornment: (
            <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
              {icon}
            </InputAdornment>
          ),
        }
      : {}),
    ...(endAdornment ? { endAdornment } : {}),
  };

  return (
    <TextField
      {...rest}
      variant="outlined"
      fullWidth
      slotProps={{ ...slotProps, input }}
    />
  );
}