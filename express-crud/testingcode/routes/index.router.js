// index.router.js
const express = require('express');
const router = express.Router();
const { HandleGet ,HandlePost } = require('../controllers/function.controller'); 

router.route('/')
    .get(HandleGet)
    
    router.route('/create').post(HandlePost)
   

    
module.exports = router;
