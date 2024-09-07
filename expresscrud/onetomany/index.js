// index.js
const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./routers/index.router');
const port = process.env.PORT || 5000;
console.log(port);

app.use('/', router);

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});
