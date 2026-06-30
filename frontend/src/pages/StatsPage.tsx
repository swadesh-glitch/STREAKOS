import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Calendar, Flame, CheckCircle2, Award, BarChart3, PieChartIcon, Activity } from 'lucide-react';

interface StatsSummary {
  totalXP: number;
  currentLevel: number;
  longestStreakOverall: number;
  completedToday: number;
  overallStreak: number;
  totalHabits: number;
  totalCompletions: number;
}

interface DayData {
  date: string;
  day: string;
  completed: number;
  total: number;
  rate: number;
}

interface MonthData {
  date: string;
  completed: number;
  rate: number;
}

interface CategoryData {
  name: string;
  count: number;
  completions: number;
}

interface StatsData {
  summary: StatsSummary;
  last7Days: DayData[];
  last30Days: MonthData[];
  categoryDistribution: CategoryData[];
}

export const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const response = await api.get(`/stats?today=${todayStr}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-8 bg-zinc-900 rounded w-1/4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 bg-zinc-900 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-zinc-900 rounded-2xl lg:col-span-2" />
          <div className="h-80 bg-zinc-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">Failed to load statistics dashboard.</p>
      </div>
    );
  }

  const { summary, last7Days, last30Days, categoryDistribution } = stats;

  // Custom colors for Donut chart
  const COLORS = ['#00F294', '#00D882', '#38BDF8', '#818CF8', '#FB7185', '#F59E0B'];

  // Custom tooltips to match glassmorphic editorial style
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border-white/[0.08] p-3.5 rounded-xl shadow-2xl bg-zinc-950/95 text-xs text-left">
          <p className="font-semibold text-white mb-1.5">{label || payload[0].payload.date}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-zinc-400 font-light flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              <span>
                {item.name}: <span className="text-accent font-semibold">{item.value}</span>
                {item.name === 'Completion Rate' && '%'}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 md:space-y-10">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">Performance Board</h1>
        <p className="text-zinc-500 text-sm font-light">Comprehensive analysis of your active habits, streak trends, and XP gains.</p>
      </div>

      {/* Aggregate Widgets */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Active Streak */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.05] space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1.5 bg-accent/5 rounded-lg border border-accent/10">
            <Flame className="w-4 h-4 text-accent" />
          </div>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active Day Streak</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-white">{summary.overallStreak}</span>
            <span className="text-xs text-zinc-400">days</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-light">Days with at least 1 check-in</p>
        </div>

        {/* Total Completions */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.05] space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1.5 bg-zinc-900 rounded-lg border border-white/[0.04]">
            <CheckCircle2 className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Total Completions</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-white">{summary.totalCompletions}</span>
            <span className="text-xs text-zinc-400">times</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-light">All-time check-ins recorded</p>
        </div>

        {/* Longest streak */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.05] space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1.5 bg-zinc-900 rounded-lg border border-white/[0.04]">
            <Award className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Streak Peak</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-white">{summary.longestStreakOverall}</span>
            <span className="text-xs text-zinc-400">days</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-light">Highest single-habit streak</p>
        </div>

        {/* Global completion rate */}
        <div className="glass-panel p-5 rounded-2xl border border-white/[0.05] space-y-2 relative overflow-hidden">
          <div className="absolute top-2 right-2 p-1.5 bg-zinc-900 rounded-lg border border-white/[0.04]">
            <Activity className="w-4 h-4 text-zinc-400" />
          </div>
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Active Rituals</p>
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-white">{summary.totalHabits}</span>
            <span className="text-xs text-zinc-400">rituals</span>
          </div>
          <p className="text-[10px] text-zinc-500 font-light">Total habits currently tracked</p>
        </div>

      </section>

      {/* Main Charts Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Last 7 Days Completion Bar Chart */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/[0.05] lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-white text-base">Weekly Activity Rate</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar name="Completions" dataKey="completed" fill="#00F294" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Category Distribution Donut Chart */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/[0.05] flex flex-col justify-between space-y-4">
          <div className="flex items-center space-x-2">
            <PieChartIcon className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-white text-base">Completions by Category</h3>
          </div>
          
          {categoryDistribution.length > 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="completions"
                    >
                      {categoryDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.4)" strokeWidth={1} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-bold text-white">{summary.totalCompletions}</span>
                </div>
              </div>

              {/* Legends list */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full pt-4 text-xs font-light text-zinc-400">
                {categoryDistribution.map((item, index) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="truncate">{item.name}</span>
                    <span className="text-zinc-600 font-bold">({item.completions})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 p-6">
              <p className="text-xs text-zinc-500 font-light">No category logs available. Mark habits completed to view distributions.</p>
            </div>
          )}
        </div>

      </section>

      {/* Full Width Area Line Chart: Last 30 Days Trends */}
      <section className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/[0.05] space-y-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-accent" />
          <h3 className="font-display font-semibold text-white text-base">30-Day Completion Trend</h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last30Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00F294" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#00F294" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.substring(5)} />
              <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area name="Completion Rate" type="monotone" dataKey="rate" stroke="#00F294" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRate)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
};
