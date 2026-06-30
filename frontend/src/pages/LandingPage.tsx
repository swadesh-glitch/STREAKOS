import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Flame, Calendar, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LandingPage: React.FC = () => {
  // 1. Track Scroll for Navbar and Parallax transitions
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll Parallax measurements
  const { scrollYProgress } = useScroll();
  
  // Parallax: background shifts slower than foreground
  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [0, 250]);
  
  // Blob Parallax: drifts and shifts as user scrolls
  const blobParallaxY1 = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const blobParallaxY2 = useTransform(scrollYProgress, [0, 1], [0, -180]);

  // 2. Interactive Widget State
  const [widgetChecked, setWidgetChecked] = useState(false);
  const [widgetStreak, setWidgetStreak] = useState(0);
  const [widgetInView, setWidgetInView] = useState(false);

  // Counter 0 -> 14 days when widget is in view
  useEffect(() => {
    if (widgetInView && widgetStreak < 14) {
      const interval = setInterval(() => {
        setWidgetStreak((prev) => {
          if (prev >= 14) {
            clearInterval(interval);
            return 14;
          }
          return prev + 1;
        });
      }, 70);
      return () => clearInterval(interval);
    }
  }, [widgetInView, widgetStreak]);

  // Handle live widget checkbox click (confetti explosion)
  const handleWidgetCheck = (e: React.MouseEvent) => {
    const nextState = !widgetChecked;
    setWidgetChecked(nextState);
    
    if (nextState) {
      // Trigger local confetti burst at the checkbox location
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 35,
        spread: 45,
        origin: { x, y },
        colors: ['#00F294', '#00ffaa', '#ffffff'],
        disableForReducedMotion: true
      });
      // Increment streak for immediate feedback
      setWidgetStreak(15);
    } else {
      setWidgetStreak(14);
    }
  };

  // 3. Staggered Entrance Animations (Hero Text)
  const titleTextWords = ["Don't", "break", "the", "streak."];
  const sentenceVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.15,
        staggerChildren: 0.05,
      },
    },
  } as any;

  const letterVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 14, stiffness: 220 },
    },
  } as any;

  // Staggered text -> subtext -> buttons variants
  const heroContentVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.8, // Appears after title letters complete
      }
    }
  } as any;

  const textItemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  } as any;

  // Section Animation container templates
  const sectionVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  } as any;

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  } as any;

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col relative overflow-x-hidden selection:bg-accent selection:text-background">
      
      {/* Navbar (fixed, scrolled glass transition) */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-zinc-950/80 backdrop-blur-md border-b border-white/[0.06] h-16'
            : 'bg-transparent h-20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Flame className="w-5 h-5 text-accent fill-accent/10" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-white uppercase">
              Streak<span className="text-accent">OS</span>
            </span>
          </div>
          <div className="flex items-center space-x-5">
            <Link to="/login" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-colors shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* 🎬 HERO SECTION WITH LAYERS */}
      <section className="relative h-[90vh] sm:h-screen w-full flex flex-col justify-center items-center text-center overflow-hidden px-6">
        
        {/* LAYER 1: Background Image (Parallax + Ken Burns Zoom) */}
        <motion.div
          style={{ 
            y: bgParallaxY,
            backgroundImage: "url('/images/hero-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } as any}
          animate={{
            scale: [1, 1.05, 1],
            x: [0, 8, 0],
            y: [0, -6, 0]
          } as any}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear'
          }}
          className="absolute inset-0 z-0 origin-center pointer-events-none"
        />

        {/* LAYER 2: Dark Overlay */}
        <div className="absolute inset-0 bg-black/75 z-10 pointer-events-none" />

        {/* LAYER 3: Drifting Radial Glow Blobs */}
        <motion.div
          style={{ y: blobParallaxY1 } as any}
          animate={{
            x: [0, 45, -35, 0],
            y: [0, -30, 25, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute top-[20%] left-[25%] w-80 h-80 rounded-full bg-accent/15 filter blur-[90px] z-20 pointer-events-none"
        />
        
        <motion.div
          style={{ y: blobParallaxY2 } as any}
          animate={{
            x: [0, -40, 30, 0],
            y: [0, 20, -35, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="absolute bottom-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 filter blur-[110px] z-20 pointer-events-none"
        />

        {/* LAYER 4: Foreground Text & CTA */}
        <div className="relative z-30 max-w-4xl space-y-6 flex flex-col items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-zinc-900/60 border border-white/[0.06] backdrop-blur-sm text-xs text-zinc-400 mb-3"
          >
            <Zap className="w-3.5 h-3.5 text-accent animate-pulse" />
            <span>The Premium Gamified Ritual System</span>
          </motion.div>

          {/* Letter-by-letter spring animation */}
          <motion.h1
            variants={sentenceVariants}
            initial="hidden"
            animate="visible"
            className="font-display font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight text-white leading-[1.05]"
          >
            {titleTextWords.map((word, wIdx) => (
              <span key={wIdx} className="inline-block whitespace-nowrap mr-3.5 sm:mr-5">
                {word.split("").map((char, cIdx) => (
                  <motion.span
                    key={cIdx}
                    variants={letterVariants}
                    className={
                      word === "streak."
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400"
                        : ""
                    }
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          {/* Staggered subtext & buttons */}
          <motion.div
            variants={heroContentVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 flex flex-col items-center"
          >
            <motion.p
              variants={textItemVariants}
              className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-light leading-relaxed"
            >
              STREAKOS leverages psychology and visual elegance to transform simple habits into unbreakable rituals.
            </motion.p>

            <motion.div
              variants={textItemVariants}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center"
            >
              <Link
                to="/signup"
                className="px-8 py-4 rounded-xl text-sm font-semibold bg-accent text-zinc-950 hover:bg-accent-hover transition-colors flex items-center justify-center space-x-2 group shadow-[0_0_30px_rgba(0,242,148,0.15)] hover:scale-[1.02] transform duration-200"
              >
                <span>Build Your Streaks</span>
                <ArrowRight className="w-4 h-4 text-zinc-950 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })}
                className="px-8 py-4 rounded-xl text-sm font-semibold glass-panel text-white hover:bg-white/[0.03] transition-colors flex items-center justify-center"
              >
                Enter Story
              </button>
            </motion.div>
          </motion.div>
        </div>

      </section>

      {/* 🚀 LAYER 5: FLOATING LIVE WIDGET COMPONENT (Overlapping bottom edge of hero) */}
      <div className="w-full relative z-30 flex justify-center mt-[-100px] sm:mt-[-120px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          onViewportEnter={() => setWidgetInView(true)}
          transition={{ duration: 0.8, type: 'spring', damping: 15 }}
          className="w-full max-w-md glass-panel p-5 rounded-2xl border border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl text-left space-y-4 shadow-[0_10px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,148,0.02)] relative group hover:border-accent/30 transition-all duration-300"
        >
          <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <Flame className={`w-5 h-5 text-accent fill-accent/10 group-hover:scale-110 transition-transform duration-300 ${widgetChecked ? 'animate-bounce' : 'animate-pulse'}`} />
              </div>
              <div>
                <h4 className="font-display font-semibold text-white text-sm">Daily Meditation</h4>
                <p className="text-[10px] text-zinc-500 font-light">Mindfulness & mental clarity</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Streak</p>
              <p className="text-sm font-bold text-accent">{widgetStreak} Days</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-400 font-light">Complete this ritual for today</span>
            
            {/* Interactive Checkbox */}
            <button
              onClick={handleWidgetCheck}
              className={`w-28 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center space-x-1.5 border transition-all duration-300 ${
                widgetChecked
                  ? 'bg-accent/15 border-accent/35 text-accent hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400'
                  : 'bg-zinc-900 border-white/[0.06] text-zinc-300 hover:border-accent/40 hover:bg-zinc-850'
              }`}
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                widgetChecked ? 'bg-accent border-accent text-zinc-950' : 'border-zinc-700'
              }`}>
                {widgetChecked && (
                  <svg className="w-2.5 h-2.5 fill-none stroke-[3.5] stroke-current" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span>{widgetChecked ? 'Completed' : 'Complete'}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* 🎬 NARRATIVE STORY CONTINUATION */}
      <div className="w-full max-w-5xl mx-auto px-6 sm:px-8 space-y-40 sm:space-y-64 pt-24 pb-32 relative z-30">

        {/* SECTION 2: PROBLEM */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20%' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-5 text-left order-2 md:order-1">
            <motion.div variants={childVariants} className="inline-flex p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </motion.div>
            <motion.h2 variants={childVariants} className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
              Most habits die in <br />
              <span className="text-zinc-500">the first 3 days.</span>
            </motion.h2>
            <motion.p variants={childVariants} className="text-zinc-400 text-sm font-light leading-relaxed">
              Without immediate feedback and accountability, our best intentions break down. Gaps appear, streaks reset to zero, and motivation vanishes in the quiet drift of routine.
            </motion.p>
          </div>

          <motion.div
            variants={childVariants}
            className="glass-panel p-8 rounded-3xl border border-white/[0.05] bg-zinc-950/20 flex flex-col items-center justify-center min-h-[220px] order-1 md:order-2 relative"
          >
            <div className="flex items-center space-x-4 relative">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-emerald-500/35 bg-emerald-500/10 flex items-center justify-center text-xs font-semibold text-emerald-400">
                  D1
                </div>
                <span className="text-[10px] text-zinc-500 mt-1.5 font-semibold">Done</span>
              </div>
              
              <div className="w-8 h-[2px] bg-emerald-500/40" />

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-emerald-500/35 bg-emerald-500/10 flex items-center justify-center text-xs font-semibold text-emerald-400">
                  D2
                </div>
                <span className="text-[10px] text-zinc-500 mt-1.5 font-semibold">Done</span>
              </div>

              <div className="w-8 h-[2px] border-t-2 border-dashed border-rose-500/40 relative">
                <span className="absolute top-[-7px] left-1.5 text-[8px] font-bold text-rose-500 uppercase tracking-widest bg-background px-0.5">
                  X
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900/60 flex items-center justify-center text-xs font-semibold text-zinc-500">
                  D3
                </div>
                <span className="text-[10px] text-zinc-600 mt-1.5 font-semibold">Missed</span>
              </div>
            </div>
            
            <div className="mt-8 text-[11px] text-rose-400/90 font-medium px-3 py-1 rounded-full bg-rose-500/5 border border-rose-500/10 flex items-center space-x-1.5">
              <span>Streak Reset to 0 Days</span>
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 3: SOLUTION */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20%' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <motion.div
            variants={childVariants}
            className="glass-panel p-8 rounded-3xl border border-white/[0.05] bg-zinc-950/20 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden"
          >
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.3, 0.45, 0.3],
              } as any}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute w-36 h-36 bg-accent rounded-full filter blur-[50px] pointer-events-none"
            />
            
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="relative p-6 rounded-2xl bg-accent/5 border border-accent/20"
            >
              <Flame className="w-16 h-16 text-accent fill-accent/15 drop-shadow-[0_0_15px_rgba(0,242,148,0.4)]" />
            </motion.div>
          </motion.div>

          <div className="space-y-5 text-left">
            <motion.div variants={childVariants} className="inline-flex p-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <Flame className="w-4 h-4" />
            </motion.div>
            <motion.h2 variants={childVariants} className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
              Gamify your routines. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">Keep the flame alive.</span>
            </motion.h2>
            <motion.p variants={childVariants} className="text-zinc-400 text-sm font-light leading-relaxed">
              STREAKOS turns habits into gamified progression. Check in daily to grow your active streak flame. Earn XP, cross level thresholds, and unlock milestones. By attaching value to consistency, we change how routines feel.
            </motion.p>
          </div>
        </motion.section>

        {/* SECTION 4: PROOF (Contribution Grid) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20%' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-5 text-left order-2 md:order-1">
            <motion.div variants={childVariants} className="inline-flex p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Calendar className="w-4 h-4" />
            </motion.div>
            <motion.h2 variants={childVariants} className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
              Watch your history <br />
              <span className="text-zinc-500">compound over time.</span>
            </motion.h2>
            <motion.p variants={childVariants} className="text-zinc-400 text-sm font-light leading-relaxed">
              Track progress without friction. Our visual 90-day heatmap populates cells as you complete daily routines. Build a continuous green grid representing your dedication.
            </motion.p>
          </div>

          <motion.div
            variants={childVariants}
            className="glass-panel p-6 rounded-3xl border border-white/[0.06] bg-zinc-950/20 text-left space-y-6 relative order-1 md:order-2"
          >
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                  <Flame className="w-5 h-5 text-accent animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-white text-sm">Daily Workout</h4>
                  <p className="text-[10px] text-zinc-500">Fitness & strength training</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold">Streak</p>
                  <p className="text-sm font-bold text-accent">24 Days</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-xs">
                  ✓
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-zinc-500">90 Days Contribution History</p>
              
              <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
                {Array.from({ length: 75 }).map((_, idx) => {
                  const isCompleted = idx % 5 === 0 || idx % 3 === 0 || idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`aspect-square rounded-[1.5px] ${
                        isCompleted ? 'heatmap-cell-3' : 'heatmap-cell-0'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* SECTION 5: CTA (Pulsing Glow) */}
        <motion.section
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10%' }}
          className="flex flex-col justify-center items-center text-center space-y-6 max-w-xl mx-auto py-12 border-t border-white/[0.04] pt-20"
        >
          <motion.h2 variants={childVariants} className="font-display font-bold text-4xl text-white tracking-tight">
            Ready to gamify your habits?
          </motion.h2>
          <motion.p variants={childVariants} className="text-zinc-400 text-sm font-light leading-relaxed max-w-sm">
            Configure your rituals, log check-ins, level up, and unlock your discipline. Join STREAKOS today.
          </motion.p>

          <motion.div variants={childVariants} className="pt-4 w-full sm:w-auto">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 15px rgba(0, 242, 148, 0.25)",
                  "0 0 35px rgba(0, 242, 148, 0.55)",
                  "0 0 15px rgba(0, 242, 148, 0.25)"
                ]
              } as any}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="rounded-xl overflow-hidden"
            >
              <Link
                to="/signup"
                className="px-10 py-4 bg-accent text-zinc-950 font-semibold text-sm hover:bg-accent-hover transition-colors flex items-center justify-center space-x-2 group hover:scale-[1.02] transform duration-200"
              >
                <span>Assemble Your Board</span>
                <ArrowRight className="w-4.5 h-4.5 text-zinc-950 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 text-center text-xs text-zinc-600 bg-background/50 relative z-30">
        <p>&copy; {new Date().getFullYear()} STREAKOS Inc. All rights reserved. Premium scroll story integration.</p>
      </footer>
      
    </div>
  );
};
