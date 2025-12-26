import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  GitBranch, 
  GitCommit, 
  GitMerge, 
  Play, 
  Sparkles,
  BookOpen,
  Terminal,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Index() {
  const navigate = useNavigate();

  const features = [
    {
      icon: GitCommit,
      title: 'Visual Commits',
      description: 'See your commits come alive as nodes on an interactive graph'
    },
    {
      icon: GitBranch,
      title: 'Branch Mastery',
      description: 'Create and navigate branches with beautiful visualizations'
    },
    {
      icon: GitMerge,
      title: 'Merge Magic',
      description: 'Watch merges happen in real-time with animated pathways'
    },
    {
      icon: Terminal,
      title: 'Real Commands',
      description: 'Practice actual Git commands in a safe sandbox environment'
    },
  ];

  const handleStart = () => {
    navigate('/learn/level-1');
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--primary) / 0.15), transparent 60%)'
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
          
          {/* Decorative git graph lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <motion.path
              d="M 100 200 Q 200 100 300 200 T 500 200"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
            <motion.path
              d="M 600 300 Q 700 200 800 300 T 1000 300"
              stroke="hsl(var(--accent))"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
            />
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Interactive Git Learning</span>
            </motion.div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">GitMaster</span>
              <br />
              <span className="text-foreground">Visual</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Master Git through interactive visualization. Watch branches grow, 
              commits form, and merges happen in real-time. Learn by doing, not reading.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={handleStart}
                className="gap-2 px-8 py-6 text-lg shadow-lg hover:shadow-primary/25 transition-shadow"
              >
                <Play className="w-5 h-5" />
                Start Learning
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="gap-2 px-8 py-6 text-lg"
              >
                <BookOpen className="w-5 h-5" />
                View Syllabus
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                <span>5 Levels</span>
              </div>
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-primary" />
                <span>20+ Commands</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-success" />
                <span>Real CLI</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learn Git <span className="gradient-text">Visually</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              No more memorizing commands. See how Git actually works under the hood.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary) / 0.1), hsl(var(--accent) / 0.1))'
            }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Master Git?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Start your journey from commits to complex merges. 
                Become a Git expert in no time.
              </p>
              <Button 
                size="lg" 
                onClick={handleStart}
                className="gap-2 px-8"
              >
                <Play className="w-5 h-5" />
                Begin Your Journey
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>Built with ❤️ for developers who want to truly understand Git</p>
        </div>
      </footer>
    </div>
  );
}
