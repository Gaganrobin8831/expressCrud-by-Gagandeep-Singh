// index.router.js
const express = require('express');
const router = express.Router();
const { HandleGet, HandleCreate,HandlePut ,DeleteUser} = require('../routes/user.routes');  // Ensure path is correct

router.route('/')
    .get(HandleGet)
    .post(HandleCreate);

    router.route('/user/:id')
    .put(HandlePut)
    .delete(DeleteUser);

    
module.exports = router;
