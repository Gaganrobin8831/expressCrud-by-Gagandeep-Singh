// index.router.js
const express = require('express');
const router = express.Router();
const { HandleGet, HandleCreate,HandlePut ,DeleteUser,HandleGetBYId} = require('../routes/user.routes'); 

router.route('/')
    .get(HandleGet)
    .post(HandleCreate);

    router.route('/user')
    .get(HandleGetBYId)
    .put(HandlePut)
    .delete(DeleteUser);

    
module.exports = router;
