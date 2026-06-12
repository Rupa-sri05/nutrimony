const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintain'],
    required: true
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);