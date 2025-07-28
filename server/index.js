require('dotenv').config();
const express = require('express');
const { connect, Schema, model } = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB
connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('Make sure your MONGO_URI in .env is correct and that your IP is whitelisted in Atlas.');
});

// 2. Example schema/model
const journalSchema = new Schema({
  userId: String,
  title: String,
  body: String,
  createdAt: { type: Date, default: Date.now }
});
const Journal = model('Journal', journalSchema);

// 3. REST endpoints
app.get('/api/journals/:userId', async (req,res)=>{
  const docs = await Journal.find({ userId: req.params.userId }).sort('-createdAt');
  res.json(docs);
});
app.post('/api/journals', async (req,res)=>{
  const doc = await Journal.create(req.body);
  res.status(201).json(doc);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));