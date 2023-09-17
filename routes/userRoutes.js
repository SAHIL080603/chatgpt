const express=require('express');
const router=express.Router();
const User=require('../models/User');
const { isLoggedIn } = require('../middleware');

router.get('/',isLoggedIn,async(req,res)=>{
    const users=await User.find({});
    // console.log(users);
    res.render('users/index',{users});
})



module.exports=router;