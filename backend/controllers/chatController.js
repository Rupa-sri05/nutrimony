const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const chat = async (req, res) => {
  try {
    const { message, profile, nutrition } = req.body;

    console.log('Chat request received:', message);
    console.log('API Key:', process.env.GROQ_API_KEY ? 'Found' : 'NOT FOUND');

    const context = `You are a professional nutritionist AI assistant for Nutrimony app.
Answer only nutrition, diet, and health related questions.

User Profile:
- Age: ${profile.age} years
- Weight: ${profile.weight} kg
- Height: ${profile.height} cm
- Goal: ${profile.goal.replace('_', ' ')}
- Activity Level: ${profile.activityLevel}

Daily Nutrition Targets:
- Calories: ${nutrition.calories} kcal
- Protein: ${nutrition.protein}g
- Carbs: ${nutrition.carbs}g
- Fats: ${nutrition.fats}g

Give short, practical, personalized advice based on this profile.
Keep responses under 150 words.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: context },
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    console.log('AI Response:', response);

    res.status(200).json({ reply: response });

  } catch (error) {
    console.error('Groq Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chat };