import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { VisualNode, AlgorithmStep, Annotation } from '../types';
import './TrieCanvas.css';

interface TrieCanvasProps {
  currentStep: AlgorithmStep | null;
}

interface TreeNode {
  id: string;
  char: string;
  isEnd: boolean;
  x: number;
  y: number;
  children: TreeNode[];
  highlighted: boolean;
}

const TrieCanvas: React.FC<TrieCanvasProps> = ({ currentStep }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 计算树的布局
  const calculateLayout = useCallback((node: VisualNode | null, depth: number = 0, index: number = 0, siblingCount: number = 1): TreeNode | null => {
    if (!node) return null;

    const horizontalSpacing = 70;
    const verticalSpacing = 80;
    
    // 计算子节点
    const children: TreeNode[] = [];
    node.children.forEach((child, i) => {
      const childNode = calculateLayout(child, depth + 1, i, node.children.length);
      if (childNode) children.push(childNode);
    });

    // 计算当前节点位置
    let x = 0;
    if (children.length > 0) {
      // 父节点居中于子节点
      const leftMost = children[0].x;
      const rightMost = children[children.length - 1].x;
      x = (leftMost + rightMost) / 2;
    } else {
      x = (index - (siblingCount - 1) / 2) * horizontalSpacing;
    }

    return {
      id: node.id,
      char: node.char,
      isEnd: node.isEnd,
      x,
      y: depth * verticalSpacing,
      children,
      highlighted: currentStep?.highlightedNodes.includes(node.id) || false,
    };
  }, [currentStep]);

  // 调整树的位置避免重叠
  const adjustTreePositions = useCallback((root: TreeNode | null): TreeNode | null => {
    if (!root) return null;

    const nodePositions: Map<number, number[]> = new Map();
    
    const collectPositions = (node: TreeNode) => {
      const level = Math.round(node.y / 80);
      if (!nodePositions.has(level)) {
        nodePositions.set(level, []);
      }
      nodePositions.get(level)!.push(node.x);
      node.children.forEach(collectPositions);
    };

    const adjustNode = (node: TreeNode, offset: number): TreeNode => {
      return {
        ...node,
        x: node.x + offset,
        children: node.children.map(child => adjustNode(child, offset)),
      };
    };

    collectPositions(root);

    // 找到最小x值，确保树居中
    let minX = Infinity;
    let maxX = -Infinity;
    nodePositions.forEach(positions => {
      positions.forEach(x => {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      });
    });

    const centerOffset = -(minX + maxX) / 2;
    return adjustNode(root, centerOffset);
  }, []);

  // 渲染树
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2 + transform.x}, ${60 + transform.y}) scale(${transform.scale})`);

    if (!currentStep?.trieSnapshot) {
      // 显示空状态
      g.append('text')
        .attr('x', 0)
        .attr('y', height / 3)
        .attr('text-anchor', 'middle')
        .attr('fill', '#718096')
        .attr('font-size', '14px')
        .text('请选择示例数据或输入操作序列开始演示');
      return;
    }

    let root = calculateLayout(currentStep.trieSnapshot, 0, 0, 1);
    root = adjustTreePositions(root);

    if (!root) return;

    // 收集所有节点和边
    const nodes: TreeNode[] = [];
    const links: { source: TreeNode; target: TreeNode }[] = [];

    const traverse = (node: TreeNode) => {
      nodes.push(node);
      node.children.forEach(child => {
        links.push({ source: node, target: child });
        traverse(child);
      });
    };
    traverse(root);

    // 绘制边
    const linkGroup = g.append('g').attr('class', 'links');
    linkGroup.selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => {
        const sourceHighlighted = currentStep.highlightedNodes.includes(d.source.id);
        const targetHighlighted = currentStep.highlightedNodes.includes(d.target.id);
        return sourceHighlighted && targetHighlighted ? '#63b3ed' : '#4a5568';
      })
      .attr('stroke-width', d => {
        const sourceHighlighted = currentStep.highlightedNodes.includes(d.source.id);
        const targetHighlighted = currentStep.highlightedNodes.includes(d.target.id);
        return sourceHighlighted && targetHighlighted ? 3 : 2;
      });

    // 绘制边上的字符标签
    linkGroup.selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .attr('x', d => (d.source.x + d.target.x) / 2 - 10)
      .attr('y', d => (d.source.y + d.target.y) / 2)
      .attr('fill', '#a0aec0')
      .attr('font-size', '11px')
      .text(d => d.target.char);

    // 绘制节点
    const nodeGroup = g.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup.selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // 节点圆圈
    nodeElements.append('circle')
      .attr('r', 22)
      .attr('fill', d => {
        if (d.highlighted) {
          if (d.isEnd) return '#38a169';
          return '#3182ce';
        }
        return d.isEnd ? '#2f855a' : '#2d3748';
      })
      .attr('stroke', d => {
        if (d.highlighted) return '#63b3ed';
        return d.isEnd ? '#48bb78' : '#4a5568';
      })
      .attr('stroke-width', d => d.highlighted ? 3 : 2);

    // 节点文字
    nodeElements.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', '#e2e8f0')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .text(d => d.char === 'root' ? '○' : d.char);

    // 结束标记
    nodeElements.filter(d => d.isEnd)
      .append('circle')
      .attr('r', 6)
      .attr('cx', 16)
      .attr('cy', -16)
      .attr('fill', '#48bb78');

    // 绘制标注
    if (currentStep.annotations && currentStep.annotations.length > 0) {
      const annotationGroup = g.append('g').attr('class', 'annotations');
      
      currentStep.annotations.forEach(annotation => {
        const targetNode = nodes.find(n => n.id === annotation.nodeId);
        if (!targetNode) return;

        let offsetX = 0;
        let offsetY = 0;
        let textAnchor = 'middle';

        switch (annotation.position) {
          case 'top':
            offsetY = -35;
            break;
          case 'bottom':
            offsetY = 40;
            break;
          case 'left':
            offsetX = -40;
            textAnchor = 'end';
            break;
          case 'right':
            offsetX = 40;
            textAnchor = 'start';
            break;
        }

        const annotationEl = annotationGroup.append('g')
          .attr('transform', `translate(${targetNode.x + offsetX}, ${targetNode.y + offsetY})`);

        // 背景
        const textEl = annotationEl.append('text')
          .attr('text-anchor', textAnchor)
          .attr('fill', getAnnotationColor(annotation.type))
          .attr('font-size', '11px')
          .attr('font-weight', '500')
          .text(annotation.text);

        // 获取文本边界
        const bbox = (textEl.node() as SVGTextElement).getBBox();
        
        annotationEl.insert('rect', 'text')
          .attr('x', bbox.x - 4)
          .attr('y', bbox.y - 2)
          .attr('width', bbox.width + 8)
          .attr('height', bbox.height + 4)
          .attr('fill', 'rgba(26, 26, 46, 0.9)')
          .attr('rx', 4);
      });
    }

  }, [currentStep, transform, calculateLayout, adjustTreePositions]);

  // 鼠标拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(3, prev.scale * delta)),
    }));
  };

  // 重置视图
  const handleReset = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="trie-canvas" ref={containerRef}>
      <div className="canvas-controls">
        <button onClick={handleReset} className="reset-view-btn" title="重置视图">
          ⟲ 重置
        </button>
        <span className="zoom-level">{Math.round(transform.scale * 100)}%</span>
      </div>
      
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
      
      {currentStep && (
        <div className="step-info">
          <div className="step-description">{currentStep.description}</div>
        </div>
      )}
    </div>
  );
};

function getAnnotationColor(type: Annotation['type']): string {
  switch (type) {
    case 'action': return '#63b3ed';
    case 'result': return '#68d391';
    case 'value': return '#f6ad55';
    default: return '#a0aec0';
  }
}

export default TrieCanvas;
