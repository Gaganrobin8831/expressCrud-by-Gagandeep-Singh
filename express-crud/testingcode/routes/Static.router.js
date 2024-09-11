const express = require('express');
const router = express.Router();
const {HandleupdateGet,HandlePut,HandleDelete} = require('../controllers/function.controller')

router.get("/form",(req,res)=>{
    return res.render('Create')
})

router.get('/edit/:id',HandleupdateGet);

//Handle PUT METHOD

router.route('/update/').post(HandlePut);

//Handle Delete Method
router.route('/del/:id').get(HandleDelete)

module.exports = router;
