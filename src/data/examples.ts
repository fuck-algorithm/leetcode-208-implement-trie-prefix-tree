import type { ExampleData, Operation } from '../types';

export const exampleDatasets: ExampleData[] = [
  {
    name: '示例1: apple & app',
    operations: [
      { type: 'insert', word: 'apple' },
      { type: 'search', word: 'apple' },
      { type: 'search', word: 'app' },
      { type: 'startsWith', word: 'app' },
      { type: 'insert', word: 'app' },
      { type: 'search', word: 'app' },
    ],
  },
  {
    name: '示例2: hello & world',
    operations: [
      { type: 'insert', word: 'hello' },
      { type: 'insert', word: 'world' },
      { type: 'search', word: 'hello' },
      { type: 'search', word: 'world' },
      { type: 'startsWith', word: 'hel' },
      { type: 'startsWith', word: 'wor' },
    ],
  },
  {
    name: '示例3: 前缀树特性',
    operations: [
      { type: 'insert', word: 'cat' },
      { type: 'insert', word: 'car' },
      { type: 'insert', word: 'card' },
      { type: 'search', word: 'cat' },
      { type: 'search', word: 'ca' },
      { type: 'startsWith', word: 'ca' },
    ],
  },
  {
    name: '示例4: 单字符',
    operations: [
      { type: 'insert', word: 'a' },
      { type: 'insert', word: 'ab' },
      { type: 'insert', word: 'abc' },
      { type: 'search', word: 'a' },
      { type: 'search', word: 'ab' },
      { type: 'search', word: 'abc' },
      { type: 'search', word: 'abcd' },
    ],
  },
];

// 生成随机单词
function generateRandomWord(minLength: number = 1, maxLength: number = 8): string {
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let word = '';
  for (let i = 0; i < length; i++) {
    word += String.fromCharCode(97 + Math.floor(Math.random() * 26));
  }
  return word;
}

// 生成随机操作序列
export function generateRandomOperations(count: number = 6): Operation[] {
  const operations: Operation[] = [];
  const insertedWords: string[] = [];
  
  // 确保至少有一些插入操作
  const insertCount = Math.max(2, Math.floor(count * 0.4));
  
  for (let i = 0; i < insertCount; i++) {
    const word = generateRandomWord(2, 6);
    operations.push({ type: 'insert', word });
    insertedWords.push(word);
  }
  
  // 添加搜索和前缀搜索操作
  const remainingCount = count - insertCount;
  for (let i = 0; i < remainingCount; i++) {
    const opType = Math.random() > 0.5 ? 'search' : 'startsWith';
    
    // 50%概率使用已插入的单词或其前缀
    let word: string;
    if (insertedWords.length > 0 && Math.random() > 0.5) {
      const baseWord = insertedWords[Math.floor(Math.random() * insertedWords.length)];
      if (opType === 'startsWith' && baseWord.length > 1) {
        // 使用前缀
        const prefixLength = Math.floor(Math.random() * (baseWord.length - 1)) + 1;
        word = baseWord.substring(0, prefixLength);
      } else {
        word = baseWord;
      }
    } else {
      word = generateRandomWord(1, 5);
    }
    
    operations.push({ type: opType, word });
  }
  
  return operations;
}

// 解析用户输入的操作
export function parseUserInput(input: string): Operation[] | null {
  try {
    // 尝试解析JSON格式
    // 格式: [["Trie"], ["insert", "apple"], ["search", "apple"]]
    const parsed = JSON.parse(input);
    
    if (!Array.isArray(parsed) || parsed.length < 2) {
      return null;
    }
    
    const operations: Operation[] = [];
    
    // 跳过第一个Trie初始化
    for (let i = 1; i < parsed.length; i++) {
      const [method, arg] = parsed[i];
      
      if (method === 'insert' && typeof arg === 'string') {
        operations.push({ type: 'insert', word: arg });
      } else if (method === 'search' && typeof arg === 'string') {
        operations.push({ type: 'search', word: arg });
      } else if (method === 'startsWith' && typeof arg === 'string') {
        operations.push({ type: 'startsWith', word: arg });
      }
    }
    
    return operations.length > 0 ? operations : null;
  } catch {
    // 尝试解析简单格式
    // 格式: insert apple, search apple, startsWith app
    const lines = input.split(/[,\n]/).map(s => s.trim()).filter(s => s);
    const operations: Operation[] = [];
    
    for (const line of lines) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const method = parts[0].toLowerCase();
        const word = parts[1];
        
        if (/^[a-z]+$/.test(word)) {
          if (method === 'insert') {
            operations.push({ type: 'insert', word });
          } else if (method === 'search') {
            operations.push({ type: 'search', word });
          } else if (method === 'startswith' || method === 'startsWith') {
            operations.push({ type: 'startsWith', word });
          }
        }
      }
    }
    
    return operations.length > 0 ? operations : null;
  }
}

// 验证单词是否合法
export function isValidWord(word: string): boolean {
  return /^[a-z]+$/.test(word) && word.length >= 1 && word.length <= 2000;
}
