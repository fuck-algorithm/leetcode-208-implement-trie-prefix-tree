import { useState, useEffect, useCallback, useRef } from 'react';
import type { Operation, AlgorithmStep, ProgrammingLanguage, PlaybackState } from './types';
import { generateSteps, resetNodeIdCounter } from './algorithm/trie';
import Header from './components/Header';
import DataInput from './components/DataInput';
import CodePanel from './components/CodePanel';
import TrieCanvas from './components/TrieCanvas';
import PlaybackControls from './components/PlaybackControls';
import AlgorithmIdeaModal from './components/AlgorithmIdeaModal';
import WeChatFloat from './components/WeChatFloat';
import './App.css';

function App() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>('java');
  const [showAlgorithmIdea, setShowAlgorithmIdea] = useState(false);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentStep: 0,
    totalSteps: 0,
    speed: 1,
  });
  
  const playIntervalRef = useRef<number | null>(null);

  // 当操作序列变化时，生成新的步骤
  useEffect(() => {
    if (operations.length > 0) {
      resetNodeIdCounter();
      const newSteps = generateSteps(operations);
      setSteps(newSteps);
      setPlaybackState(prev => ({
        ...prev,
        currentStep: 0,
        totalSteps: newSteps.length,
        isPlaying: false,
      }));
    } else {
      setSteps([]);
      setPlaybackState(prev => ({
        ...prev,
        currentStep: 0,
        totalSteps: 0,
        isPlaying: false,
      }));
    }
  }, [operations]);

  // 自动播放
  useEffect(() => {
    if (playbackState.isPlaying && playbackState.currentStep < playbackState.totalSteps - 1) {
      const interval = 1000 / playbackState.speed;
      playIntervalRef.current = window.setInterval(() => {
        setPlaybackState(prev => {
          if (prev.currentStep >= prev.totalSteps - 1) {
            return { ...prev, isPlaying: false };
          }
          return { ...prev, currentStep: prev.currentStep + 1 };
        });
      }, interval);
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
        playIntervalRef.current = null;
      }
    };
  }, [playbackState.isPlaying, playbackState.speed, playbackState.totalSteps]);

  // 检查是否播放到末尾
  useEffect(() => {
    if (playbackState.isPlaying && playbackState.currentStep >= playbackState.totalSteps - 1) {
      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [playbackState.currentStep, playbackState.totalSteps, playbackState.isPlaying]);

  const handleOperationsChange = useCallback((newOperations: Operation[]) => {
    setOperations(newOperations);
  }, []);

  const handlePlay = useCallback(() => {
    if (playbackState.currentStep >= playbackState.totalSteps - 1) {
      // 如果已经在末尾，从头开始
      setPlaybackState(prev => ({ ...prev, currentStep: 0, isPlaying: true }));
    } else {
      setPlaybackState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [playbackState.currentStep, playbackState.totalSteps]);

  const handlePause = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handlePrevStep = useCallback(() => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
      isPlaying: false,
    }));
  }, []);

  const handleNextStep = useCallback(() => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: Math.min(prev.totalSteps - 1, prev.currentStep + 1),
      isPlaying: false,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: 0,
      isPlaying: false,
    }));
  }, []);

  const handleSeek = useCallback((step: number) => {
    setPlaybackState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(prev.totalSteps - 1, step)),
      isPlaying: false,
    }));
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setPlaybackState(prev => ({ ...prev, speed }));
  }, []);

  const currentStep = steps[playbackState.currentStep] || null;

  return (
    <div className="app">
      <Header onShowAlgorithmIdea={() => setShowAlgorithmIdea(true)} />
      
      <DataInput
        onOperationsChange={handleOperationsChange}
        currentOperations={operations}
      />
      
      <div className="main-content">
        <div className="code-section">
          <CodePanel
            currentStep={currentStep}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>
        
        <div className="canvas-section">
          <TrieCanvas currentStep={currentStep} />
        </div>
      </div>
      
      <PlaybackControls
        playbackState={playbackState}
        onPlay={handlePlay}
        onPause={handlePause}
        onPrevStep={handlePrevStep}
        onNextStep={handleNextStep}
        onReset={handleReset}
        onSeek={handleSeek}
        onSpeedChange={handleSpeedChange}
      />
      
      <AlgorithmIdeaModal
        isOpen={showAlgorithmIdea}
        onClose={() => setShowAlgorithmIdea(false)}
      />
      
      <WeChatFloat />
    </div>
  );
}

export default App;
