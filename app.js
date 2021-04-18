const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); // middleware function
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const postRouter = require('./routes/postRoutes');
const followerRouter = require('./routes/followerRoutes');

const app = express();

// MIDDLEWARES
app.use(
  cors({
    origin: [
      'http://192.168.0.30:8080',
      'https://192.168.0.30:8080',
      'http://192.168.0.13:8080',
      'https://192.168.0.13:8080',
      'http://127.0.0.1:8887',
      'https://manmetquickchat.herokuapp.com',
    ],
    credentials: true,
    exposedHeaders: ['set-cookie'],
  })
);

app.options(
  [
    'https://192.168.0.30:8080',
    'https://192.168.0.13:8080',
    'http://127.0.0.1:8887',
    'https://manmetquickchat.herokuapp.com',
  ],
  cors()
);

// morgan gives information about the HTTP requests in the console/terminal
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log('Cookies:');
  // console.log(req.cookies);
  next();
});

// ROUTE HANDLERS

// ROUTES
app.use('/api/v1/followers', followerRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/posts', postRouter);

// catch all invalid routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
