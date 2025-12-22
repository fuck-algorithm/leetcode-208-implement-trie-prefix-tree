import type { TrieNode, VisualNode, AlgorithmStep, Operation } from '../types';

// 生成唯一ID
let nodeIdCounter = 0;
function generateNodeId(): string {
  return `node-${nodeIdCounter++}`;
}

// 重置ID计数器
export function resetNodeIdCounter(): void {
  nodeIdCounter = 0;
}

// 创建Trie节点
export function createTrieNode(char: string, depth: number, parent: TrieNode | null): TrieNode {
  return {
    id: generateNodeId(),
    char,
    children: new Map(),
    isEnd: false,
    depth,
    parent,
  };
}

// Trie类
export class Trie {
  root: TrieNode;
  
  constructor() {
    resetNodeIdCounter();
    this.root = createTrieNode('', 0, null);
  }
  
  insert(word: string): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, createTrieNode(char, node.depth + 1, node));
      }
      node = node.children.get(char)!;
    }
    node.isEnd = true;
  }
  
  search(word: string): boolean {
    const node = this.searchPrefix(word);
    return node !== null && node.isEnd;
  }
  
  startsWith(prefix: string): boolean {
    return this.searchPrefix(prefix) !== null;
  }
  
  private searchPrefix(prefix: string): TrieNode | null {
    let node: TrieNode | null = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char)!;
    }
    return node;
  }
  
  // 转换为可视化节点
  toVisualNode(): VisualNode {
    return this.convertToVisual(this.root, 0, 0);
  }
  
  private convertToVisual(node: TrieNode, x: number, y: number): VisualNode {
    const children: VisualNode[] = [];
    let childIndex = 0;
    const childCount = node.children.size;
    
    node.children.forEach((child) => {
      const childX = x + (childIndex - (childCount - 1) / 2) * 80;
      const childY = y + 80;
      children.push(this.convertToVisual(child, childX, childY));
      childIndex++;
    });
    
    return {
      id: node.id,
      char: node.char || 'root',
      isEnd: node.isEnd,
      x,
      y,
      depth: node.depth,
      children,
      highlighted: false,
    };
  }
}

// 生成算法步骤
export function generateSteps(operations: Operation[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const trie = new Trie();
  let stepIndex = 0;
  
  // 初始步骤
  steps.push({
    stepIndex: stepIndex++,
    description: '初始化Trie（前缀树），创建根节点',
    codeLineMap: {
      java: [3, 4, 5],
      python: [3, 4],
      golang: [8, 9, 10],
      javascript: [3, 4, 5],
    },
    highlightedNodes: [trie.root.id],
    highlightedEdges: [],
    variables: {},
    trieSnapshot: trie.toVisualNode(),
    annotations: [{
      nodeId: trie.root.id,
      text: '根节点',
      position: 'top',
      type: 'info',
    }],
  });
  
  for (const op of operations) {
    if (op.type === 'insert') {
      const insertSteps = generateInsertSteps(trie, op.word, stepIndex);
      steps.push(...insertSteps);
      stepIndex += insertSteps.length;
    } else if (op.type === 'search') {
      const searchSteps = generateSearchSteps(trie, op.word, stepIndex);
      steps.push(...searchSteps);
      stepIndex += searchSteps.length;
      op.result = trie.search(op.word);
    } else if (op.type === 'startsWith') {
      const startsWithSteps = generateStartsWithSteps(trie, op.word, stepIndex);
      steps.push(...startsWithSteps);
      stepIndex += startsWithSteps.length;
      op.result = trie.startsWith(op.word);
    }
  }
  
  return steps;
}

function generateInsertSteps(trie: Trie, word: string, startIndex: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let stepIndex = startIndex;
  let node = trie.root;
  const pathNodes: string[] = [node.id];
  
  // 开始插入
  steps.push({
    stepIndex: stepIndex++,
    description: `开始插入单词 "${word}"`,
    codeLineMap: {
      java: [7],
      python: [6],
      golang: [13],
      javascript: [7],
    },
    highlightedNodes: [node.id],
    highlightedEdges: [],
    currentChar: undefined,
    currentCharIndex: -1,
    variables: { word, node: 'root' },
    trieSnapshot: trie.toVisualNode(),
    annotations: [{
      nodeId: node.id,
      text: `插入 "${word}"`,
      position: 'top',
      type: 'action',
    }],
  });
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const hasChild = node.children.has(char);
    
    if (!hasChild) {
      // 创建新节点
      const newNode = createTrieNode(char, node.depth + 1, node);
      node.children.set(char, newNode);
      
      steps.push({
        stepIndex: stepIndex++,
        description: `字符 '${char}' 不存在，创建新节点`,
        codeLineMap: {
          java: [9, 10, 11],
          python: [8, 9],
          golang: [15, 16, 17],
          javascript: [9, 10, 11],
        },
        highlightedNodes: [...pathNodes, newNode.id],
        highlightedEdges: [],
        currentChar: char,
        currentCharIndex: i,
        variables: { word, char, index: i, action: 'create' },
        trieSnapshot: trie.toVisualNode(),
        annotations: [
          {
            nodeId: newNode.id,
            text: `新建节点 '${char}'`,
            position: 'top',
            type: 'action',
          },
        ],
        action: 'createNode',
      });
      
      node = newNode;
    } else {
      // 移动到子节点
      const childNode = node.children.get(char)!;
      
      steps.push({
        stepIndex: stepIndex++,
        description: `字符 '${char}' 已存在，移动到子节点`,
        codeLineMap: {
          java: [12],
          python: [10],
          golang: [18],
          javascript: [12],
        },
        highlightedNodes: [...pathNodes, childNode.id],
        highlightedEdges: [],
        currentChar: char,
        currentCharIndex: i,
        variables: { word, char, index: i, action: 'move' },
        trieSnapshot: trie.toVisualNode(),
        annotations: [
          {
            nodeId: childNode.id,
            text: `移动到 '${char}'`,
            position: 'top',
            type: 'action',
          },
        ],
        action: 'moveToChild',
      });
      
      node = childNode;
    }
    
    pathNodes.push(node.id);
  }
  
  // 标记结束
  node.isEnd = true;
  
  steps.push({
    stepIndex: stepIndex++,
    description: `标记节点为单词结尾，"${word}" 插入完成`,
    codeLineMap: {
      java: [14],
      python: [11],
      golang: [20],
      javascript: [14],
    },
    highlightedNodes: pathNodes,
    highlightedEdges: [],
    variables: { word, isEnd: true },
    trieSnapshot: trie.toVisualNode(),
    annotations: [
      {
        nodeId: node.id,
        text: `标记为结尾 ✓`,
        position: 'top',
        type: 'result',
      },
    ],
    action: 'markEnd',
  });
  
  return steps;
}

