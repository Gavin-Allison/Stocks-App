# Stocks App

A full-stack portfolio tracking and transaction management application. Record stock trades, deposits, withdrawals, and dynamic allocations—then validate your portfolio's performance with real price data.

## Features

- **Transaction Management**: Create one-time or repeated buys, sells, deposits, and withdrawals
- **Dynamic Allocation**: Schedule trades based on percentage of cash (automatic share calculation)
- **AI-Powered Entry**: Use natural language to describe transactions; the app parses them via Google Gemini
- **Portfolio Visualization**: Real-time pie charts, holdings lists, and portfolio metrics
- **Price Validation**: All transactions use actual historical stock prices
- **Experiment Tracking**: Maintain multiple portfolio experiments and compare strategies
- **Responsive Performance**: Virtualized lists and memoized state for smooth interactions, even with large transaction histories

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Google AI API key (for AI transaction parsing)

### Setup

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Configure environment
# Create .env in /backend with:
# GOOGLE_AI_STUDIO_API_KEY=<your-api-key>

# Start backend (runs on port 3002)
cd backend && npm run dev

# Start frontend (runs on port 5173)
cd frontend && npm run dev
```

Open http://localhost:5173 to access the app.

---

## User Guide

### Adding Stocks

1. In the header, enter a stock ticker (e.g., **AAPL**)
2. Click **Add Stock**
3. The app fetches historical price data and displays a chart

### Recording Transactions

Three input methods:

#### 1. **Fixed Quantity (Trade Tab)**
- Select stock and enter number of shares
- Choose **Buy #** or **Sell #**
- Transactions use the current date and price

#### 2. **Percentage of Cash (Trade Tab)**
- Toggle **#** → **%** button
- Enter percentage of cash to invest
- App auto-calculates shares at that date's price
- Choose **Buy %** or **Sell %**

#### 3. **Cash Movements (Cash Tab)**
- Enter amount and optional fee
- Choose **Deposit** or **Withdraw**
- No price lookup required

#### 4. **AI Assistant (AI Tab)**
- Type a transaction description (e.g., "buy 50 AAPL at market" or "invest 30% of cash into TSLA")
- Click **Submit**
- Gemini parses and returns matching transactions

### Scheduling Repeats

All input methods support **Repeat Schedule**:
- **Frequency**: None, Monthly, Yearly, or Every X Days
- **Occurrences**: How many times to repeat
- **Start Date**: Uses the selected date
- Each occurrence uses the historical price for that date

### Viewing Results

Switch to the **Results** tab to see:
- **Portfolio Value**: Total assets + cash
- **Pie Chart**: Asset allocation by percentage
- **Holdings List**: Detailed per-stock breakdown
- **Metrics**: Highest concentration, unique positions

### Ledger

The **Transactions** tab's ledger shows:
- Transaction details (date, type, price, amount, fee)
- Running cash balance
- Batch/error status
- **Draft transactions** (red): Not yet committed
- **Selected batch** (blue): Highlight related transactions
- **Actions**: Commit, select/clear batch, or remove

---

## Architecture

This is a full-stack application with performance optimizations throughout.

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation:**
- Frontend state management & memoization
- ValidateLedger algorithm
- Component structure & virtualization
- Backend API & AI integration
- Database schema

---

## Project Structure

```
Stocks-App/
├── frontend/          # React + TypeScript + Vite + Tailwind
│   └── src/
│       ├── components/    # UI components (virtualized lists, forms, charts)
│       ├── stores/        # Zustand state (memoized selectors & derivations)
│       ├── services/      # API calls, stock data fetching
│       └── types/         # Shared TypeScript definitions
│
├── backend/           # Express + TypeScript
│   └── src/
│       ├── controllers/   # API endpoints (auth, transactions, AI, stocks)
│       ├── repositories/  # Database queries
│       ├── middleware/    # Logging, error handling
│       └── types/         # Transaction schemas (Zod validation)
│
└── README.md, ARCHITECTURE.md
```

---

## Technologies

**Frontend**: React 19, TypeScript, Zustand 5, Vite, Tailwind CSS, react-window, Lightweight Charts, Material-UI

**Backend**: Node.js, Express, TypeScript, PostgreSQL, Google Gemini 2.5 Flash, Zod validation

---