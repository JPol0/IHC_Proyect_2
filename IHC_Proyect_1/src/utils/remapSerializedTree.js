/**
 * Remap serialized Craft.js tree node IDs to new unique IDs to allow safe insertion
 * into an existing canvas without id collisions.
 *
 * Input: tree (serialized craft object) with keys like 'ROOT' and node ids.
 * Output: { newNodes: { newId: node }, rootNodes: [newRootNodeIds] }
 */
export function remapSerializedTree(tree = {}) {
  const keys = Object.keys(tree);
  const oldToNew = {};
  keys.forEach(k => { if (k !== 'ROOT') oldToNew[k] = 'c_' + Math.random().toString(36).slice(2,9); });

  const newNodes = {};
  keys.forEach(k => {
    if (k === 'ROOT') return;
    const node = tree[k];
    const newNode = JSON.parse(JSON.stringify(node));
    if (Array.isArray(newNode.nodes)) newNode.nodes = newNode.nodes.map(nid => oldToNew[nid] || nid);
    if (newNode.linkedNodes && typeof newNode.linkedNodes === 'object') {
      const ln = {};
      Object.entries(newNode.linkedNodes).forEach(([lk, lv]) => {
        ln[ oldToNew[lk] || lk ] = lv;
      });
      newNode.linkedNodes = ln;
    }
    if (newNode.id) newNode.id = oldToNew[k] || newNode.id;
    newNodes[ oldToNew[k] ] = newNode;
  });

  const rootNodes = (tree.ROOT && Array.isArray(tree.ROOT.nodes)) ? tree.ROOT.nodes.map(nid => oldToNew[nid] || nid) : [];
  return { newNodes, rootNodes };
}

export default remapSerializedTree;
