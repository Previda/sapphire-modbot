// Simple serverless-compatible database utility
let memoryStorage = new Map();

export function getDocument(collection, docId) {
  const key = `${collection}:${docId}`;
  return memoryStorage.get(key) || null;
}

export function setDocument(collection, docId, data) {
  const key = `${collection}:${docId}`;
  memoryStorage.set(key, data);
  return Promise.resolve(true);
}

export function deleteDocument(collection, docId) {
  const key = `${collection}:${docId}`;
  memoryStorage.delete(key);
  return Promise.resolve(true);
}

// Initialize with some mock data for verification
memoryStorage.set('verification:1340417327518191697', {
  enabled: false,
  channelId: null,
  roleId: null,
  type: 'button',
  dmWelcome: false,
  welcomeMessage: 'Welcome to the server!',
  removeUnverified: false,
  timeoutHours: 24
});

memoryStorage.set('verification_logs:1340417327518191697', { entries: [] });
memoryStorage.set('verification_attempts:1340417327518191697', { entries: [] });
