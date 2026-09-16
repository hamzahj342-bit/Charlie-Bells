export const STAFF_ROLES = ['admin', 'super_admin'];

// Anyone who may open the admin dashboard.
export const isStaff = (user) => STAFF_ROLES.includes(user?.role);

// Owner-level access, e.g. the payment audit trail.
export const isSuperAdmin = (user) => user?.role === 'super_admin';
