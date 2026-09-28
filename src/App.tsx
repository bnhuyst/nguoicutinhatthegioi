import { useState, useEffect, useMemo, useCallback } from 'react';
import { Question, GameStats, WeaponType } from './types';
import { getStoredQuestions } from './utils/storage';
import { sound } from './utils/sound';
import { ContraCanvas } from './game/ContraCanvas';
import { QuestionManagerModal } from './components/QuestionManagerModal';
import { CategorySelectModal } from './components/CategorySelectModal';
import { QuizGateOverlay } from './components/QuizGateOverlay';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { HelpControlsModal } from './components/HelpControlsModal';
import { VirtualController } from './components/VirtualController';
import { 
  Volume2, VolumeX, Shield, Heart, Zap, 
  HelpCircle, Settings, Sun, Moon, Sunset, 
  RotateCcw, Home
} from 'lucide-react';

export default function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Modals & Game state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(true);
  const [isQuestionManagerOpen, setIsQuestionManagerOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Active Gate Trivia
  const [activeGate, setActiveGate] = useState<{
    gateIndex: number;
    question: Question;
  } | null>(null);

  // In-Game Player Stats & HUD
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMaxHp] = useState<number>(100);
  const [playerMana, setPlayerMana] = useState<number>(100);
  const [playerMaxMana] = useState<number>(100);
  const [playerWeapon, setPlayerWeapon] = useState<WeaponType>('NORMAL');
  const [shieldRemaining, setShieldRemaining] = useState<number>(0);

  const [timeOfDay, setTimeOfDay] = useState<'NGÀY' | 'HOÀNG HÔN' | 'ĐÊM'>('NGÀY');
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    enemiesDefeated: 0,
    gatesCleared: 0,
    totalGates: 3,
    wrongAttempts: 0,
    timeElapsed: 0,
  });

  const [gameSessionId, setGameSessionId] = useState<number>(1);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);

  // Virtual inputs for mobile/touch
  const [virtualInput, setVirtualInput] = useState({
    left: false,
    right: false,
    up: false,
    down: false,
    shoot: false,
    skill: false,
  });

  // Load questions on initial mount
  useEffect(() => {
    const list = getStoredQuestions();
    setQuestions(list);
  }, []);

  // Filtered questions for the selected category
  const activeQuestions = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return questions;
    }
    const filtered = questions.filter(q => q.category === selectedCategory);
    return filtered.length > 0 ? filtered : questions;
  }, [questions, selectedCategory]);

  // Update total gates based on questions count
  useEffect(() => {
    setGameStats(prev => ({
      ...prev,
      totalGates: Math.min(4, Math.max(1, activeQuestions.length)),
    }));
  }, [activeQuestions]);

  // Timer loop for timeElapsed
  useEffect(() => {
    if (!isGameActive || activeGate !== null || isVictoryOpen || isGameOverOpen) {
      return;
    }
    const timer = setInterval(() => {
      setGameStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);
    return () => clearInterval(timer);
  }, [isGameActive, activeGate, isVictoryOpen, isGameOverOpen]);

  // Toggle audio
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
  };

  // Start game with chosen category
  const handleStartGame = (cat: string) => {
    setSelectedCategory(cat);
    setIsCategoryModalOpen(false);
    setIsGameOverOpen(false);
    setIsVictoryOpen(false);
    setActiveGate(null);
    setGameStats({
      score: 0,
      enemiesDefeated: 0,
      gatesCleared: 0,
      totalGates: Math.min(4, Math.max(1, activeQuestions.length)),
      wrongAttempts: 0,
      timeElapsed: 0,
    });
    setPlayerHp(100);
    setPlayerMana(100);
    setPlayerWeapon('NORMAL');
    setGameSessionId(prev => prev + 1);
    setIsGameActive(true);
    if (!isSoundMuted) {
      sound.startBGM();
    }
  };

  // Restart current mission
  const handleRestart = () => {
    handleStartGame(selectedCategory);
  };

  // Return to category selection menu
  const handleReturnToMenu = () => {
    setIsGameActive(false);
    setIsCategoryModalOpen(true);
    setIsGameOverOpen(false);
    setIsVictoryOpen(false);
    setActiveGate(null);
    sound.stopBGM();
  };

  // Player status callback from Canvas engine
  const handlePlayerStatusChange = useCallback((
    hp: number,
    _maxHp: number,
    mana: number,
    _maxMana: number,
    weapon: WeaponType,
    shieldTime: number
  ) => {
    setPlayerHp(hp);
    setPlayerMana(mana);
    setPlayerWeapon(weapon);
    setShieldRemaining(shieldTime);
  }, []);

  // Stats update callback
  const handleStatsUpdate = useCallback((score: number, enemiesKilled: number, gatesCleared: number) => {
    setGameStats(prev => ({
      ...prev,
      score,
      enemiesDefeated: enemiesKilled,
      gatesCleared,
    }));
  }, []);

  // Time of Day change callback
  const handleTimeOfDayChange = useCallback((name: 'NGÀY' | 'HOÀNG HÔN' | 'ĐÊM') => {
    setTimeOfDay(name);
  }, []);

  // Player death
  const handlePlayerDeath = useCallback(() => {
    setIsGameActive(false);
    setIsGameOverOpen(true);
    sound.stopBGM();
  }, []);

  // Mission Victory
  const handleVictory = useCallback(() => {
    setIsGameActive(false);
    setIsVictoryOpen(true);
    sound.stopBGM();
  }, []);

  // Gate encounter: pauses game and opens quiz
  const handleEncounterGate = useCallback((gateIndex: number, question: Question) => {
    setActiveGate({ gateIndex, question });
  }, []);

  // Trivia Answer Correct: explode gate and resume!
  const handleQuizCorrect = () => {
    if (activeGate) {
      // Trigger canvas gate destruction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (window as any).__contraGateCleared === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__contraGateCleared(activeGate.gateIndex);
      }
      setActiveGate(null);
    }
  };

  // Trivia Answer Wrong
  const handleQuizWrong = () => {
    setGameStats(prev => ({
      ...prev,
      wrongAttempts: prev.wrongAttempts + 1,
    }));
  };

  // Virtual controller callbacks
  const handleVirtualPress = (action: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'SHOOT' | 'SKILL') => {
    setVirtualInput(prev => ({
      ...prev,
      left: action === 'LEFT' ? true : prev.left,
      right: action === 'RIGHT' ? true : prev.right,
      up: action === 'UP' ? true : prev.up,
      down: action === 'DOWN' ? true : prev.down,
      shoot: action === 'SHOOT' ? true : prev.shoot,
      skill: action === 'SKILL' ? true : prev.skill,
    }));
  };

  const handleVirtualRelease = (action: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'SHOOT' | 'SKILL') => {
    setVirtualInput(prev => ({
      ...prev,
      left: action === 'LEFT' ? false : prev.left,
      right: action === 'RIGHT' ? false : prev.right,
      up: action === 'UP' ? false : prev.up,
      down: action === 'DOWN' ? false : prev.down,
      shoot: action === 'SHOOT' ? false : prev.shoot,
      skill: action === 'SKILL' ? false : prev.skill,
    }));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 select-none">
      
      {/* CRT Scanline Overlay */}
      <div className="absolute inset-0 scanlines z-20 pointer-events-none" />

      {/* TOP HEADER & HUD BAR */}
      <header className="relative z-30 flex items-center justify-between px-3 sm:px-6 py-2 bg-slate-900/95 border-b border-slate-800 shadow-lg shrink-0">
        
        {/* Left: Health & Mana Bars */}
        <div className="flex items-center gap-3 sm:gap-6">
          {/* HP Bar */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-red-950 border border-red-500 rounded text-red-400">
              <Heart className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-arcade">
                <span className="text-red-400">MÁU (HP)</span>
                <span className="text-white">{playerHp}/{playerMaxHp}</span>
              </div>
              <div className="w-24 sm:w-36 h-3 bg-slate-800 border border-red-900/60 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-200 ${
                    playerHp > 50 ? 'bg-gradient-to-r from-red-600 to-emerald-500' : playerHp > 25 ? 'bg-amber-500' : 'bg-red-600 animate-pulse'
                  }`}
                  style={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mana Bar */}
          <div className="flex items-center gap-2">
            <div className="p-1 bg-cyan-950 border border-cyan-500 rounded text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[10px] font-arcade">
                <span className="text-cyan-400">MANA (K)</span>
                <span className="text-white">{playerMana}/{playerMaxMana}</span>
              </div>
              <div className="w-20 sm:w-28 h-3 bg-slate-800 border border-cyan-900/60 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-200 ${
                    playerMana >= 40 ? 'bg-cyan-400 shadow-sm shadow-cyan-300' : 'bg-cyan-800'
                  }`}
                  style={{ width: `${(playerMana / playerMaxMana) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Shield Status Indicator */}
          {shieldRemaining > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950 border border-cyan-400 rounded-lg text-cyan-300 text-xs font-arcade animate-pulse">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>KHIÊN: {shieldRemaining.toFixed(1)}s</span>
            </div>
          )}
        </div>

        {/* Center: Weapon & Score & Day/Night Indicator */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Current Weapon Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-arcade">
            <span className="text-slate-400 hidden sm:inline">VŨ KHÍ:</span>
            {playerWeapon === 'NORMAL' && (
              <span className="text-white">SÚNG RIFLE</span>
            )}
            {playerWeapon === 'SPREAD' && (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <span className="px-1.5 bg-red-600 text-white rounded text-[10px]">S</span> SÚNG CHÙM
              </span>
            )}
            {playerWeapon === 'LASER' && (
              <span className="text-cyan-400 font-bold flex items-center gap-1">
                <span className="px-1.5 bg-cyan-600 text-white rounded text-[10px]">L</span> TIA LASER
              </span>
            )}
          </div>

          {/* Day / Night Indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-military">
            {timeOfDay === 'NGÀY' && <Sun className="w-4 h-4 text-amber-400" />}
            {timeOfDay === 'HOÀNG HÔN' && <Sunset className="w-4 h-4 text-orange-400" />}
            {timeOfDay === 'ĐÊM' && <Moon className="w-4 h-4 text-cyan-300" />}
            <span className="font-bold text-slate-200">{timeOfDay}</span>
          </div>

          {/* Score */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-arcade">
            <span className="text-yellow-400">ĐIỂM: {gameStats.score}</span>
          </div>

          {/* Gate progress */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800/90 border border-slate-700 rounded-lg text-xs font-arcade">
            <span className="text-emerald-400">CỔNG: {gameStats.gatesCleared}/{gameStats.totalGates}</span>
          </div>
        </div>

        {/* Right: Sound, Question Manager & Settings Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mute Button */}
          <button
            onClick={handleToggleSound}
            title={isSoundMuted ? 'Bật âm thanh & nhạc nền' : 'Tắt âm thanh'}
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Question Manager Button */}
          <button
            onClick={() => {
              sound.playJump();
              setIsQuestionManagerOpen(true);
            }}
            title="Quản lý câu hỏi & đề thi"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-950/70 hover:bg-red-900 border border-red-500 rounded-lg text-xs font-military font-bold text-yellow-300 transition-all shadow-sm"
          >
            <Settings className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Quản Lý Đề Thi</span>
          </button>

          {/* Help Button */}
          <button
            onClick={() => {
              sound.playJump();
              setIsHelpOpen(true);
            }}
            title="Hướng dẫn phím điều khiển"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Menu / Restart */}
          {isGameActive && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleRestart}
                title="Chơi lại màn này"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleReturnToMenu}
                title="Quay lại chọn chủ đề"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700"
              >
                <Home className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </header>

      {/* GAME CANVAS PLAYING AREA */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
        <ContraCanvas
          key={gameSessionId}
          isPaused={!isGameActive || activeGate !== null || isVictoryOpen || isGameOverOpen || isQuestionManagerOpen || isHelpOpen}
          activeQuestions={activeQuestions}
          onEncounterGate={handleEncounterGate}
          onPlayerDeath={handlePlayerDeath}
          onVictory={handleVictory}
          onStatsUpdate={handleStatsUpdate}
          onPlayerStatusChange={handlePlayerStatusChange}
          onTimeOfDayChange={handleTimeOfDayChange}
          virtualInput={virtualInput}
        />

        {/* Mobile On-Screen Virtual Controller */}
        {isGameActive && activeGate === null && !isVictoryOpen && !isGameOverOpen && (
          <VirtualController
            onPress={handleVirtualPress}
            onRelease={handleVirtualRelease}
            mana={playerMana}
          />
        )}
      </main>

      {/* MODALS & OVERLAYS */}
      
      {/* 1. Category Selection Menu */}
      <CategorySelectModal
        isOpen={isCategoryModalOpen}
        questions={questions}
        onSelectCategory={handleStartGame}
        onOpenQuestionManager={() => setIsQuestionManagerOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Question Management CRUD Modal */}
      <QuestionManagerModal
        isOpen={isQuestionManagerOpen}
        onClose={() => setIsQuestionManagerOpen(false)}
        questions={questions}
        onQuestionsChange={newQuestions => setQuestions(newQuestions)}
      />

      {/* 3. Trivia Gate Obstacle Overlay */}
      {activeGate && (
        <QuizGateOverlay
          question={activeGate.question}
          gateIndex={activeGate.gateIndex}
          totalGates={gameStats.totalGates}
          onCorrect={handleQuizCorrect}
          onWrong={handleQuizWrong}
        />
      )}

      {/* 4. Victory Scorecard Modal */}
      <VictoryModal
        isOpen={isVictoryOpen}
        stats={gameStats}
        category={selectedCategory}
        onPlayAgain={handleRestart}
        onReturnMenu={handleReturnToMenu}
      />

      {/* 5. Game Over Revival Modal */}
      <GameOverModal
        isOpen={isGameOverOpen}
        stats={gameStats}
        onRetry={handleRestart}
        onReturnMenu={handleReturnToMenu}
        onOpenQuestionManager={() => setIsQuestionManagerOpen(true)}
      />

      {/* 6. Help & Controls Modal */}
      <HelpControlsModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

    </div>
  );
}
