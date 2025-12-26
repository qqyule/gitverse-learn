import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, Lightbulb, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { Level, levels, getPhaseTitle } from '@/data/levels';
import { cn } from '@/lib/utils';
import { useGitStore } from '@/store/gitStore';

interface LevelSidebarProps {
  currentLevel: Level;
  onLevelSelect: (level: Level) => void;
  className?: string;
}

export function LevelSidebar({ currentLevel, onLevelSelect, className }: LevelSidebarProps) {
  const gitState = useGitStore();
  
  // Group levels by phase
  const phases = levels.reduce((acc, level) => {
    if (!acc[level.phase]) {
      acc[level.phase] = [];
    }
    acc[level.phase].push(level);
    return acc;
  }, {} as Record<number, Level[]>);

  return (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", className)}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-bold gradient-text">GitMaster Visual</h2>
        <p className="text-xs text-muted-foreground mt-1">Interactive Git Learning</p>
      </div>

      {/* Current Level Info */}
      <div className="p-4 border-b border-sidebar-border space-y-4">
        <div className="space-y-2">
          <div className="level-badge">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Level {levels.indexOf(currentLevel) + 1}</span>
          </div>
          <h3 className="text-lg font-semibold">{currentLevel.title}</h3>
          <p className="text-xs text-primary/70">{currentLevel.titleZh}</p>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {currentLevel.description}
        </p>

        {/* Goal */}
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Goal</span>
          </div>
          <p className="text-sm text-foreground">{currentLevel.goal}</p>
        </div>
      </div>

      {/* Hints */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-warning mb-3">
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Hints</span>
        </div>
        <ul className="space-y-2">
          {currentLevel.hints.map((hint, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <ChevronRight className="w-3 h-3 mt-0.5 text-primary" />
              <span>{hint}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Level List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          All Levels
        </h4>
        <div className="space-y-4">
          {Object.entries(phases).map(([phase, phaseLevels]) => (
            <div key={phase}>
              <p className="text-xs text-muted-foreground mb-2">
                {getPhaseTitle(Number(phase))}
              </p>
              <div className="space-y-1">
                {phaseLevels.map((level) => {
                  const isActive = level.id === currentLevel.id;
                  const isCompleted = level.validation(gitState);

                  return (
                    <button
                      key={level.id}
                      onClick={() => onLevelSelect(level)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "hover:bg-secondary/50 text-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="truncate">{level.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
