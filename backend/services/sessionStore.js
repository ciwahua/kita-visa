const sessionStore = new Map();

function setSession(sessionId, data) {
  if (!sessionId) return;
  sessionStore.set(sessionId, {
    ...(sessionStore.get(sessionId) || {}),
    ...data
  });
}

function getSession(sessionId) {
  return sessionStore.get(sessionId) || null;
}

function clearSession(sessionId) {
  sessionStore.delete(sessionId);
}

module.exports = {
  sessionStore,
  setSession,
  getSession,
  clearSession
};