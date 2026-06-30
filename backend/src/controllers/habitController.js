const Habit = require('../models/Habit');
const User = require('../models/User');

// Helper to calculate current and longest streaks based on completionLog
const calculateStreak = (completionLog, todayStr) => {
  const completedDates = completionLog
    .filter((log) => log.completed)
    .map((log) => log.date);

  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dateSet = new Set(completedDates);

  // Helper to parse date string YYYY-MM-DD to local Date object
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper to format Date object to YYYY-MM-DD
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  let currentStreak = 0;
  let checkDate = parseDate(todayStr);

  // Check if completed today
  if (dateSet.has(todayStr)) {
    currentStreak = 1;
    // Count backwards
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const checkStr = formatDate(checkDate);
      if (dateSet.has(checkStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  } else {
    // Check if completed yesterday
    const yesterday = parseDate(todayStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    if (dateSet.has(yesterdayStr)) {
      currentStreak = 1;
      checkDate = yesterday;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        const checkStr = formatDate(checkDate);
        if (dateSet.has(checkStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }
  }

  // To find longest streak: scan all dates and find max contiguous streak
  const sortedDates = Array.from(dateSet).sort();
  let maxStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (let i = 0; i < sortedDates.length; i++) {
    const currDate = parseDate(sortedDates[i]);
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = Math.abs(currDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
    prevDate = currDate;
  }

  return { currentStreak, longestStreak: maxStreak };
};

// CRUD handlers
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json(habits);
  } catch (error) {
    console.error('Get Habits Error:', error);
    return res.status(500).json({ message: 'Error retrieving habits' });
  }
};

const createHabit = async (req, res) => {
  try {
    const { name, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    const habit = new Habit({
      userId: req.user.id,
      name,
      category: category || 'General',
    });

    await habit.save();
    return res.status(201).json(habit);
  } catch (error) {
    console.error('Create Habit Error:', error);
    return res.status(500).json({ message: 'Error creating habit' });
  }
};

const updateHabit = async (req, res) => {
  try {
    const { name, category } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    if (name) habit.name = name;
    if (category) habit.category = category;

    await habit.save();
    return res.json(habit);
  } catch (error) {
    console.error('Update Habit Error:', error);
    return res.status(500).json({ message: 'Error updating habit' });
  }
};

const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    return res.json({ message: 'Habit deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Delete Habit Error:', error);
    return res.status(500).json({ message: 'Error deleting habit' });
  }
};

// Check-in / Toggle completion log
const checkin = async (req, res) => {
  try {
    const { date } = req.body; // format: YYYY-MM-DD in client timezone

    if (!date) {
      return res.status(400).json({ message: 'Date is required for check-in' });
    }

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    // Toggle completion status for target date
    const logIndex = habit.completionLog.findIndex((log) => log.date === date);
    let isCheckingIn = true;

    if (logIndex !== -1) {
      habit.completionLog[logIndex].completed = !habit.completionLog[logIndex].completed;
      isCheckingIn = habit.completionLog[logIndex].completed;
    } else {
      habit.completionLog.push({ date, completed: true });
      isCheckingIn = true;
    }

    // Recalculate streak values
    const streakResult = calculateStreak(habit.completionLog, date);
    habit.streak = streakResult.currentStreak;

    // Check if new longest streak
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    let xpAwarded = 0;
    let milestoneHit = null;
    let leveledUp = false;

    // Fetch user profile to award XP
    const user = await User.findById(req.user.id);
    const oldLevel = user.level;

    if (isCheckingIn) {
      xpAwarded += 10; // Base completion XP

      // Check milestones: 7 days, 30 days, 100 days
      const milestones = [7, 30, 100];
      const milestoneBonuses = { 7: 50, 30: 200, 100: 500 };

      for (const m of milestones) {
        if (habit.streak >= m && !habit.awardedMilestones.includes(m)) {
          habit.awardedMilestones.push(m);
          xpAwarded += milestoneBonuses[m];
          milestoneHit = m;
          break;
        }
      }

      user.xp += xpAwarded;
    } else {
      // Subtract XP when unchecked
      xpAwarded = -10;
      user.xp = Math.max(0, user.xp + xpAwarded);
    }

    // Calculate level (100 XP per level)
    user.level = Math.floor(user.xp / 100) + 1;
    if (user.level > oldLevel) {
      leveledUp = true;
    }

    await habit.save();
    await user.save();

    return res.json({
      message: isCheckingIn ? 'Checked in successfully' : 'Check-in removed successfully',
      habit,
      xpAwarded,
      milestoneHit,
      leveledUp,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
      },
    });
  } catch (error) {
    console.error('Checkin Error:', error);
    return res.status(500).json({ message: 'Error updating check-in status' });
  }
};

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  checkin,
};
