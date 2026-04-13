type AirwayReturnHandoff = {
  targetProtocolId: string;
  airwayValue: string;
  oxygenValue?: string;
};

const airwayReturnHandoffs = new Map<string, AirwayReturnHandoff>();

function setAirwayReturnHandoff(handoff: AirwayReturnHandoff) {
  airwayReturnHandoffs.set(handoff.targetProtocolId, handoff);
}

function consumeAirwayReturnHandoff(targetProtocolId: string) {
  const handoff = airwayReturnHandoffs.get(targetProtocolId);
  if (handoff) {
    airwayReturnHandoffs.delete(targetProtocolId);
  }
  return handoff;
}

export { consumeAirwayReturnHandoff, setAirwayReturnHandoff };