function generateSearchSteps(trie: Trie, word: string, startIndex: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let stepIndex = startIndex;
  let node: TrieNode = trie.root;
  const pathNodes: string[] = [node.id];
  
  // 开始搜索
  steps.push({
    stepIndex: stepIndex++,
    description: `开始搜索单词 "${word}"`,
    codeLineMap: {
      java: [17],
      python: [13],
      golang: [23],
      javascript: [17],
    },
    highlightedNodes: [node.id],
    highlightedEdges: [],
    variables: { word, node: 'root' },
    trieSnapshot: trie.toVisualNode(),
    annotations: [{
      nodeId: node.id,
      text: `搜索 "${word}"`,
      position: 'top',
      type: 'action',
    }],
  });
  
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    
    if (!node.children.has(char)) {
      // 未找到
      steps.push({
        stepIndex: stepIndex++,
        description: `字符 '${char}' 不存在，搜索失败`,
        codeLineMap: {
          java: [21, 22],
          python: [17, 18],
          golang: [27, 28],
          javascript: [21, 22],
        },
        highlightedNodes: pathNodes,
        highlightedEdges: [],
        currentChar: char,
        currentCharIndex: i,
        variables: { word, char, index: i, found: false },
        trieSnapshot: trie.toVisualNode(),
        annotations: [{
          nodeId: node.id,
          text: `'${char}' 不存在 ✗`,
          position: 'right',
          type: 'result',
        }],
        action: 'returnResult',
      });
      
      steps.push({
        stepIndex: stepIndex++,
        description: `返回 false，单词 "${word}" 不在Trie中`,
        codeLineMap: {
          java: [18, 19],
          python: [14, 15],
          golang: [24, 25],
          javascript: [18, 19],
        },
        highlightedNodes: pathNodes,
        highlightedEdges: [],
        variables: { word, result: false },
        trieSnapshot: trie.toVisualNode(),
        annotations: [],
        action: 'returnResult',
      });
      
      return steps;
    }
    
    const childNode = node.children.get(char)!;
    
    steps.push({
      stepIndex: stepIndex++,
      description: `找到字符 '${char}'，移动到子节点`,
      codeLineMap: {
        java: [23],
        python: [19],
        golang: [29],
        javascript: [23],
      },
      highlightedNodes: [...pathNodes, childNode.id],
      highlightedEdges: [],
      currentChar: char,
      currentCharIndex: i,
      variables: { word, char, index: i },
      trieSnapshot: trie.toVisualNode(),
      annotations: [{
        nodeId: childNode.id,
        text: `找到 '${char}'`,
        position: 'top',
        type: 'action',
      }],
      action: 'moveToChild',
    });
    
    node = childNode;
    pathNodes.push(node.id);
  }
  
  // 检查是否为单词结尾
  const isEnd = node.isEnd;
  
  steps.push({
    stepIndex: stepIndex++,
    description: isEnd 
      ? `节点标记为单词结尾，搜索成功！返回 true`
      : `节点未标记为单词结尾，搜索失败。返回 false`,
    codeLineMap: {
      java: [18, 19],
      python: [14, 15],
      golang: [24, 25],
      javascript: [18, 19],
    },
    highlightedNodes: pathNodes,
    highlightedEdges: [],
    variables: { word, isEnd, result: isEnd },
    trieSnapshot: trie.toVisualNode(),
    annotations: [{
      nodeId: node.id,
      text: isEnd ? `是单词结尾 ✓` : `非单词结尾 ✗`,
      position: 'top',
      type: 'result',
    }],
    action: 'checkEnd',
  });
  
  return steps;
}

