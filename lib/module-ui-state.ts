type ProtocolUiState = {
  activeTab?: number;
  flowType?: "emergencia" | "uti_internado";
};

const protocolUiState = new Map<string, ProtocolUiState>();

function getProtocolUiState(protocolId: string): ProtocolUiState | undefined {
  return protocolUiState.get(protocolId);
}

function updateProtocolUiState(protocolId: string, nextState: ProtocolUiState) {
  const current = protocolUiState.get(protocolId) ?? {};
  protocolUiState.set(protocolId, { ...current, ...nextState });
}

type ProtocolUiStateSnapshotEntry = { protocolId: string; state: ProtocolUiState };

function exportProtocolUiStateSnapshot(): ProtocolUiStateSnapshotEntry[] {
  return [...protocolUiState.entries()].map(([protocolId, state]) => ({
    protocolId,
    state: { ...state },
  }));
}

function restoreProtocolUiStateSnapshot(snapshot: ProtocolUiStateSnapshotEntry[]) {
  protocolUiState.clear();
  for (const entry of snapshot) {
    if (!entry.protocolId.trim()) continue;
    protocolUiState.set(entry.protocolId, { ...entry.state });
  }
}

function clearProtocolUiState(protocolId: string) {
  protocolUiState.delete(protocolId);
}

export {
  clearProtocolUiState,
  exportProtocolUiStateSnapshot,
  getProtocolUiState,
  restoreProtocolUiStateSnapshot,
  updateProtocolUiState,
};
