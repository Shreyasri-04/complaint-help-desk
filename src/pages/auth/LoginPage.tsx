import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import {
  Box,
  Button,
  Card,
  Checkbox,

  Divider,
  FormControlLabel,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import ConfirmationNumberOutlined from '@mui/icons-material/ConfirmationNumberOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';

import { ApiError } from '@/api/ApiError';
import { AuthAlert } from '@/components/auth/AuthAlert';
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { PasswordField } from '@/components/auth/PasswordField';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { useThemeMode } from '@/context/themeModeContext';
import type { ThemeMode } from '@/context/themeModeContext';
import { useAuth } from '@/context/useAuth';
import { hasFieldErrors, validateLoginForm } from '@/schemas/authSchema';
import type { LoginFieldErrors } from '@/schemas/authSchema';
import { VALIDATION } from '@/utils/constants';

interface LocationState {
  from?: string;
  message?: string;
}

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const floatBlob = keyframes`
  0%, 100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  33% {
    transform: translate3d(48px, -40px, 0) scale(1.12);
  }
  66% {
    transform: translate3d(-40px, 32px, 0) scale(0.94);
  }
`;

function readLocationState(location: Location): LocationState {
  return (location.state as LocationState | null) ?? {};
}

function mergeApiFieldErrors(previous: LoginFieldErrors, apiError: ApiError): LoginFieldErrors {
  if (!apiError.hasFieldErrors) {
    return previous;
  }
  const next = { ...previous };
  for (const [field, reason] of Object.entries(apiError.fieldErrors)) {
    if (field === 'username' || field === 'password') {
      next[field] = reason;
    }
  }
  return next;
}

interface BlobProps {
  color: string;
  size: number;
  top?: string | number;
  bottom?: string | number;
  left?: string | number;
  right?: string | number;
  duration: string;
  delay?: string;
}

function blobSx({ color, size, top, bottom, left, right, duration, delay = '0s' }: BlobProps): SxProps<Theme> {
  return {
    position: 'absolute',
    width: { xs: Math.round(size * 0.7), md: size },
    height: { xs: Math.round(size * 0.7), md: size },
    top,
    bottom,
    left,
    right,
    borderRadius: '50%',
    background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`,
    pointerEvents: 'none',
    animation: `${floatBlob} ${duration} ease-in-out ${delay} infinite`,
  };
}

function BackgroundBlobs() {
  return (
    <>
      <Box
        sx={blobSx({
          color: 'rgba(99, 102, 241, 0.5)',
          size: 560,
          top: '-12%',
          left: '-8%',
          duration: '26s',
        })}
      />
      <Box
        sx={blobSx({
          color: 'rgba(59, 130, 246, 0.45)',
          size: 640,
          bottom: '-16%',
          right: '-10%',
          duration: '30s',
          delay: '3s',
        })}
      />
      <Box
        sx={blobSx({
          color: 'rgba(139, 92, 246, 0.4)',
          size: 420,
          top: '36%',
          right: '-12%',
          duration: '22s',
          delay: '6s',
        })}
      />
    </>
  );
}

interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
}

function ThemeToggle({ mode, onToggle }: ThemeToggleProps) {
  return (
    <IconButton
      onClick={onToggle}
      aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      size="small"
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 5,
        color: (theme) => (theme.palette.mode === 'light' ? '#334155' : '#e2e8f0'),
        bgcolor: (theme) =>
          theme.palette.mode === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(30,41,59,0.65)',
        border: (theme) =>
          `1px solid ${theme.palette.mode === 'light' ? 'rgba(148,163,184,0.6)' : 'rgba(51,65,85,0.8)'}`,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 20px -12px rgba(15, 23, 42, 0.5)',
        transition: 'background-color 0.2s ease, transform 0.2s ease',
        '&:hover': {
          bgcolor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(255,255,255,1)' : 'rgba(51,65,85,0.9)',
          transform: 'translateY(-1px)',
        },
      }}
    >
      {mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}
    </IconButton>
  );
}

export function LoginPage() {
  // Authenticated visits are bounced by PublicRoute (App.tsx) — no guard needed here.
  const { login } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const location = useLocation();
  const { message } = readLocationState(location);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const clientErrors = validateLoginForm({ username, password });
    if (hasFieldErrors(clientErrors)) {
      setFieldErrors(clientErrors);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
    } catch (err) {
      const apiError = ApiError.from(err);
      setError(apiError);
      setFieldErrors((previous) => mergeApiFieldErrors(previous, apiError));
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 5,
        overflow: 'hidden',
        isolation: 'isolate',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #e0e7ff 0%, #eef2ff 35%, #f0f9ff 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0b1120 100%)',
      }}
    >
      <ThemeToggle mode={mode} onToggle={toggleMode} />
      <BackgroundBlobs />

      <Card
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          borderRadius: '24px',
          background: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(30,41,59,0.86)',
          backdropFilter: 'blur(16px)',
          border: (theme) =>
            `1px solid ${theme.palette.mode === 'light' ? 'rgba(226,232,240,0.9)' : 'rgba(51,65,85,0.6)'}`,
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 24px 70px -24px rgba(30, 58, 138, 0.45)'
              : '0 24px 70px -24px rgba(0, 0, 0, 0.85)',
          animation: `${fadeInUp} 0.55s cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        <Stack spacing={0.75} sx={{ mb: 3, textAlign: 'center', alignItems: 'center' }}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              backgroundImage: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 45%, #6d28d9 100%)',
              boxShadow: '0 10px 24px -8px rgba(37, 99, 235, 0.7)',
            }}
          >
            <ConfirmationNumberOutlined fontSize="large" />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 800, letterSpacing: '-0.02em', mt: 1 }}
          >
            Ticket Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your tickets efficiently
          </Typography>
        </Stack>

        {message ? (
          <AuthAlert severity="success" sx={{ mb: 2 }}>
            {message}
          </AuthAlert>
        ) : null}
        <ErrorBanner error={error} />

        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.25}>
            <AuthTextField
              label="Username"
              icon={<PersonOutlined />}
              value={username}
              onChange={(event) => {
                const value = event.target.value;
                setUsername(value);
                // Real-time validation on every keystroke.
                setFieldErrors(validateLoginForm({ username: value, password }));
              }}
              error={Boolean(fieldErrors.username)}
              helperText={fieldErrors.username}
              slotProps={{ htmlInput: { maxLength: VALIDATION.username.max } }}
              autoComplete="username"
              autoFocus
              required
            />
            <PasswordField
              label="Password"
              icon={<LockOutlined />}
              value={password}
              onChange={(event) => {
                const value = event.target.value;
                setPassword(value);
                // Real-time validation on every keystroke.
                setFieldErrors(validateLoginForm({ username, password: value }));
              }}
              error={Boolean(fieldErrors.password)}
              helperText={fieldErrors.password || 'Enter your password'}
              slotProps={{ htmlInput: { maxLength: VALIDATION.password.max } }}
              required
            />

            <Stack
              direction="row"
              sx={{
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                }
                label="Remember me"
                sx={{ color: 'text.secondary' }}
              />
              <Link
                href="#"
                underline="hover"
                onClick={(event) => event.preventDefault()}
                sx={{ fontSize: '0.875rem', fontWeight: 600 }}
              >
                Forgot password?
              </Link>
            </Stack>

            <AuthSubmitButton loading={submitting} disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </AuthSubmitButton>
          </Stack>
        </form>

        <Divider sx={{ my: 3 }}>New to Ticket Desk?</Divider>

        <Stack spacing={2}>
          <Button
            component={RouterLink}
            to="/register"
            variant="outlined"
            size="large"
            fullWidth
            sx={{
              borderRadius: 3,
              py: 1.4,
              fontWeight: 700,
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 10px 24px -14px rgba(37, 99, 235, 0.5)',
              },
              transition: 'box-shadow 0.25s ease, transform 0.25s ease',
            }}
          >
            Create account
          </Button>
          <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
            By continuing you agree to the Terms of Service and Privacy Policy.
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}