function generateStartsWithSteps(trie: Trie, prefix: string, startIndex: number): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  let stepIndex = startIndex;
  let node: TrieNode = trie.root;
  const pathNodes: string[] = [node.id];
  
  // 开始前缀搜索
  steps.push({
    stepIndex: stepIndex++,
    description: `开始搜索前缀 "${prefix}"`,
    codeLineMap: {
      java: [26],
      python: [21],
      golang: [32],
      javascript: [26],
    },
    highlightedNodes: [node.id],
    highlightedEdges: [],
    variables: { prefix, node: 'root' },
    trieSnapshot: trie.toVisualNode(),
    annotations: [{
      nodeId: node.id,
      text: `搜索前缀 "${prefix}"`,
      position: 'top',
      type: 'action',
    }],
  });
  
  for (let i = 0; i < prefix.length; i++) {
    const char = prefix[i];
    
    if (!node.children.has(char)) {
      // 未找到
      steps.push({
        stepIndex: stepIndex++,
        description: `字符 '${char}' 不存在，前缀不存在`,
        codeLineMap: {
          java: [21, 22],
          python: [17, 18],
          golang: [27, 28],
          javascript: [21, 22],
        },
        highlightedNodes: pathNodes,
        highlightedEdges: [],
        currentChar: char,
        currentCharIndex: i,
        variables: { prefix, char, index: i, found: false },
        trieSnapshot: trie.toVisualNode(),
        annotations: [{
          nodeId: node.id,
          text: `'${char}' 不存在 ✗`,
          position: 'right',
          type: 'result',
        }],
        action: 'returnResult',
      });
      
      steps.push({
        stepIndex: stepIndex++,
        description: `返回 false，前缀 "${prefix}" 不存在`,
        codeLineMap: {
          java: [27],
          python: [22],
          golang: [33],
          javascript: [27],
        },
        highlightedNodes: pathNodes,
        highlightedEdges: [],
        variables: { prefix, result: false },
        trieSnapshot: trie.toVisualNode(),
        annotations: [],
        action: 'returnResult',
      });
      
      return steps;
    }
    
    const childNode = node.children.get(char)!;
    
    steps.push({
      stepIndex: stepIndex++,
      description: `找到字符 '${char}'，移动到子节点`,
      codeLineMap: {
        java: [23],
        python: [19],
        golang: [29],
        javascript: [23],
      },
      highlightedNodes: [...pathNodes, childNode.id],
      highlightedEdges: [],
      currentChar: char,
      currentCharIndex: i,
      variables: { prefix, char, index: i },
      trieSnapshot: trie.toVisualNode(),
      annotations: [{
        nodeId: childNode.id,
        text: `找到 '${char}'`,
        position: 'top',
        type: 'action',
      }],
      action: 'moveToChild',
    });
    
    node = childNode;
    pathNodes.push(node.id);
  }
  
  // 前缀存在
  steps.push({
    stepIndex: stepIndex++,
    description: `前缀 "${prefix}" 存在，返回 true`,
    codeLineMap: {
      java: [27],
      python: [22],
      golang: [33],
      javascript: [27],
    },
    highlightedNodes: pathNodes,
    highlightedEdges: [],
    variables: { prefix, result: true },
    trieSnapshot: trie.toVisualNode(),
    annotations: [{
      nodeId: node.id,
      text: `前缀存在 ✓`,
      position: 'top',
      type: 'result',
    }],
    action: 'returnResult',
  });
  
  return steps;
}
