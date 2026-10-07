import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';
import type { SystemStyleObject } from '@mui/system';

const baseSx = {
  py: 1.5,
  borderRadius: 3,
  fontWeight: 700,
  fontSize: '1rem',
  letterSpacing: '0.01em',
  backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #6d28d9 100%)',
  boxShadow: '0 10px 24px -10px rgba(37, 99, 235, 0.65)',
  transition: 'box-shadow 0.25s ease, transform 0.25s ease, filter 0.25s ease',
  '&:hover': {
    backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #7c3aed 100%)',
    boxShadow: '0 14px 32px -10px rgba(37, 99, 235, 0.8)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
  '&.Mui-disabled': {
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundImage: 'linear-gradient(135deg, #93c5fd 0%, #818cf8 100%)',
  },
} as const;

interface AuthSubmitButtonProps extends Omit<ButtonProps, 'sx'> {
  sx?: object;
}

export function AuthSubmitButton({ sx, ...rest }: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      {...rest}
      sx={{ ...baseSx, ...sx } as SystemStyleObject}
    />
  );
}