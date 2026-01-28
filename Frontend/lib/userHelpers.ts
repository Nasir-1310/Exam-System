// lib/userHelpers.ts
export const userModalConfigs = {
  deleteUserConfirm: (name: string) => ({
    title: 'Delete User',
    message: `Are you sure you want to delete ${name}?`,
  }),
};

export const createUserModalButtons = (confirmText: string, onConfirm: () => void, onCancel: () => void) => [
  {
    label: confirmText,
    onClick: onConfirm,
    variant: 'danger' as const,
  },
  {
    label: 'Cancel',
    onClick: onCancel,
    variant: 'secondary' as const,
  },
];