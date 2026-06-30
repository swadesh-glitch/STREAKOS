import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { HabitCard } from '../components/HabitCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, X, Award, Sparkles, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface CompletionLog {
  date: string;
  completed: boolean;
  _id?: string;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  category: string;
  streak: number;
  longestStreak: number;
  completionLog: CompletionLog[];
  awardedMilestones: number[];
  createdAt: string;
  updatedAt: string;
}

export const DashboardPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

  // Form states
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('General');
  
  // Category Filter
  const [filter, setFilter] = useState('All');

  // Celebratory UI Notifications
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; type: 'milestone' | 'level' } | null>(null);

  // Local Date in YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayString();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await api.get('/habits');
      setHabits(response.data);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    try {
      const response = await api.post('/habits', {
        name: habitName,
        category: habitCategory,
      });
      setHabits((prev) => [response.data, ...prev]);
      setIsAddOpen(false);
      setHabitName('');
      setHabitCategory('General');
    } catch (err) {
      console.error('Error creating habit:', err);
    }
  };

  const handleEditHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHabit || !habitName.trim()) return;

    try {
      const response = await api.put(`/habits/${selectedHabit._id}`, {
        name: habitName,
        category: habitCategory,
      });
      setHabits((prev) =>
        prev.map((h) => (h._id === selectedHabit._id ? response.data : h))
      );
      setIsEditOpen(false);
      setSelectedHabit(null);
      setHabitName('');
      setHabitCategory('General');
    } catch (err) {
      console.error('Error editing habit:', err);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this habit? All streaks and history will be cleared.')) return;
    try {
      await api.delete(`/habits/${id}`);
      setHabits((prev) => prev.filter((h) => h._id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const handleCheckin = async (id: string) => {
    try {
      const response = await api.post(`/habits/${id}/checkin`, { date: todayStr });
      const { habit: updatedHabit, xpAwarded, milestoneHit, leveledUp, user: updatedUser } = response.data;
      
      // Update local lists
      setHabits((prev) => prev.map((h) => (h._id === id ? updatedHabit : h)));
      
      if (updatedUser) {
        updateUser(updatedUser);
      }

      // Check milestones or levels to celebrate
      if (leveledUp) {
        triggerLevelUpConfetti();
        setToastMessage({
          title: `Level Up!`,
          desc: `You've reached Level ${updatedUser.level}! Keep crushing it.`,
          type: 'level'
        });
      } else if (milestoneHit) {
        triggerMilestoneConfetti();
        setToastMessage({
          title: `${milestoneHit}-Day Streak Milestone!`,
          desc: `Earned +${xpAwarded - 10} XP milestone bonus!`,
          type: 'milestone'
        });
      }
    } catch (err) {
      console.error('Error during checkin:', err);
    }
  };

  const triggerMilestoneConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00F294', '#00ffaa', '#ffffff']
    });
  };

  const triggerLevelUpConfetti = () => {
    const end = Date.now() + (2 * 1000);
    const colors = ['#00F294', '#00D882', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const openEditModal = (habit: Habit) => {
    setSelectedHabit(habit);
    setHabitName(habit.name);
    setHabitCategory(habit.category);
    setIsEditOpen(true);
  };

  // Filter logic
  const filteredHabits = habits.filter(
    (h) => filter === 'All' || h.category === filter
  );

  // Computes
  const totalXP = user?.xp || 0;
  const xpInCurrentLevel = totalXP % 100;
  
  const habitsCompletedTodayCount = habits.filter((h) =>
    h.completionLog.some((log) => log.date === todayStr && log.completed)
  ).length;

  const overallLongestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);

  const categoriesList = ['All', 'Fitness', 'Mind', 'Work', 'Health', 'Creative', 'General'];

  return (
    <div className="space-y-8 md:space-y-10 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="glass-panel border-accent/30 rounded-2xl p-4 shadow-[0_10px_50px_rgba(0,242,148,0.15)] flex items-start space-x-3.5 bg-zinc-950/95 backdrop-blur-xl">
              <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                {toastMessage.type === 'level' ? (
                  <Sparkles className="w-5 h-5 text-accent animate-spin-slow" />
                ) : (
                  <Award className="w-5 h-5 text-accent animate-bounce" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-display font-bold text-white text-sm">{toastMessage.title}</h4>
                <p className="text-zinc-400 text-xs font-light">{toastMessage.desc}</p>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-zinc-500 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile XP Progress Dashboard */}
      {user && (
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.05] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/[0.02] rounded-full filter blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left: User level card */}
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-emerald-500 border border-accent/30 flex items-center justify-center text-zinc-950 font-display font-extrabold text-xl shadow-[0_0_20px_rgba(0,242,148,0.2)]">
                {user.level}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Level Progress</p>
                <h2 className="font-display font-bold text-white text-lg">
                  Lvl {user.level} Ritualist
                </h2>
              </div>
            </div>

            {/* Middle: Progress Bar */}
            <div className="flex-1 w-full space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-400">
                <span>{xpInCurrentLevel} XP</span>
                <span>{100 - xpInCurrentLevel} XP to Level {user.level + 1}</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-900 rounded-full border border-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpInCurrentLevel}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Summary Widgets */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total XP */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.05] space-y-2">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total XP</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white">{totalXP}</span>
            <span className="text-xs text-accent">pts</span>
          </div>
        </div>

        {/* Completion Today */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.05] space-y-2">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Completed Today</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white">
              {habitsCompletedTodayCount}
            </span>
            <span className="text-xs text-zinc-500">/ {habits.length} habits</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.05] space-y-2">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Longest Streak</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white">{overallLongestStreak}</span>
            <span className="text-xs text-accent">days</span>
          </div>
        </div>

        {/* Total Active Rituals */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.05] space-y-2">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active Rituals</p>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-white">{habits.length}</span>
            <span className="text-xs text-zinc-500">rituals</span>
          </div>
        </div>

      </section>

      {/* Main Grid Header / Controls */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.04]">
        
        {/* Left: Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex-shrink-0 ${
                filter === cat
                  ? 'bg-accent/15 border-accent/35 text-accent'
                  : 'border-white/[0.04] bg-white/[0.01] text-zinc-400 hover:text-white hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: Add Ritual CTA */}
        <button
          onClick={() => {
            setHabitName('');
            setHabitCategory('General');
            setIsAddOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-accent text-zinc-950 font-semibold text-xs hover:bg-accent-hover transition-colors flex items-center justify-center space-x-1.5 shadow-[0_0_20px_rgba(0,242,148,0.1)] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Ritual</span>
        </button>

      </section>

      {/* Grid List */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="glass-panel rounded-2xl p-5 border border-white/[0.06] space-y-4 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-2/3">
                    <div className="h-5 bg-zinc-900 rounded" />
                    <div className="h-3 bg-zinc-900 rounded w-1/2" />
                  </div>
                  <div className="h-7 bg-zinc-900 rounded-xl w-12" />
                </div>
                <div className="space-y-1.5 pt-4">
                  <div className="h-2 bg-zinc-900 rounded w-1/4" />
                  <div className="h-6 bg-zinc-900 rounded" />
                </div>
                <div className="h-9 bg-zinc-900 rounded-xl pt-2" />
              </div>
            ))}
          </div>
        ) : filteredHabits.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredHabits.map((habit) => (
              <motion.div
                key={habit._id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <HabitCard
                  habit={habit}
                  todayStr={todayStr}
                  onCheckin={handleCheckin}
                  onEdit={openEditModal}
                  onDelete={handleDeleteHabit}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="glass-panel border-white/[0.05] rounded-3xl p-12 text-center max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 bg-zinc-900 border border-white/[0.05] rounded-2xl flex items-center justify-center mx-auto text-zinc-500">
              <Smile className="w-6 h-6 text-zinc-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-bold text-white text-lg">No active rituals</h3>
              <p className="text-zinc-400 text-xs font-light max-w-sm mx-auto leading-relaxed">
                {filter === 'All'
                  ? "It's time to build consistent routines. Create your first ritual to start compounding streaks and levels."
                  : `You don't have any rituals listed under the "${filter}" category.`}
              </p>
            </div>
            {filter === 'All' && (
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs hover:bg-zinc-200 transition-colors inline-flex"
              >
                Assemble First Ritual
              </button>
            )}
          </div>
        )}
      </section>

      {/* Add Habit Dialog Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <>
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-20 sm:top-1/4 md:mx-auto max-w-md bg-zinc-950 border border-white/[0.08] p-6 rounded-2xl shadow-2xl z-[51] space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="font-display font-bold text-lg text-white">Create New Ritual</h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="text-zinc-500 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ritual Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Read 10 Pages, Cold Shower"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                  >
                    {categoriesList.filter((cat) => cat !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="flex-1 py-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] text-zinc-400 hover:text-white text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Habit Dialog Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <>
            {/* Modal Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-4 top-20 sm:top-1/4 md:mx-auto max-w-md bg-zinc-950 border border-white/[0.08] p-6 rounded-2xl shadow-2xl z-[51] space-y-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="font-display font-bold text-lg text-white">Edit Ritual Details</h3>
                <button
                  onClick={() => setIsEditOpen(false)}
                  className="text-zinc-500 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditHabit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Ritual Name</label>
                  <input
                    type="text"
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Category</label>
                  <select
                    value={habitCategory}
                    onChange={(e) => setHabitCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                  >
                    {categoriesList.filter((cat) => cat !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditOpen(false);
                      setSelectedHabit(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/[0.06] hover:bg-white/[0.02] text-zinc-400 hover:text-white text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
