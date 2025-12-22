import React, { useState } from 'react';
import type { Operation } from '../types';
import { exampleDatasets, generateRandomOperations, parseUserInput, isValidWord } from '../data/examples';
import './DataInput.css';

interface DataInputProps {
  onOperationsChange: (operations: Operation[]) => void;
  currentOperations: Operation[];
}

const DataInput: React.FC<DataInputProps> = ({ onOperationsChange, currentOperations }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleExampleClick = (operations: Operation[]) => {
    setError(null);
    onOperationsChange([...operations]);
    setInputValue('');
  };

  const handleRandomGenerate = () => {
    setError(null);
    const operations = generateRandomOperations(6);
    onOperationsChange(operations);
    setInputValue('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError(null);
  };

  const handleInputSubmit = () => {
    if (!inputValue.trim()) {
      setError('请输入操作序列');
      return;
    }

    const operations = parseUserInput(inputValue);
    if (!operations) {
      setError('输入格式错误，请使用: insert word, search word, startsWith prefix');
      return;
    }

    // 验证所有单词
    for (const op of operations) {
      if (!isValidWord(op.word)) {
        setError(`单词 "${op.word}" 不合法，只能包含小写字母，长度1-2000`);
        return;
      }
    }

    setError(null);
    onOperationsChange(operations);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit();
    }
  };

  const formatOperations = (ops: Operation[]): string => {
    return ops.map(op => {
      const icon = op.type === 'insert' ? '📥' : op.type === 'search' ? '🔍' : '🔤';
      return `${icon} ${op.type}("${op.word}")`;
    }).join(' → ');
  };

  return (
    <div className="data-input">
      <div className="input-row">
        <div className="input-section">
          <label>自定义输入:</label>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder='例: insert apple, search apple, startsWith app'
            className="custom-input"
          />
          <button onClick={handleInputSubmit} className="submit-btn">
            确定
          </button>
        </div>
        
        <div className="examples-section">
          <label>示例数据:</label>
          <div className="example-buttons">
            {exampleDatasets.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example.operations)}
                className="example-btn"
              >
                {example.name}
              </button>
            ))}
            <button onClick={handleRandomGenerate} className="random-btn">
              🎲 随机生成
            </button>
          </div>
        </div>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {currentOperations.length > 0 && (
        <div className="current-operations">
          <span className="ops-label">当前操作序列:</span>
          <span className="ops-content">{formatOperations(currentOperations)}</span>
        </div>
      )}
    </div>
  );
};

export default DataInput;
