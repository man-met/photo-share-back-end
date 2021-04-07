const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // middleware function
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');

const app = express();

// MIDDLEWARES
app.use(
  cors({
    origin: ['http://192.168.0.30:8080', 'https://192.168.0.30:8080'],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);

app.options('https://192.168.0.30:8080', cors());

// morgan gives information about the HTTP requests in the console/terminal
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  console.log('Cookies:');
  console.log(req.cookies);
  next();
});

// ROUTE HANDLERS

// ROUTES
app.use('/api/v1/users', userRouter);

// catch all invalid routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
