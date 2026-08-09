export type Role = 'super_admin' | 'manager' | 'order_handler';

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: ['orders', 'products', 'customers', 'addons', 'settings', 'analytics', 'staffs'],
  manager: ['orders', 'products', 'customers', 'analytics'],
  order_handler: ['orders']
};

export function hasPermission(role: Role, tab: string): boolean {
  const allowedTabs = ROLE_PERMISSIONS[role] || ['orders'];
  return allowedTabs.includes(tab);
}