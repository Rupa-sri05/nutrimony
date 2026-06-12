import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveProfile } from '../services/api';

const Profile = () => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal, setGoal] = useState('maintain');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveProfile({ age, weight, height, goal, activityLevel });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    }
  };

  return (
    <div className="container">
      <h2>🥗 Nutrimony</h2>
      <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#555' }}>
        Your Health Profile
      </h3>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            placeholder="Enter your age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Weight (kg)</label>
          <input
            type="number"
            placeholder="Enter your weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Height (cm)</label>
          <input
            type="number"
            placeholder="Enter your height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Goal</label>
          <select value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintain">Maintain Weight</option>
          </select>
        </div>
        <div className="form-group">
          <label>Activity Level</label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
          >
            <option value="sedentary">Sedentary (little or no exercise)</option>
            <option value="light">Light (1-3 days/week)</option>
            <option value="moderate">Moderate (3-5 days/week)</option>
            <option value="active">Active (6-7 days/week)</option>
          </select>
        </div>
        <button type="submit" className="btn">
          Generate My Nutrition Plan
        </button>
      </form>
    </div>
  );
};

export default Profile;