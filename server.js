const mongoose = require('mongoose');
const dotenv = require('dotenv');

const AppError = require('./utils/appError');

// If there is an uncaughtException, it will throw an error and shut down the server
process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// connect to the database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection established');
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port: http://127.0.0.1:${port}/`);
});

// catch all unhandledRejections and shut down the server
process.on('unhandledRejection', (err) => {
  if (err.name === 'WebPushError') {
    return console.log('The subscriber does not exist anymore!');
  }
  console.log('UNHANDLED REJECTTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
