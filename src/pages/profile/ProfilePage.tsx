import { Avatar, Box, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import {
  BadgeOutlined as IdIcon,
  PhoneOutlined as PhoneIcon,
  WorkOutlined as DesignationIcon,
  EmailOutlined as EmailIcon,
  SupervisorAccountOutlined as ManagerIcon,
  PeopleOutlined as HrIcon,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/context/useAuth';
import { employeeProfileForRole } from '@/utils/employeeProfiles';
import { MESSAGES } from '@/utils/messages';

function InfoRow({ icon: Icon, label, value }: { icon: SvgIconComponent; label: string; value: string }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'primary.main', mt: 0.25 }}>
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>
      <Stack spacing={2}>{children}</Stack>
    </Paper>
  );
}

/**
 * Read-only My Profile page — same `/profile` route and layout for every
 * role. Identity (username/role) comes from the Zustand auth store; employee
 * details are hardcoded per role in `utils/employeeProfiles` (no API call,
 * no backend change). Display-only: no edit affordances.
 */
export function ProfilePage() {
  const { username, role } = useAuth();
  const profile = employeeProfileForRole(role);
  const initial = (username ?? 'U').charAt(0).toUpperCase();

  return (
    <Box>
      <PageHeader title={MESSAGES.profile.title} subtitle={MESSAGES.profile.subtitle} />

      {/* Account card (existing identity block, unchanged behavior). */}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, maxWidth: 520, mb: 3 }}>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ width: 64, height: 64, fontSize: 28, fontWeight: 700, bgcolor: 'primary.main' }}>
            {initial}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {MESSAGES.profile.username}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
              {username ?? '—'}
            </Typography>
            <Chip label={role ?? '—'} size="small" color="primary" sx={{ mt: 0.5 }} />
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Employee Information">
            <InfoRow icon={IdIcon} label="Employee ID" value={profile.employeeId} />
            <InfoRow icon={PhoneIcon} label="Phone Number" value={profile.phoneNumber} />
            <InfoRow icon={DesignationIcon} label="Designation" value={profile.designation} />
            <InfoRow icon={EmailIcon} label="Employee Email ID" value={profile.email} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Organization">
            <InfoRow icon={ManagerIcon} label="Project Manager" value={profile.projectManager} />
            <InfoRow icon={ManagerIcon} label="Reporting Manager" value={profile.reportingManager} />
            <InfoRow icon={HrIcon} label="HR Manager" value={profile.hrManager} />
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
