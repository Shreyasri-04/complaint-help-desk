import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PersonOutlined from '@mui/icons-material/PersonOutlined';
import { useAuth } from '@/context/useAuth';
import { ApiError } from '@/api/ApiError';
import { ErrorBanner } from '@/components/common/ErrorBanner';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { PasswordField } from '@/components/auth/PasswordField';
import { hasRegisterFieldErrors, validateRegisterForm } from '@/schemas/authSchema';
import type { RegisterFieldErrors } from '@/schemas/authSchema';
import { VALIDATION } from '@/utils/constants';
import { defaultRouteForRole } from '@/utils/routes';

type RegisterField = 'username' | 'password' | 'confirmPassword';

export function RegisterPage() {
  // Authenticated visits are bounced by PublicRoute (App.tsx) — no guard needed here.
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [error, setError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: RegisterField, value: string) => {
    const next = {
      username: field === 'username' ? value : username,
      password: field === 'password' ? value : password,
      confirmPassword: field === 'confirmPassword' ? value : confirmPassword,
    };
    if (field === 'username') {
      setUsername(value);
    } else if (field === 'password') {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }
    // Real-time validation: re-check the whole form on every keystroke so the
    // password-match rule stays in sync whichever field is being edited.
    setFieldErrors(validateRegisterForm(next));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) {
      return;
    }

    const clientErrors = validateRegisterForm({ username, password, confirmPassword });
    setFieldErrors(clientErrors);
    if (hasRegisterFieldErrors(clientErrors)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const auth = await register({ username: username.trim(), password });
      if (auth) {
        // Register response did not include a token → go sign in.
        navigate('/login', {
          state: { message: 'Account created. Please sign in.' },
        });
      } else {
        navigate(defaultRouteForRole(), { replace: true });
      }
    } catch (err) {
      const apiError = ApiError.from(err);
      setError(apiError);
      if (apiError.hasFieldErrors) {
        setFieldErrors((previous) => {
          const next = { ...previous };
          const server = apiError.fieldErrors;
          if (server.username) {
            next.username = server.username;
          }
          if (server.password) {
            next.password = server.password;
          }
          if (server.confirmPassword) {
            next.confirmPassword = server.confirmPassword;
          }
          return next;
        });
      }
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
            Create account
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign up for a Ticket Desk account.
          </Typography>

          <ErrorBanner error={error} />

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <AuthTextField
                label="Username"
                icon={<PersonOutlined />}
                value={username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
                autoComplete="username"
                autoFocus
                error={Boolean(fieldErrors.username)}
                helperText={
                  fieldErrors.username ||
                  `${VALIDATION.strictUsername.min}–${VALIDATION.strictUsername.max} characters, letter first, a–z 0–9 _`
                }
                slotProps={{ htmlInput: { maxLength: VALIDATION.username.max } }}
              />
              <PasswordField
                label="Password"
                icon={<LockOutlined />}
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                autoComplete="new-password"
                error={Boolean(fieldErrors.password)}
                helperText={
                  fieldErrors.password ||
                  `${VALIDATION.strictPassword.min}+ characters: upper, lower, number & symbol`
                }
                slotProps={{ htmlInput: { maxLength: VALIDATION.password.max } }}
              />
              <PasswordField
                label="Confirm password"
                icon={<LockOutlined />}
                value={confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                autoComplete="new-password"
                error={Boolean(fieldErrors.confirmPassword)}
                helperText={fieldErrors.confirmPassword || 'Repeat your password'}
                slotProps={{ htmlInput: { maxLength: VALIDATION.password.max } }}
              />
              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Sign in
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
