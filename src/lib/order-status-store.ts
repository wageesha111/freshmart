// In-memory status store to ensure real-time synchronization between Admin Dispatch Hub & Customer Storefront
export const orderStatusStore: Record<string, string> = {};

export function setCachedOrderStatus(id: string, status: string) {
  orderStatusStore[id] = status;
}

export function getCachedOrderStatus(id: string): string | undefined {
  return orderStatusStore[id];
}
