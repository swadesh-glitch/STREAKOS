import React, { useState } from 'react';
import type { Habit } from '../pages/DashboardPage';
import { Flame, Check, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface HabitCardProps {
  habit: Habit;
  todayStr: string;
  onCheckin: (id: string) => Promise<void>;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  todayStr,
  onCheckin,
  onEdit,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if today is completed in completionLog
  const isCompletedToday = habit.completionLog.some(
    (log) => log.date === todayStr && log.completed
  );

  // Generate date list for the last 90 days
  const getHistoryDays = () => {
    const days: string[] = [];
    const today = new Date();
    // 90 days grid
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      days.push(`${y}-${m}-${day}`);
    }
    return days;
  };

  const historyDays = getHistoryDays();

  // Trigger local confetti burst on check-in
  const handleCheckinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isCompletedToday) {
      // Get button rect for origin
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { x, y },
        colors: ['#00F294', '#00D882', '#ffffff'],
        disableForReducedMotion: true
      });
    }
    await onCheckin(habit._id);
  };

  // Flame color and scale animation based on streak length
  const getFlameStyles = () => {
    if (habit.streak === 0) {
      return {
        className: 'text-zinc-600 fill-transparent',
        style: { transform: 'scale(1)' },
      };
    }
    const maxBonusScale = 0.35;
    const bonusScale = Math.min(habit.streak * 0.03, maxBonusScale);
    return {
      className: 'text-accent fill-accent/10 drop-shadow-[0_0_8px_rgba(0,242,148,0.35)]',
      style: { transform: `scale(${1 + bonusScale})` },
    };
  };

  const flameStyles = getFlameStyles();

  // Categories helper (colors)
  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      Fitness: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      Mind: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      Work: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Health: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      Creative: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      General: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
    };
    return map[cat] || map.General;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] hover:border-accent/20 relative group transition-all duration-300 shadow-xl flex flex-col justify-between min-h-[220px]">
      
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between">
          <div className="space-y-1 max-w-[70%]">
            <h3 className="font-display font-semibold text-white group-hover:text-accent transition-colors truncate">
              {habit.name}
            </h3>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${getCategoryColor(habit.category)}`}>
              {habit.category}
            </span>
          </div>

          <div className="flex items-center space-x-2 relative">
            {/* Streak flame indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-zinc-950/80 border border-white/[0.04]">
              <Flame
                className={`w-4 h-4 transition-all duration-300 ${flameStyles.className}`}
                style={flameStyles.style}
              />
              <span className={`text-xs font-bold ${habit.streak > 0 ? 'text-accent' : 'text-zinc-500'}`}>
                {habit.streak}
              </span>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.05]"
              >
                <MoreVertical className="w-4 h-4 text-zinc-500 hover:text-white" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 mt-1 w-32 bg-zinc-950 border border-white/[0.08] p-1 rounded-xl shadow-2xl z-20"
                    >
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onEdit(habit);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-white/[0.03] transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onDelete(habit._id);
                        }}
                        className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Contribution Heatmap */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-medium">
            <span>90 Days History</span>
            <span>Streak Peak: {habit.longestStreak || 0}</span>
          </div>
          <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-1">
            {historyDays.map((date) => {
              const completed = habit.completionLog.some(
                (log) => log.date === date && log.completed
              );
              // Color mapping
              return (
                <div
                  key={date}
                  className={`aspect-square rounded-[2px] transition-colors duration-300 ${
                    completed ? 'heatmap-cell-3' : 'heatmap-cell-0'
                  }`}
                  title={`${date}: ${completed ? 'Completed' : 'Skipped'}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom checkin action */}
      <div className="mt-5 pt-3 border-t border-white/[0.04]">
        <button
          onClick={handleCheckinClick}
          className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all duration-300 ${
            isCompletedToday
              ? 'bg-accent/15 border border-accent/30 text-accent hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 group/btn'
              : 'bg-zinc-900 border border-white/[0.06] text-zinc-300 hover:border-accent/40 hover:bg-zinc-850'
          }`}
        >
          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
            isCompletedToday 
              ? 'bg-accent border-accent text-zinc-950 group-hover/btn:bg-rose-500 group-hover/btn:border-rose-500' 
              : 'border-zinc-700'
          }`}>
            {isCompletedToday && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <span className="group-hover/btn:hidden">
            {isCompletedToday ? 'Completed Today' : 'Mark Completed'}
          </span>
          <span className="hidden group-hover/btn:inline text-rose-400">
            Remove Check-in
          </span>
        </button>
      </div>

    </div>
  );
};
