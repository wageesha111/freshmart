// Global in-memory users map for fallback & local testing
export interface AuthUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
}

export const inMemoryUsers: Map<string, AuthUserRecord> =
  (global as any).__freshmart_users || new Map();
(global as any).__freshmart_users = inMemoryUsers;

// Seed demo profiles if not already present
if (!inMemoryUsers.has('rahul@example.com')) {
  inMemoryUsers.set('rahul@example.com', {
    id: 'u-demo-1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
  });
}

if (!inMemoryUsers.has('priya@example.com')) {
  inMemoryUsers.set('priya@example.com', {
    id: 'u-demo-2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'password123',
  });
}
