import React from 'react';
import './AlgorithmIdeaModal.css';

interface AlgorithmIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AlgorithmIdeaModal: React.FC<AlgorithmIdeaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💡 算法思路</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <section>
            <h3>什么是 Trie（前缀树）？</h3>
            <p>
              Trie，又称前缀树或字典树，是一棵有根树，其每个节点包含以下字段：
            </p>
            <ul>
              <li><strong>children</strong>：指向子节点的指针数组。对于本题，数组长度为 26，对应小写字母 a-z。</li>
              <li><strong>isEnd</strong>：布尔字段，表示该节点是否为字符串的结尾。</li>
            </ul>
          </section>
          
          <section>
            <h3>插入字符串</h3>
            <p>从字典树的根开始，插入字符串。对于当前字符对应的子节点：</p>
            <ol>
              <li><strong>子节点存在</strong>：沿着指针移动到子节点，继续处理下一个字符。</li>
              <li><strong>子节点不存在</strong>：创建一个新的子节点，记录在 children 数组的对应位置上，然后沿着指针移动到子节点，继续搜索下一个字符。</li>
            </ol>
            <p>重复以上步骤，直到处理字符串的最后一个字符，然后将当前节点标记为字符串的结尾。</p>
          </section>
          
          <section>
            <h3>查找前缀</h3>
            <p>从字典树的根开始，查找前缀。对于当前字符对应的子节点：</p>
            <ol>
              <li><strong>子节点存在</strong>：沿着指针移动到子节点，继续搜索下一个字符。</li>
              <li><strong>子节点不存在</strong>：说明字典树中不包含该前缀，返回空指针。</li>
            </ol>
            <p>重复以上步骤，直到返回空指针或搜索完前缀的最后一个字符。</p>
          </section>
          
          <section>
            <h3>查找字符串</h3>
            <p>
              若搜索到了前缀的末尾，就说明字典树中存在该前缀。此外，若前缀末尾对应节点的 isEnd 为真，则说明字典树中存在该字符串。
            </p>
          </section>
          
          <section>
            <h3>复杂度分析</h3>
            <ul>
              <li><strong>时间复杂度</strong>：初始化为 O(1)，其余操作为 O(|S|)，其中 |S| 是每次插入或查询的字符串的长度。</li>
              <li><strong>空间复杂度</strong>：O(|T|·Σ)，其中 |T| 为所有插入字符串的长度之和，Σ 为字符集的大小，本题 Σ=26。</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmIdeaModal;
