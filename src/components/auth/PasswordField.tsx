import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthTextField } from '@/components/auth/AuthTextField';
import type { AuthTextFieldProps } from '@/components/auth/AuthTextField';

type PasswordFieldProps = Omit<AuthTextFieldProps, 'type' | 'endAdornment'>;

export function PasswordField({ slotProps, autoComplete = 'current-password', ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthTextField
      {...rest}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      slotProps={{
        ...slotProps,
        input: {
          ...(slotProps as { input?: Record<string, unknown> }).input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible((value) => !value)}
                onMouseDown={(event) => event.preventDefault()}
                edge="end"
                size="small"
                tabIndex={-1}
              >
                {visible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}