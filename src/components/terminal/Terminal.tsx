import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { useGitStore } from '@/store/gitStore';
import { cn } from '@/lib/utils';

interface TerminalProps {
  className?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function Terminal({ className, isExpanded = true, onToggle }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ command: string; output: string }[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  
  const { executeCommand, commandHistory, lastOutput } = useGitStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const output = executeCommand(input.trim());
    setHistory((prev) => [...prev, { command: input, output }]);
    setInput('');
    setHistoryIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const commands = history.map((h) => h.command);
      if (commands.length > 0) {
        const newIndex = historyIndex < commands.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commands[commands.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const commands = history.map((h) => h.command);
        setInput(commands[commands.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  return (
    <div className={cn("flex flex-col bg-card border border-border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border hover:bg-secondary/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Terminal content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Output */}
            <div
              ref={outputRef}
              className="h-48 overflow-y-auto p-4 font-mono text-sm space-y-2"
              onClick={() => inputRef.current?.focus()}
            >
              {history.length === 0 && (
                <div className="text-muted-foreground">
                  <p>Welcome to GitMaster Visual Terminal!</p>
                  <p className="mt-1">Try: <span className="text-primary">git init</span></p>
                </div>
              )}
              {history.map((entry, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-success">$</span>
                    <span className="text-foreground">{entry.command}</span>
                  </div>
                  {entry.output && (
                    <pre className="text-muted-foreground whitespace-pre-wrap pl-4">
                      {entry.output}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-border">
              <div className="flex items-center gap-2 px-4 py-2">
                <span className="text-success font-mono">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a git command..."
                  className="terminal-input text-foreground placeholder:text-muted-foreground"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
