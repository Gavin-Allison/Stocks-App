import express from "express";
import cors from "cors";

import { authController } from './controllers/authController';
import { transactionController } from './controllers/transactionController';
import { experimentController } from './controllers/experimentController';
import { stockController } from './controllers/stockController';
import { aiController } from './controllers/aiController';
import { loggingMiddleware, errorMiddleware } from './middleware/errorMiddleware';

// Express application bootstrap
// Configures CORS, JSON body parsing, request logging, API routes, and error handling.
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

// Auth Routes
app.post('/api/users', (req, res) => authController.login(req, res));

// Stock Routes
app.get('/api/stock_history', (req, res) => stockController.getStockHistory(req, res));

// AI Routes
app.post('/api/ai', (req, res) => aiController.parseTransactionPrompt(req, res));

// Experiment Routes
app.get('/api/experiments/:experiment_name/data', (req, res) =>
    experimentController.getExperimentData(req, res)
);
app.post('/api/experiments/stocks', (req, res) => experimentController.addStock(req, res));
app.delete('/api/experiments/stocks', (req, res) => experimentController.removeStock(req, res));

// Transaction Routes
app.post('/api/transactions', (req, res) => transactionController.createTransaction(req, res));
app.delete('/api/transactions/:id', (req, res) => transactionController.deleteTransaction(req, res));

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));