import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, sendMessage } from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#2d6a4f', '#52b788', '#95d5b2'];

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! I am your personal nutrition assistant. Ask me anything about your diet, meals, or health goals! 🥗' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setProfile(data.profile);
        setNutrition(data.nutrition);
      } catch (err) {
        navigate('/profile');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await sendMessage({
        message: input,
        profile,
        nutrition
      });
      setMessages(prev => [...prev, { from: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { from: 'ai', text: 'Sorry, something went wrong. Please try again.' }]);
    }
    setLoading(false);
  };

  const getMealSuggestions = (profile, nutrition) => {
    const { goal, weight } = profile;
    const { calories, protein } = nutrition;

    const breakfastCal = Math.round(calories * 0.25);
    const lunchCal = Math.round(calories * 0.35);
    const dinnerCal = Math.round(calories * 0.25);
    const snack1Cal = Math.round(calories * 0.08);
    const snack2Cal = Math.round(calories * 0.07);

    const lunchProtein = Math.round(protein * 0.35);
    const dinnerProtein = Math.round(protein * 0.25);

    const foodsByGoal = {
      weight_loss: {
        breakfast: [
          `Oats with low-fat milk (${Math.round(breakfastCal * 0.4)} kcal)`,
          `Boiled eggs ${Math.round(weight * 0.03)} nos`,
          'Green tea / black coffee',
          'Cucumber slices'
        ],
        lunch: [
          `Brown rice ${Math.round(lunchCal * 0.3)} kcal portion`,
          `Grilled chicken ${lunchProtein}g protein`,
          'Dal / lentils (1 bowl)',
          'Mixed salad (no dressing)'
        ],
        dinner: [
          `2 Rotis (${Math.round(dinnerCal * 0.4)} kcal)`,
          'Stir-fried vegetables',
          `Paneer / tofu ${dinnerProtein}g`,
          'Low-fat curd'
        ],
        snack1: [
          'Apple / orange (1 fruit)',
          `Almonds ${Math.round(snack1Cal / 6)} nos`,
          'Green tea'
        ],
        snack2: [
          'Low-fat milk (1 glass)',
          'Small banana'
        ]
      },
      muscle_gain: {
        breakfast: [
          `Oats with full-fat milk (${Math.round(breakfastCal * 0.4)} kcal)`,
          `Boiled eggs ${Math.round(weight * 0.05)} nos`,
          `Banana (${Math.round(breakfastCal * 0.2)} kcal)`,
          'Peanut butter (1 tbsp)'
        ],
        lunch: [
          `White rice large portion (${Math.round(lunchCal * 0.35)} kcal)`,
          `Chicken breast ${lunchProtein}g`,
          'Dal (2 bowls)',
          'Salad + curd'
        ],
        dinner: [
          `3 Rotis (${Math.round(dinnerCal * 0.4)} kcal)`,
          `Paneer curry ${dinnerProtein}g protein`,
          'Milk (1 glass)',
          'Mixed vegetables'
        ],
        snack1: [
          `Banana + peanut butter (${snack1Cal} kcal)`,
          'Full-fat milk (1 glass)',
          `Nuts ${Math.round(snack1Cal / 6)} nos`
        ],
        snack2: [
          `Boiled eggs ${Math.round(weight * 0.03)} nos`,
          'Protein shake / milk',
          'Handful of nuts'
        ]
      },
      maintain: {
        breakfast: [
          `Oats or Upma (${Math.round(breakfastCal * 0.4)} kcal)`,
          `Boiled eggs ${Math.round(weight * 0.03)} nos`,
          'Tea / coffee',
          'Seasonal fruit'
        ],
        lunch: [
          `Rice medium portion (${Math.round(lunchCal * 0.35)} kcal)`,
          'Dal + sabzi',
          `Chicken / paneer ${lunchProtein}g`,
          'Curd (1 bowl)'
        ],
        dinner: [
          `2 Rotis (${Math.round(dinnerCal * 0.4)} kcal)`,
          'Dal or sabzi',
          'Curd / raita',
          'Salad'
        ],
        snack1: [
          'Seasonal fruits',
          `Mixed nuts ${Math.round(snack1Cal / 6)} nos`,
          'Green tea'
        ],
        snack2: [
          'Milk (1 glass)',
          'Light snack'
        ]
      }
    };

    const foods = foodsByGoal[goal] || foodsByGoal.maintain;

    return [
      { time: '🌅 Breakfast', foods: foods.breakfast, calories: breakfastCal },
      { time: '🍎 Morning Snack', foods: foods.snack1, calories: snack1Cal },
      { time: '☀️ Lunch', foods: foods.lunch, calories: lunchCal },
      { time: '🥛 Evening Snack', foods: foods.snack2, calories: snack2Cal },
      { time: '🌙 Dinner', foods: foods.dinner, calories: dinnerCal }
    ];
  };

  if (!nutrition) return <div style={{ textAlign: 'center', marginTop: '60px' }}>Loading...</div>;

  const chartData = [
    { name: 'Protein', value: nutrition.protein },
    { name: 'Carbs', value: nutrition.carbs },
    { name: 'Fats', value: nutrition.fats }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#2d6a4f' }}>🥗 Nutrimony</h2>
        <div>
          <span style={{ marginRight: '16px' }}>👤 {user?.name}</span>
          <button onClick={() => navigate('/profile')}
            style={{ marginRight: '10px', padding: '8px 16px', background: '#52b788', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Edit Profile
          </button>
          <button onClick={handleLogout}
            style={{ padding: '8px 16px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Nutrition Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
        {[
          { label: 'Calories', value: `${nutrition.calories} kcal`, color: '#2d6a4f' },
          { label: 'Protein', value: `${nutrition.protein}g`, color: '#52b788' },
          { label: 'Carbs', value: `${nutrition.carbs}g`, color: '#95d5b2' },
          { label: 'Fats', value: `${nutrition.fats}g`, color: '#b7e4c7' }
        ].map((item, i) => (
          <div key={i} style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: item.color }}>{item.value}</div>
            <div style={{ color: '#777', marginTop: '6px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <h3 style={{ color: '#2d6a4f', marginBottom: '20px' }}>Macronutrient Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Profile Info */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <h3 style={{ color: '#2d6a4f', marginBottom: '20px' }}>Your Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[
            { label: 'Age', value: `${profile.age} years` },
            { label: 'Weight', value: `${profile.weight} kg` },
            { label: 'Height', value: `${profile.height} cm` },
            { label: 'Goal', value: profile.goal.replace('_', ' ').toUpperCase() },
            { label: 'Activity Level', value: profile.activityLevel.toUpperCase() }
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px', background: '#f0f4f8', borderRadius: '8px' }}>
              <span style={{ color: '#777', fontSize: '13px' }}>{item.label}</span>
              <div style={{ fontWeight: 'bold', color: '#2d6a4f', marginTop: '4px' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal Suggestions */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', marginBottom: '30px' }}>
        <h3 style={{ color: '#2d6a4f', marginBottom: '20px' }}>🍽️ Your Personalized Meal Plan</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {getMealSuggestions(profile, nutrition).map((meal, i) => (
            <div key={i} style={{ background: '#f0f4f8', padding: '16px', borderRadius: '10px' }}>
              <div style={{ fontWeight: 'bold', color: '#2d6a4f', marginBottom: '8px' }}>{meal.time}</div>
              <ul style={{ paddingLeft: '16px', color: '#555' }}>
                {meal.foods.map((food, j) => (
                  <li key={j} style={{ marginBottom: '4px', fontSize: '14px' }}>{food}</li>
                ))}
              </ul>
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#888', fontWeight: 'bold' }}>~{meal.calories} kcal</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Chatbot */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        <h3 style={{ color: '#2d6a4f', marginBottom: '20px' }}>🤖 AI Nutrition Assistant</h3>

        {/* Messages */}
        <div style={{ height: '300px', overflowY: 'auto', marginBottom: '16px', padding: '10px', background: '#f0f4f8', borderRadius: '10px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: msg.from === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                background: msg.from === 'user' ? '#2d6a4f' : 'white',
                color: msg.from === 'user' ? 'white' : '#333',
                fontSize: '14px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '18px 18px 18px 0', background: 'white', fontSize: '14px' }}>
                Thinking... 🤔
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your diet..."
            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            style={{ padding: '12px 24px', background: '#2d6a4f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
            Send
          </button>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;