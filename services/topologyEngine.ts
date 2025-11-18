export class TopologyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TopologyValidationError';
  }
}

export const validateAndProcessCircuit = (xmlString: string): string => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new TopologyValidationError("Invalid XML format. The generated XML could not be parsed.");
  }

  const circuit = xmlDoc.querySelector('circuit');
  if (!circuit) throw new TopologyValidationError("XML must have a root <circuit> element.");
  
  const componentsNode = circuit.querySelector('components');
  if (!componentsNode) throw new TopologyValidationError("<circuit> must contain a <components> section.");
  
  const connectionsNode = circuit.querySelector('connections');
  if (!connectionsNode) throw new TopologyValidationError("<circuit> must contain a <connections> section.");

  const components = componentsNode.querySelectorAll('component');
  const componentIds = new Set<string>();
  const idMap: Record<string, string> = {};
  const typeCounters: Record<string, number> = {};

  // 1. Validate component IDs and create new standardized IDs
  components.forEach((comp) => {
    const oldId = comp.getAttribute('id');
    if (!oldId || componentIds.has(oldId)) {
      throw new TopologyValidationError(`Found a component with a missing or duplicate ID: "${oldId || 'missing'}".`);
    }
    componentIds.add(oldId);

    const type = comp.getAttribute('type')?.toLowerCase() || 'comp';
    const typePrefix = type.replace(/[^a-z0-9]/gi, '').substring(0, 4);
    const count = (typeCounters[typePrefix] || 0) + 1;
    typeCounters[typePrefix] = count;
    const newId = `${typePrefix}-${count}`;
    
    idMap[oldId] = newId;
    comp.setAttribute('id', newId);
  });

  // 2. Validate and update connections
  const connections = connectionsNode.querySelectorAll('connection');
  connections.forEach((conn, index) => {
    const from = conn.querySelector('from');
    const to = conn.querySelector('to');

    if (!from || !to) {
      throw new TopologyValidationError(`Connection #${index + 1} is malformed (missing <from> or <to>).`);
    }

    const fromId = from.getAttribute('component_id');
    const toId = to.getAttribute('component_id');

    if (!fromId || !toId) {
      throw new TopologyValidationError(`Connection #${index + 1} has a missing component_id.`);
    }

    if (!componentIds.has(fromId)) {
      throw new TopologyValidationError(`Connection #${index + 1} refers to a non-existent component ID: "${fromId}".`);
    }
    if (!componentIds.has(toId)) {
      throw new TopologyValidationError(`Connection #${index + 1} refers to a non-existent component ID: "${toId}".`);
    }

    from.setAttribute('component_id', idMap[fromId]);
    to.setAttribute('component_id', idMap[toId]);
  });
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(xmlDoc);
};