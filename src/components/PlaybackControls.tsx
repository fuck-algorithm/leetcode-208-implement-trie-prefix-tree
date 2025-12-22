import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { PlaybackState } from '../types';
import { getSetting, saveSetting } from '../utils/db';
import './PlaybackControls.css';

interface PlaybackControlsProps {
  playbackState: PlaybackState;
  onPlay: () => void;
  onPause: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  onSeek: (step: number) => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  playbackState,
  onPlay,
  onPause,
  onPrevStep,
  onNextStep,
  onReset,
  onSeek,
  onSpeedChange,
}) => {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  // 加载保存的播放速度
  useEffect(() => {
    getSetting('playbackSpeed').then((saved) => {
      if (saved && typeof saved === 'number') {
        onSpeedChange(saved);
      }
    });
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的按键
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (playbackState.isPlaying) {
            onPause();
          } else {
            onPlay();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevStep();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextStep();
          break;
        case 'KeyR':
          e.preventDefault();
          onReset();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playbackState.isPlaying, onPlay, onPause, onPrevStep, onNextStep, onReset]);

  const handleSpeedChange = async (speed: number) => {
    onSpeedChange(speed);
    await saveSetting('playbackSpeed', speed);
    setShowSpeedMenu(false);
  };

  // 进度条拖拽
  const handleProgressMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateProgress(e);
  };

  const handleProgressMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      updateProgress(e as unknown as React.MouseEvent);
    }
  }, [isDragging]);

  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleProgressMouseMove);
      window.addEventListener('mouseup', handleProgressMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleProgressMouseMove);
      window.removeEventListener('mouseup', handleProgressMouseUp);
    };
  }, [isDragging, handleProgressMouseMove, handleProgressMouseUp]);

  const updateProgress = (e: React.MouseEvent | MouseEvent) => {
    if (!progressRef.current || playbackState.totalSteps === 0) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const step = Math.round(percentage * (playbackState.totalSteps - 1));
    onSeek(step);
  };

  const progress = playbackState.totalSteps > 0
    ? (playbackState.currentStep / (playbackState.totalSteps - 1)) * 100
    : 0;

  return (
    <div className="playback-controls">
      <div className="controls-row">
        <div className="control-buttons">
          <button
            className="control-btn"
            onClick={onPrevStep}
            disabled={playbackState.currentStep === 0}
            title="上一步 (←)"
          >
            ⏮ <span className="shortcut">←</span>
          </button>
          
          <button
            className="control-btn play-btn"
            onClick={playbackState.isPlaying ? onPause : onPlay}
            disabled={playbackState.totalSteps === 0}
            title={playbackState.isPlaying ? '暂停 (空格)' : '播放 (空格)'}
          >
            {playbackState.isPlaying ? '⏸' : '▶'} <span className="shortcut">空格</span>
          </button>
          
          <button
            className="control-btn"
            onClick={onNextStep}
            disabled={playbackState.currentStep >= playbackState.totalSteps - 1}
            title="下一步 (→)"
          >
            ⏭ <span className="shortcut">→</span>
          </button>
          
          <button
            className="control-btn"
            onClick={onReset}
            disabled={playbackState.totalSteps === 0}
            title="重置 (R)"
          >
            ⟲ <span className="shortcut">R</span>
          </button>
        </div>
        
        <div className="speed-control">
          <button
            className="speed-btn"
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          >
            {playbackState.speed}x ▾
          </button>
          
          {showSpeedMenu && (
            <div className="speed-menu">
              {SPEED_OPTIONS.map(speed => (
                <button
                  key={speed}
                  className={`speed-option ${playbackState.speed === speed ? 'active' : ''}`}
                  onClick={() => handleSpeedChange(speed)}
                >
                  {speed}x
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="step-counter">
          步骤 {playbackState.currentStep + 1} / {playbackState.totalSteps || 1}
        </div>
      </div>
      
      <div
        className="progress-bar"
        ref={progressRef}
        onMouseDown={handleProgressMouseDown}
      >
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div
          className="progress-handle"
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default PlaybackControls;
