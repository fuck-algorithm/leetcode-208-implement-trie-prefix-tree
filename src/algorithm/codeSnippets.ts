import type { ProgrammingLanguage } from '../types';

export interface CodeSnippet {
  language: ProgrammingLanguage;
  displayName: string;
  code: string;
  lineCount: number;
}

export const codeSnippets: Record<ProgrammingLanguage, CodeSnippet> = {
  java: {
    language: 'java',
    displayName: 'Java',
    code: `class Trie {
    private Trie[] children;
    private boolean isEnd;

    public Trie() {
        children = new Trie[26];
        isEnd = false;
    }

    public void insert(String word) {
        Trie node = this;
        for (char ch : word.toCharArray()) {
            int index = ch - 'a';
            if (node.children[index] == null) {
                node.children[index] = new Trie();
            }
            node = node.children[index];
        }
        node.isEnd = true;
    }

    public boolean search(String word) {
        Trie node = searchPrefix(word);
        return node != null && node.isEnd;
    }

    private Trie searchPrefix(String prefix) {
        Trie node = this;
        for (char ch : prefix.toCharArray()) {
            int index = ch - 'a';
            if (node.children[index] == null) {
                return null;
            }
            node = node.children[index];
        }
        return node;
    }

    public boolean startsWith(String prefix) {
        return searchPrefix(prefix) != null;
    }
}`,
    lineCount: 40,
  },
  python: {
    language: 'python',
    displayName: 'Python',
    code: `class Trie:
    def __init__(self):
        self.children = {}
        self.is_end = False

    def insert(self, word: str) -> None:
        node = self
        for ch in word:
            if ch not in node.children:
                node.children[ch] = Trie()
            node = node.children[ch]
        node.is_end = True

    def search(self, word: str) -> bool:
        node = self._search_prefix(word)
        return node is not None and node.is_end

    def _search_prefix(self, prefix: str):
        node = self
        for ch in prefix:
            if ch not in node.children:
                return None
            node = node.children[ch]
        return node

    def startsWith(self, prefix: str) -> bool:
        return self._search_prefix(prefix) is not None`,
    lineCount: 27,
  },
  golang: {
    language: 'golang',
    displayName: 'Go',
    code: `type Trie struct {
    children [26]*Trie
    isEnd    bool
}

func Constructor() Trie {
    return Trie{}
}

func (t *Trie) Insert(word string) {
    node := t
    for _, ch := range word {
        index := ch - 'a'
        if node.children[index] == nil {
            node.children[index] = &Trie{}
        }
        node = node.children[index]
    }
    node.isEnd = true
}

func (t *Trie) Search(word string) bool {
    node := t.searchPrefix(word)
    return node != nil && node.isEnd
}

func (t *Trie) searchPrefix(prefix string) *Trie {
    node := t
    for _, ch := range prefix {
        index := ch - 'a'
        if node.children[index] == nil {
            return nil
        }
        node = node.children[index]
    }
    return node
}

func (t *Trie) StartsWith(prefix string) bool {
    return t.searchPrefix(prefix) != nil
}`,
    lineCount: 40,
  },
  javascript: {
    language: 'javascript',
    displayName: 'JavaScript',
    code: `class Trie {
    constructor() {
        this.children = {};
        this.isEnd = false;
    }

    insert(word) {
        let node = this;
        for (const ch of word) {
            if (!node.children[ch]) {
                node.children[ch] = new Trie();
            }
            node = node.children[ch];
        }
        node.isEnd = true;
    }

    search(word) {
        const node = this.searchPrefix(word);
        return node !== null && node.isEnd;
    }

    searchPrefix(prefix) {
        let node = this;
        for (const ch of prefix) {
            if (!node.children[ch]) {
                return null;
            }
            node = node.children[ch];
        }
        return node;
    }

    startsWith(prefix) {
        return this.searchPrefix(prefix) !== null;
    }
}`,
    lineCount: 36,
  },
};

export function getCodeSnippet(language: ProgrammingLanguage): CodeSnippet {
  return codeSnippets[language];
}
