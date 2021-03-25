const dotenv = require('dotenv');
const express = require('express');

dotenv.config({ path: './config.env' });

console.log(process.env);

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Hello World!');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port: http://127.0.0.1:${port}/`);
});
