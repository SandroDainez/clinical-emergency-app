const preservedProtocolSessions = new Set<string>();

function markProtocolSessionForResume(protocolId: string) {
  if (!protocolId) {
    return;
  }
  preservedProtocolSessions.add(protocolId);
}

function isProtocolSessionMarkedForResume(protocolId: string) {
  return preservedProtocolSessions.has(protocolId);
}

function consumeProtocolSessionResume(protocolId: string) {
  const marked = preservedProtocolSessions.has(protocolId);
  if (marked) {
    preservedProtocolSessions.delete(protocolId);
  }
  return marked;
}

export {
  consumeProtocolSessionResume,
  isProtocolSessionMarkedForResume,
  markProtocolSessionForResume,
};
