require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipes');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiters');

const isProduction = process.env.NODE_ENV === 'production';
const app = express();

// Behind a reverse proxy (Render, Railway, Nginx, etc.) in production, so rate
// limiting and logging see the real client IP rather than the proxy's.
if (isProduction) app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(morgan(isProduction ? 'combined' : 'dev'));

// CLIENT_URL may be a single origin or a comma-separated list (e.g. staging + prod).
const allowedOrigins = (process.env.CLIENT_URL || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize()); // strips keys starting with `$` or containing `.` from req.body/query/params

// Images need to load cross-origin when the frontend is hosted on a different
// domain from the API, so relax helmet's default same-origin resource policy here.
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'), { maxAge: '7d' })
);

app.use('/api', apiLimiter);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/recipes', recipeRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Not found.' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.set('strictQuery', true);

let server;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server = app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Graceful shutdown: stop accepting new connections, close the DB connection,
// then exit — important for zero-downtime deploys and container orchestration.
function shutdown(signal) {
  console.log(`\n${signal} received, shutting down gracefully...`);
  if (!server) return process.exit(0);
  server.close(async () => {
    await mongoose.connection.close();
    console.log('Closed HTTP server and MongoDB connection.');
    process.exit(0);
  });
  // Force-exit if graceful shutdown hangs.
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
