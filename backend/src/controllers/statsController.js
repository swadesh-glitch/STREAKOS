const Habit = require('../models/Habit');
const User = require('../models/User');

// Helper to generate date string list for the last N days
const getLastNDays = (n) => {
  const dates = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
};

const getStats = async (req, res) => {
  try {
    const todayStr = req.query.today || new Date().toISOString().split('T')[0];
    
    // Fetch all habits for user
    const habits = await Habit.find({ userId: req.user.id });

    // Aggregate User Stats
    const user = await User.findById(req.user.id);
    const totalXP = user.xp;
    const currentLevel = user.level;

    // 1. Longest Streak Overall
    let longestStreakOverall = 0;
    habits.forEach((h) => {
      if (h.longestStreak > longestStreakOverall) {
        longestStreakOverall = h.longestStreak;
      }
    });

    // 2. Habits Completed Today
    let completedToday = 0;
    habits.forEach((h) => {
      const isCompletedToday = h.completionLog.some(
        (log) => log.date === todayStr && log.completed
      );
      if (isCompletedToday) {
        completedToday++;
      }
    });

    // 3. Overall Daily Active Streak (Days where at least 1 habit was completed)
    const allCompletedDates = new Set();
    habits.forEach((h) => {
      h.completionLog.forEach((log) => {
        if (log.completed) {
          allCompletedDates.add(log.date);
        }
      });
    });

    let overallStreak = 0;
    if (allCompletedDates.size > 0) {
      const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
      };

      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      };

      let checkDate = parseDate(todayStr);

      if (allCompletedDates.has(todayStr)) {
        overallStreak = 1;
        while (true) {
          checkDate.setDate(checkDate.getDate() - 1);
          const checkStr = formatDate(checkDate);
          if (allCompletedDates.has(checkStr)) {
            overallStreak++;
          } else {
            break;
          }
        }
      } else {
        const yesterday = parseDate(todayStr);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);

        if (allCompletedDates.has(yesterdayStr)) {
          overallStreak = 1;
          checkDate = yesterday;
          while (true) {
            checkDate.setDate(checkDate.getDate() - 1);
            const checkStr = formatDate(checkDate);
            if (allCompletedDates.has(checkStr)) {
              overallStreak++;
            } else {
              break;
            }
          }
        }
      }
    }

    // 4. Last 7 Days Completion Data (For Recharts Bar/Line charts)
    const last7Days = getLastNDays(7);
    const last7DaysData = last7Days.map((date) => {
      let completedCount = 0;
      habits.forEach((h) => {
        const checked = h.completionLog.some((log) => log.date === date && log.completed);
        if (checked) completedCount++;
      });

      // format to readable string like "Mon", "Tue"
      const dateObj = new Date(date);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        date,
        day: dayName,
        completed: completedCount,
        total: habits.length,
        rate: habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0,
      };
    });

    // 5. Last 30 Days Completion Data (For Line chart trends)
    const last30Days = getLastNDays(30);
    const last30DaysData = last30Days.map((date) => {
      let completedCount = 0;
      habits.forEach((h) => {
        const checked = h.completionLog.some((log) => log.date === date && log.completed);
        if (checked) completedCount++;
      });
      return {
        date,
        completed: completedCount,
        rate: habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0,
      };
    });

    // 6. Category Distribution (For Pie Chart)
    const categoryCounts = {};
    const categoryCompletions = {};
    const categories = ['Fitness', 'Mind', 'Work', 'Health', 'Creative', 'General'];

    categories.forEach((cat) => {
      categoryCounts[cat] = 0;
      categoryCompletions[cat] = 0;
    });

    habits.forEach((h) => {
      const cat = categories.includes(h.category) ? h.category : 'General';
      categoryCounts[cat]++;
      
      // count total completions for this habit
      const completions = h.completionLog.filter((log) => log.completed).length;
      categoryCompletions[cat] += completions;
    });

    const categoryDistribution = categories.map((cat) => ({
      name: cat,
      count: categoryCounts[cat],
      completions: categoryCompletions[cat],
    })).filter((item) => item.count > 0 || item.completions > 0);

    // Summary data
    const totalCompletions = habits.reduce((acc, h) => {
      return acc + h.completionLog.filter((log) => log.completed).length;
    }, 0);

    return res.json({
      summary: {
        totalXP,
        currentLevel,
        longestStreakOverall,
        completedToday,
        overallStreak,
        totalHabits: habits.length,
        totalCompletions,
      },
      last7Days: last7DaysData,
      last30Days: last30DaysData,
      categoryDistribution,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    return res.status(500).json({ message: 'Error retrieving statistics' });
  }
};

module.exports = {
  getStats,
};
