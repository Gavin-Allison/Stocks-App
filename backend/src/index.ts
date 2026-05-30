import express from "express";
import cors from "cors";
import authRoutes from './routes/auth';
import experimentRoutes from './routes/experiment';
import transactionRoutes from './routes/transaction';
import stockRoutes from './routes/stocks';
import aiRoutes from './routes/ai'

const App = express();
App.use(cors());
App.use(express.json());

App.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Routes
App.use('/api', authRoutes);
App.use('/api', stockRoutes);
App.use('/api', aiRoutes)
App.use('/api/experiments', experimentRoutes);
App.use('/api/transactions', transactionRoutes);

App.listen(3003, () => console.log('Proxy running on port 3003'));