import rawProtocol from "../protocol.json";
import {
  assertValidAclsProtocolDefinition,
  type AclsProtocolDefinition,
} from "./protocol-schema";

const aclsProtocol = assertValidAclsProtocolDefinition(
  rawProtocol as AclsProtocolDefinition
);

export { aclsProtocol };
