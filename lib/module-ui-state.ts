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

function clearProtocolUiState(protocolId: string) {
  protocolUiState.delete(protocolId);
}

export { clearProtocolUiState, getProtocolUiState, updateProtocolUiState };
