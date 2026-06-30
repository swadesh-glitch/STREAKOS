const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a habit name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a habit category'],
      enum: ['Fitness', 'Mind', 'Work', 'Health', 'Creative', 'General'],
      default: 'General',
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    completionLog: [
      {
        date: {
          type: String, // Stored as YYYY-MM-DD
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    awardedMilestones: {
      type: [Number], // Track milestones e.g., [7, 30, 100]
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Habit = mongoose.model('Habit', habitSchema);
module.exports = Habit;
