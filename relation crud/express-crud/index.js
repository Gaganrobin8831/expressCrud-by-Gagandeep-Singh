const express = require('express');
const router = require('./route');
const app = express();
const PORT = 8000;

// Use the router for handling POST requests to /user
app.use('/', router);

app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`Server listening on PORT ${PORT}`);
});
