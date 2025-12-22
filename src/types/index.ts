// Trie节点类型
export interface TrieNode {
  id: string;
  char: string;
  children: Map<string, TrieNode>;
  isEnd: boolean;
  depth: number;
  parent: TrieNode | null;
}

// 可视化节点类型
export interface VisualNode {
  id: string;
  char: string;
  isEnd: boolean;
  x: number;
  y: number;
  depth: number;
  children: VisualNode[];
  highlighted: boolean;
  highlightType?: 'current' | 'path' | 'found' | 'notFound' | 'inserted';
  label?: string;
}

// 可视化边类型
export interface VisualEdge {
  source: VisualNode;
  target: VisualNode;
  highlighted: boolean;
  label?: string;
}

// 操作类型
export type OperationType = 'insert' | 'search' | 'startsWith';

// 操作记录
export interface Operation {
  type: OperationType;
  word: string;
  result?: boolean;
}

// 算法步骤
export interface AlgorithmStep {
  stepIndex: number;
  description: string;
  codeLineMap: {
    java: number[];
    python: number[];
    golang: number[];
    javascript: number[];
  };
  highlightedNodes: string[];
  highlightedEdges: string[];
  currentChar?: string;
  currentCharIndex?: number;
  variables: Record<string, string | number | boolean>;
  trieSnapshot: VisualNode | null;
  annotations: Annotation[];
  action?: 'moveToChild' | 'createNode' | 'markEnd' | 'checkEnd' | 'returnResult';
}

// 标注类型
export interface Annotation {
  nodeId?: string;
  edgeId?: string;
  text: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  type: 'info' | 'action' | 'result' | 'value';
}

// 编程语言
export type ProgrammingLanguage = 'java' | 'python' | 'golang' | 'javascript';

// 播放状态
export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
}

// 示例数据
export interface ExampleData {
  name: string;
  operations: Operation[];
}
