const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const config = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth.routes');
const roomsRoutes = require('./routes/rooms.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const paymentsRoutes = require('./routes/payments.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const managerRoutes = require('./routes/manager.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ─── Security Middleware ─────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ───────────────────────────────────────────
app.use('/api/', apiLimiter);

// ─── Static Files ────────────────────────────────────────────
app.use('/images', express.static('public/images'));

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'YASHIII RESORT API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
const PORT = config.PORT;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🏨 YASHIII RESORT API Server`);
    console.log(`   Environment: ${config.NODE_ENV}`);
    console.log(`   Port: ${PORT}`);
    console.log(`   URL: http://localhost:${PORT}`);
    console.log(`   Client: ${config.CLIENT_URL}\n`);
  });
};

startServer();

module.exports = app;
