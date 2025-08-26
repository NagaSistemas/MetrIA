import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase } from './config/firebase';
import sessionRoutes from './routes/session';
import kitchenRoutes from './routes/kitchen';
import adminRoutes from './routes/admin';
import aiRoutes from './routes/ai';
import waiterRoutes from './routes/waiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase
initializeFirebase();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/session', sessionRoutes);
app.use('/api/kitchen', kitchenRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/call-waiter', waiterRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});