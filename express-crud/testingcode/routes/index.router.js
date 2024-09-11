const express = require('express');
const router = express.Router();
const { HandleGet, HandlePost,HandlePut } = require('../controllers/function.controller');

// Handle GET request
router.route('/get').get(HandleGet);

// Handle POST request for creating new data
router.route('/create').post(HandlePost);


module.exports = router;
