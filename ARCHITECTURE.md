# Architecture Documentation

## Overview

This is a full-stack React + Node.js application for portfolio tracking with real-time price validation.

---

## Frontend Architecture

### State Management (Zustand)

The app uses **Zustand** for global state, organized into three slices:

#### 1. **Main Slice** (`mainSlice.ts`)
Holds portfolio-wide state:
- `stocks`: Monitored stock list with colors
- `priceData`: Historical price data indexed by ticker and date
- `transactions`: All transactions (draft and committed)
- `date`: Currently selected date
- `currentExperiment`, `experiments`: Portfolio experiment tracking
- `getStockPriceAtDate(ticker, date)`: Helper to retrieve price for a given date

#### 2. **Transaction Slice** (`transactionSlice.ts`)
Holds form inputs and transaction controls:
- **Trade inputs**: `selectedStock`, `fixedOrDynamic`, `numStocks`, `percentOfCash`, `currentPrice`, `tradeFee`
- **Cash inputs**: `cashAmount`, `cashFee`
- **Repeat schedule**: `repeatFrequency`, `repeatIntervalDays`, `repeatOccurrences`
- **UI state**: `tradeOrCash` (which input tab), `repeatScheduleOpen`
- **Batch actions**: `draftBatchCount`, `selectedBatchCount`, `selectedBatchId`
- **Actions**: `addTransaction()`, `removeTransaction()`, `commitTransaction()`, `addTransactionBatch()`, etc.

#### 3. **Ledger Slice** (`ledgerSlice.ts`)
Computes the validated ledger:
- `getLedger()`: **Memoized** function that runs the `validateLedger` algorithm (see below)
  - Returns cached result if `transactions` and `priceData` haven't changed
  - Prevents unnecessary recomputation across renders

## ValidateLedger Algorithm

Located in `ledgerSlice.ts`. This is the core calculation engine.

### Input
- `transactions`: Array of all transactions (deposits, withdrawals, fixed buys/sells, dynamic buys/sells)
- `priceData`: Map of ticker → { date → price }

### Output
- Array of `LedgerEntry` objects, one per transaction, in chronological order


### Key Features
- **Stateful**: Tracks running `cash` and `assets` across all transactions
- **Error Propagation**: Once an error occurs, all subsequent transactions are marked as ignored
- **Date-Aware**: Dynamic buy/sell types look up the exact price for that transaction's date
- **Price Fallback**: If a price is missing, marks error and stops further processing

---

## Frontend Components

### Layout Components

- **`Header`**: Logo, experiment switcher, add stock input, navigation buttons
  - Uses per-field selectors for `experiments`, `currentExperiment`, `addStock`, `setReportTab`
  - Memoized `handleAdd` callback

- **`Report`**: Switcher between Transactions and Results tabs
  - Single selector for `reportTab`; minimal re-renders

- **`Transactions`**: Transaction input form + ledger display
  - 25+ per-field selectors
  - Memoized `buildScheduledTransactions()` and `handleAddTransaction()`
  - Houses the `LedgerList` child

- **`Results`**: Portfolio summary, pie chart, holdings breakdown
  - Memoized `getLedger()` call
  - Uses `useMemo` for portfolio calculations (value, concentration, etc.)

### Input Components

- **`TradeInputs`**: Stock selector, fixed/dynamic toggle, price display, fees
  - Memoized onChange handlers
  - Updates `currentPrice` when stock or date changes (via `useEffect`)

- **`CashInputs`**: Cash amount and fee inputs
  - Memoized onChange handlers

- **`PromptInputs`**: AI text input
  - Memoized onChange handler

- **`RepeatSchedule`**: Frequency, interval, occurrences, collapsible panel
  - Memoized `toggleOpen` callback

### Display Components

- **`LedgerList`**: Virtualized transaction ledger (using `react-window`)
  - Renders only visible rows
  - Memoized `Row` component with `React.memo()`
  - Per-field selectors for `selectedBatchId`, `date`, handlers
  - Passes data via `itemData` prop to avoid prop drilling

- **`StockChartList`**: Grid of stock charts
  - Per-field selectors
  - Memoized `StockChart` child component
  - Passes `color` and `onRemove` as props (not store-dependent)

- **`StockChart`**: Lightweight Charts for price history with transaction volume overlay
  - Displays vertical line for selected date
  - Computes transaction volume histogram
  - Per-field selectors for `transactions`, `date`, `setDate`, `setSelectedStock`

- **`StockPieChart`**: Material-UI pie chart showing asset allocation
- **`StockDatePicker`**: Date picker for portfolio simulation

---

## Backend Architecture

### API Routes

