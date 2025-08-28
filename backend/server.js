const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

app.get('/', (req, res) => res.send('API is running...')); // A simple test route
app.use('/api/auth', require('./routes/auth.routes.js'));
app.use('/api/analyze', require('./routes/analyze.routes.js'));
app.use('/api/resumes', require('./routes/resume.routes.js'));
app.use('/api/upload', require('./routes/upload.routes.js'));
app.use('/api/generate', require('./routes/generate.routes.js')); 
app.use('/api/applications', require('./routes/application.routes.js'));


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});