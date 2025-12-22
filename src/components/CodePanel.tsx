import React, { useEffect, useState } from 'react';
import type { ProgrammingLanguage, AlgorithmStep } from '../types';
import { codeSnippets, getCodeSnippet } from '../algorithm/codeSnippets';
import { getSetting, saveSetting } from '../utils/db';
import './CodePanel.css';

interface CodePanelProps {
  currentStep: AlgorithmStep | null;
  selectedLanguage: ProgrammingLanguage;
  onLanguageChange: (lang: ProgrammingLanguage) => void;
}

const CodePanel: React.FC<CodePanelProps> = ({
  currentStep,
  selectedLanguage,
  onLanguageChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 从IndexedDB加载用户选择的语言
    getSetting('selectedLanguage').then((saved) => {
      if (saved && typeof saved === 'string') {
        const lang = saved as ProgrammingLanguage;
        if (codeSnippets[lang]) {
          onLanguageChange(lang);
        }
      }
      setIsLoading(false);
    });
  }, []);

  const handleLanguageChange = async (lang: ProgrammingLanguage) => {
    onLanguageChange(lang);
    await saveSetting('selectedLanguage', lang);
  };

  const snippet = getCodeSnippet(selectedLanguage);
  const highlightedLines = currentStep?.codeLineMap[selectedLanguage] || [];
  const variables = currentStep?.variables || {};

  const renderCodeLine = (line: string, lineNumber: number) => {
    const isHighlighted = highlightedLines.includes(lineNumber);
    
    // 查找该行是否有变量值需要显示
    let variableDisplay = '';
    if (isHighlighted && Object.keys(variables).length > 0) {
      const varEntries = Object.entries(variables)
        .filter(([key]) => !['action'].includes(key))
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `${key}="${value}"`;
          }
          return `${key}=${value}`;
        });
      if (varEntries.length > 0) {
        variableDisplay = ` // ${varEntries.join(', ')}`;
      }
    }

    return (
      <div
        key={lineNumber}
        className={`code-line ${isHighlighted ? 'highlighted' : ''}`}
      >
        <span className="line-number">{lineNumber}</span>
        <span className="line-content">
          <span dangerouslySetInnerHTML={{ __html: highlightSyntax(line, selectedLanguage) }} />
          {variableDisplay && (
            <span className="variable-display">{variableDisplay}</span>
          )}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return <div className="code-panel loading">加载中...</div>;
  }

  return (
    <div className="code-panel">
      <div className="code-header">
        <div className="language-tabs">
          {Object.values(codeSnippets).map((s) => (
            <button
              key={s.language}
              className={`lang-tab ${selectedLanguage === s.language ? 'active' : ''}`}
              onClick={() => handleLanguageChange(s.language)}
            >
              {s.displayName}
            </button>
          ))}
        </div>
      </div>
      
      <div className="code-content">
        {snippet.code.split('\n').map((line, index) => renderCodeLine(line, index + 1))}
      </div>
    </div>
  );
};

// 简单的语法高亮
function highlightSyntax(code: string, language: ProgrammingLanguage): string {
  let result = escapeHtml(code);
  
  // 关键字
  const keywords: Record<ProgrammingLanguage, string[]> = {
    java: ['class', 'public', 'private', 'void', 'boolean', 'return', 'new', 'this', 'null', 'for', 'if', 'int', 'char', 'String'],
    python: ['class', 'def', 'self', 'return', 'None', 'for', 'in', 'if', 'not', 'is', 'and', 'True', 'False', 'str', 'bool'],
    golang: ['type', 'struct', 'func', 'return', 'nil', 'for', 'range', 'if', 'bool', 'string', 'int'],
    javascript: ['class', 'constructor', 'const', 'let', 'return', 'new', 'this', 'null', 'for', 'of', 'if'],
  };
  
  // 高亮关键字
  for (const keyword of keywords[language]) {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    result = result.replace(regex, '<span class="keyword">$1</span>');
  }
  
  // 高亮字符串
  result = result.replace(/(["'])(.*?)\1/g, '<span class="string">$1$2$1</span>');
  
  // 高亮注释
  if (language === 'python') {
    result = result.replace(/(#.*)$/gm, '<span class="comment">$1</span>');
  } else {
    result = result.replace(/(\/\/.*)$/gm, '<span class="comment">$1</span>');
  }
  
  // 高亮数字
  result = result.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');
  
  // 高亮函数名
  result = result.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="function">$1</span>(');
  
  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default CodePanel;
