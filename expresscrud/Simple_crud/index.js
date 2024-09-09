require('dotenv').config()

const express = require('express');
const router = require('./route');
const app = express();



// console.log(process.env)

const PORT = process.env.PORT || 8000;
// Use the router for handling POST requests to /user
app.use('/', router);

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Server listening on PORT ${PORT}`);
});
