const express = require('express');
const router = express.Router();
const {HandleupdateGet} = require('../controllers/function.controller')

router.get("/form",(req,res)=>{
    return res.render('Create')
})

router.get('/edit/:id',HandleupdateGet);

module.exports = router;
