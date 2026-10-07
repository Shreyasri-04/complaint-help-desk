export const MESSAGES = {
  dashboard: {
    title: 'Assigned Tickets',
    subtitle: 'Review and action tickets raised by your assigned users.',
    empty: 'No assigned tickets yet.',
    emptyDescription: 'Tickets raised by users assigned to you will appear here.',
    loadFailed: 'Could not load assigned tickets.',
    stats: {
      total: 'Total tickets',
      open: 'Open',
      approved: 'Approved',
      rejected: 'Rejected',
    },
  },
  ticket: {
    approved: 'Ticket approved.',
    rejected: 'Ticket rejected.',
    actionFailed: 'Could not update the ticket.',
    noSubject: 'Untitled ticket',
  },
  comment: {
    empty: 'No comments yet. Start the conversation.',
    added: 'Comment added.',
    failed: 'Could not add your comment.',
    placeholder: 'Write a comment…',
  },
  dialog: {
    detailsTitle: 'Ticket details',
    close: 'Close',
  },
  team: {
    title: 'Team',
    subtitle: 'Users reporting to each manager.',
    managerLabel: 'Manager',
    empty: 'No users under this manager yet.',
    emptyDescription: 'Users assigned to the selected manager will appear here.',
    noManagers: 'No managers found.',
    noManagersDescription: 'Create a user with the manager role first.',
  },
  profile: {
    title: 'Profile',
    subtitle: 'Your account and role.',
    username: 'Username',
  },
} as const;

export const VALIDATION_MESSAGES = {
  username: {
    required: 'Username is required',
    min: (min: number) => `Username must be at least ${min} characters`,
    max: (max: number) => `Username must be at most ${max} characters`,
    startLetter: 'Username must start with a letter',
    noSpaces: 'Username must not contain spaces',
    validChars: 'Username may only contain letters, numbers and underscore',
    noConsecutiveUnderscore: 'Username must not contain consecutive underscores',
    noTrailingUnderscore: 'Username must not end with underscore',
  },
  password: {
    required: 'Password is required',
    min: (min: number) => `Password must be at least ${min} characters`,
    max: (max: number) => `Password must be at most ${max} characters`,
    uppercase: 'Must contain at least one uppercase letter',
    lowercase: 'Must contain at least one lowercase letter',
    number: 'Must contain at least one number',
    special: 'Must contain at least one special character',
    noSpaces: 'Password must not contain spaces',
    weak: 'Password is too common',
    repeating: 'Password must not contain repeated characters',
    sequential: 'Password must not contain sequential patterns',
    containsUsername: 'Password must not contain your username',
  },
  confirmPassword: {
    required: 'Please confirm your password',
    mismatch: 'Passwords do not match',
  },
};
