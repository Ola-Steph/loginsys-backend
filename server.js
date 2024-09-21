const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://stephjaiye:OoE8UWaxlTpyjmmz@cluster0.pgpu6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Register route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.json({ message: 'User registered successfully' });
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) return res.status(400).json({ message: 'Invalid password' });

  const token = jwt.sign({ email: user.email, id: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
  res.json({ token });
});

// Protected route
app.get('/api/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
    res.json({ message: 'Welcome to the protected route', user: decoded });
  });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
