import express from "express";
import cors from "cors";
import authRoutes from './routes/auth';
import experimentRoutes from './routes/experiment';
import transactionRoutes from './routes/transaction';
import stockRoutes from './routes/stocks';

const App = express();
App.use(cors());
App.use(express.json());

// Routes
App.use('/api', authRoutes);
App.use('/api', stockRoutes);
App.use('/api/experiments', experimentRoutes);
App.use('/api/transactions', transactionRoutes);

App.listen(3001, () => console.log('Proxy running on port 3001'));