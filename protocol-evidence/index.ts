import { AVC_EVIDENCE_REGISTRY } from "./avc";
import { TEP_EVIDENCE_REGISTRY } from "./tep";
import { SCA_EVIDENCE_REGISTRY } from "./sca";
import type { ProtocolEvidenceRegistry } from "../lib/protocol-evidence-registry";

const registries: readonly ProtocolEvidenceRegistry[] = [
  AVC_EVIDENCE_REGISTRY,
  TEP_EVIDENCE_REGISTRY,
  SCA_EVIDENCE_REGISTRY,
];

const byProtocol = new Map<string, ProtocolEvidenceRegistry>();
for (const registry of registries) {
  const protocolId = registry.version.protocolId;
  if (byProtocol.has(protocolId)) {
    throw new Error(`ProtocolEvidenceRegistry duplicado: ${protocolId}`);
  }
  byProtocol.set(protocolId, registry);
}

export function listProtocolEvidenceRegistries(): readonly ProtocolEvidenceRegistry[] {
  return registries;
}

export function getProtocolEvidenceRegistry(protocolId: string): ProtocolEvidenceRegistry | undefined {
  return byProtocol.get(protocolId);
}

export function getEvidenceForNode(protocolId: string, nodeId: string) {
  const registry = byProtocol.get(protocolId);
  if (!registry) return [];
  const binding = registry.bindings.find((item) => item.nodeId === nodeId);
  if (!binding) return [];
  const recommendations = new Map(
    registry.version.recommendations.map((recommendation) => [recommendation.id, recommendation])
  );
  return binding.recommendationIds
    .map((id) => recommendations.get(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}
