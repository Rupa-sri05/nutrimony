const Profile = require('../models/Profile');

// Calculate nutrition plan based on profile
const calculateNutrition = (profile) => {
  const { age, weight, height, goal, activityLevel } = profile;

  // BMR calculation (Mifflin-St Jeor Formula)
  const BMR = 10 * weight + 6.25 * height - 5 * age + 5;

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725
  };

  const TDEE = BMR * activityMultipliers[activityLevel];

  // Adjust calories based on goal
  let calories;
  if (goal === 'weight_loss') calories = TDEE - 500;
  else if (goal === 'muscle_gain') calories = TDEE + 300;
  else calories = TDEE;

  // Macros calculation
  const protein = Math.round(weight * 2);
  const fats = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);

  return {
    calories: Math.round(calories),
    protein,
    carbs,
    fats
  };
};

// Create or Update Profile
const saveProfile = async (req, res) => {
  try {
    const { age, weight, height, goal, activityLevel } = req.body;

    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      // Update existing profile
      profile.age = age;
      profile.weight = weight;
      profile.height = height;
      profile.goal = goal;
      profile.activityLevel = activityLevel;
      await profile.save();
    } else {
      // Create new profile
      profile = await Profile.create({
        user: req.user._id,
        age,
        weight,
        height,
        goal,
        activityLevel
      });
    }

    const nutrition = calculateNutrition(profile);

    res.status(200).json({ profile, nutrition });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const nutrition = calculateNutrition(profile);

    res.status(200).json({ profile, nutrition });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { saveProfile, getProfile };