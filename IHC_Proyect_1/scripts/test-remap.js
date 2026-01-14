import remap from '../src/utils/remapSerializedTree.js';

function sampleTree() {
  return {
    ROOT: { nodes: ['n1'] },
    n1: { id: 'n1', nodes: ['n2'], custom: {}, props: {} },
    n2: { id: 'n2', nodes: [], custom: {}, props: {} }
  };
}

const tree = sampleTree();
const result = remap(tree);
console.log('Remap result:', result);
console.assert(result && result.rootNodes && result.rootNodes.length === 1, 'rootNodes length should be 1');
console.assert(Object.keys(result.newNodes).length === 2, 'should have remapped 2 nodes');
console.log('OK - remapSerializedTree basic smoke test');
