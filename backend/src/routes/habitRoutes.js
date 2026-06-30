const express = require('express');
const router = express.Router();
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  checkin,
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes inside are protected

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.route('/:id')
  .put(updateHabit)
  .delete(deleteHabit);

router.post('/:id/checkin', checkin);

module.exports = router;
