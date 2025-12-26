import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { GitGraphSvg } from '@/components/git/GitGraphSvg';
import { Terminal } from '@/components/terminal/Terminal';
import { FileDeck } from '@/components/files/FileDeck';
import { LevelSidebar } from '@/components/sidebar/LevelSidebar';
import { levels, getLevelById, Level } from '@/data/levels';
import { useGitStore } from '@/store/gitStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Menu, 
  X, 
  PartyPopper, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft,
  TerminalSquare,
  FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function LearnPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [terminalExpanded, setTerminalExpanded] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const gitState = useGitStore();
  const { init, resetState } = gitState;

  const currentLevel = getLevelById(levelId || 'level-1') || levels[0];
  const currentIndex = levels.findIndex(l => l.id === currentLevel.id);
  const hasNext = currentIndex < levels.length - 1;
  const hasPrev = currentIndex > 0;

  // Check level completion
  useEffect(() => {
    if (currentLevel.validation(gitState) && !showSuccess) {
      setShowSuccess(true);
      toast({
        title: "🎉 Level Complete!",
        description: `You've mastered "${currentLevel.title}"`,
      });
    }
  }, [gitState, currentLevel, showSuccess, toast]);

  // Reset success state when level changes
  useEffect(() => {
    setShowSuccess(false);
  }, [levelId]);

  const handleLevelSelect = (level: Level) => {
    navigate(`/learn/${level.id}`);
    resetState();
  };

  const handleNextLevel = () => {
    if (hasNext) {
      const nextLevel = levels[currentIndex + 1];
      navigate(`/learn/${nextLevel.id}`);
      resetState();
    }
  };

  const handlePrevLevel = () => {
    if (hasPrev) {
      const prevLevel = levels[currentIndex - 1];
      navigate(`/learn/${prevLevel.id}`);
      resetState();
    }
  };

  const handleReset = () => {
    resetState();
    setShowSuccess(false);
    toast({
      title: "Repository Reset",
      description: "Start fresh with this level",
    });
  };

  const handleNodeClick = (hash: string) => {
    gitState.checkout(hash);
    toast({
      title: "Checked out",
      description: `HEAD is now at ${hash.slice(0, 7)}`,
    });
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <LevelSidebar
              currentLevel={currentLevel}
              onLevelSelect={handleLevelSelect}
              className="w-80 h-full"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevLevel}
                disabled={!hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                Level {currentIndex + 1} of {levels.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextLevel}
                disabled={!hasNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showSuccess && hasNext && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2"
              >
                <Button onClick={handleNextLevel} className="gap-2">
                  <PartyPopper className="w-4 h-4" />
                  Next Level
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </header>

        {/* Graph Area */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.05), transparent 70%)'
            }}
          />
          <GitGraphSvg 
            className="h-full p-4" 
            onNodeClick={handleNodeClick}
          />

          {/* Success Overlay */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-success/20 backdrop-blur-sm rounded-full p-8"
                >
                  <PartyPopper className="w-16 h-16 text-success" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Panel */}
        <div className="border-t border-border bg-card/50">
          <Tabs defaultValue="terminal" className="w-full">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="terminal" className="gap-2">
                  <TerminalSquare className="w-4 h-4" />
                  Terminal
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Files
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="terminal" className="m-0">
              <Terminal 
                className="border-0 rounded-none" 
                isExpanded={terminalExpanded}
                onToggle={() => setTerminalExpanded(!terminalExpanded)}
              />
            </TabsContent>
            
            <TabsContent value="files" className="m-0 p-4 h-64 overflow-y-auto">
              <FileDeck />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