```
POST   /api/users                              → Login/authentication
GET    /api/stock_history?ticker=X             → Fetch historical prices
POST   /api/ai                                 → Parse natural language → transactions
GET    /api/experiments/:name/data             → Get experiment portfolio
POST   /api/experiments/stocks                 → Add stock to experiment
DELETE /api/experiments/stocks                 → Remove stock from experiment
POST   /api/transactions                       → Create transaction
DELETE /api/transactions/:id                   → Delete transaction
```

### Controllers

#### `authController`
- `login(email)`: Authenticates user via Google OAuth, returns session token
- Stores user email in local storage on client

#### `stockController`
- `getStockHistory(ticker)`: Fetches historical OHLCV data from external API (e.g., Alpha Vantage, Yahoo Finance)
- Returns `{ date: price }` map for client-side price validation

#### `aiController`
- `parseTransactionPrompt(promptText, selectedStock, priceData, transactionDate)`: 
  - Calls **Google Gemini 2.5 Flash** with system instruction and context
  - Uses **Zod** to validate response matches transaction schema
  - Returns array of structured `Transaction` objects
  - Fallback to `transactionDate` if user doesn't specify a date

#### `transactionController`
- `createTransaction(transaction)`: Inserts transaction into database, marks as committed
- `deleteTransaction(id)`: Removes transaction from database

#### `experimentController`
- `getExperimentData(experimentName)`: 
  - Queries active stocks, portfolio transactions, price data
  - Returns dataset for client to calculate ledger
- `addStock(experimentName, ticker)`: Adds ticker to experiment's active stock list
- `removeStock(experimentName, ticker)`: Removes ticker and related transactions (optional)

## Database Schema

Tables:

- **users**: id, email, created_at, experiments (JSON array of experiment names)
- **experiments**: experiment_name, user_id, created_at, updated_at
- **stocks**: id, experiment_id, ticker, color, created_at
- **transactions**: id, experiment_id, type (DEPOSIT|FBUY|...), amount, ticker, fees, date, committed, batch_id, created_at

---

## Data Flow Diagram

```
User Input (UI Form)
       ↓
   handleAddTransaction()
       ↓
   buildScheduledTransactions()  ← uses getStockPriceAtDate() for each date
       ↓
   addTransactionBatch() or addTransaction()
       ↓
   store.transactions updated
       ↓
   Zustand notifies subscribers
       ↓
   Components with (s => s.transactions) selector re-render
       ↓
   useMemo(() => getLedger()) recomputes
       ↓
   validateLedger() validates all transactions
       ↓
   LedgerList receives new ledger array
       ↓
   virtualized rows update (only visible rows re-render)
```

---

## AI Transaction Parsing

The **AI tab** allows free-form natural language input:

**Example Input**:
```
"Buy 50 AAPL at market on Jan 15, 2024. Then monthly for 6 months, invest 20% of remaining cash into TSLA."
```

**Processing**:
1. Send to Gemini with context (selected stock, available prices, default date)
2. Gemini returns JSON array of transactions
3. Zod validates against schema
4. Transactions are sorted by date
5. User reviews in ledger (draft, red)
6. User clicks "Submit Pending" to commit all

**System Instruction**:
```
"Extract ALL financial transactions from the user prompt. 
Output a JSON array matching the schema. 
Use uppercase tickers, YYYY-MM-DD dates, decimals for percentages (0.2 = 20%).
Set committed: false, batchId: 'Preview'.
For DBUY/DSELL, choose dates from provided price data if available."
```

---

## Deployment Notes

### Frontend
- Build: `npm run build` → `dist/` folder
- Deploy to Vercel, Netlify, or any static host
- Environment: Requires backend URL in `.env`

### Backend
- Requires PostgreSQL database
- Environment variables:
  - `DATABASE_URL`: PostgreSQL connection string
  - `GOOGLE_AI_STUDIO_API_KEY`: Gemini API key
  - `STOCK_API_KEY`: External stock data provider (Alpha Vantage, etc.)
  - `PORT`: Server port (default 3002)
- Deploy to Heroku, AWS, Digital Ocean, etc.

---

## Future Optimization Ideas

1. **Server-Side Caching**: Cache `getStockHistory()` results with Redis
2. **Batch Validation**: Validate multiple transactions server-side for consistency
3. **Incremental Ledger**: Instead of recalculating entire ledger, compute delta from last committed transaction
4. **WebSocket Updates**: Real-time price updates as stock data changes
5. **Code Splitting**: Use dynamic imports for Results and AI tabs to reduce initial bundle
6. **Prefetch Prices**: Pre-fetch price data for future repeat occurrences

---

## Summary

This architecture prioritizes **user experience** and **performance**:

- **Memoization** at every level (selectors, callbacks, computations)
- **Virtualization** for large lists
- **Separation of concerns** (form state, portfolio state, UI state)
- **Validation** at the schema level (Zod)
- **AI integration** for natural language transaction entry
- **Price accuracy** with date-aware lookups

The result is a responsive, snappy app that handles hundreds of transactions without lag.
