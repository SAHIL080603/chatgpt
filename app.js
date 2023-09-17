if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const express=require('express');
const app=express();
const path=require('path');
const ejsMate=require('ejs-mate');
const mongoose=require('mongoose');
const User=require('./models/User');
const methodOverride=require('method-override');
const session=require('express-session');
const flash = require('connect-flash');
const passport=require('passport');
const LocalStrategy=require('passport-local');
const MongoStore = require('connect-mongo');
const { isLoggedIn } = require('./middleware');

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/chatgpt';
const port = process.env.PORT || 4000;


//Routes
const userRoutes=require('./routes/userRoutes.js');

mongoose.connect(dbUrl)
    .then(console.log('Database Conneted!!'))
    .catch((err)=>{console.log(err)})



app.set('view engine','ejs'); //we need to install ejs-mate to add some more features to ejs
app.set('views',path.join(__dirname,'views'));
app.engine('ejs',ejsMate);
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const secret= process.env.SECRET || 'weneedsomebettersecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 60 * 60 * 24 * 1
  })

  const sessionConfig={
    store,
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        // secure:true;
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7,
    }
}

app.use(session(sessionConfig));
app.use(passport.authenticate('session'));
app.use(flash());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

// let currentUser=null;

app.get('/',isLoggedIn,async(req,res)=>{
    const currentUser=req.user;
    res.render(`users/index`,{currentUser});
})

app.get('/chats',isLoggedIn,async(req,res)=>{
    const currentUser=req.user;
    const {q}=req.query;
    try{
        let innerArray = currentUser.chats.filter((data)=>data._id.equals(q))[0].innerArray;
        // console.log(innerArray);
        res.json({innerArray});
    }catch(e){
        req.flash('error',"The chat doesn't exist anymore");
        res.redirect('/');
    }
    
})

app.get('/login',(req,res)=>{
    const currentUser =req.user;
    res.render('users/login',{currentUser});
})

app.post('/login',
    passport.authenticate('local', 
    { 
        failureRedirect: '/login', 
        failureMessage: true, 
        failureFlash:true,
    }),
    async function(req, res) {
        // console.log(req.body);
        req.flash('success',`Welcome back again ${req.user.username}`)
        // res.send('hi');
        res.redirect(`/`);
});

app.get('/signup',(req,res)=>{
    const currentUser =req.user;
    res.render('users/signup',{currentUser})
})

app.post('/signup',async(req,res)=>{
    try{
        const {username,password,api}=req.body;
        console.log(req.body);
        // let{telephone,phone,mobile}=req.body;
        // mobile=`+${phone} ${mobile}`;
        // console.log(`${email} ${password} ${firstname} ${lastname} ${telephone} ${about} ${company} ${job}`);
        const user=new User({username,email:username,api});
        // console.log(user);
        await User.register(user,password);
        req.flash('success','Registered Successfully');
        res.redirect('/');
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/signup');
    }
    
})

app.get('/logout',isLoggedIn, (req, res) => {
    req.logout((err)=> {
        if (err) { return next(err); }
        req.flash('success', 'GoodBye!');
        res.redirect('/login');
      });
})

app.get('/add',isLoggedIn,async(req,res)=>{
    let {prompt,reply,id}=req.query;
    const currentUser =await User.findById(req.user._id);
    
    if(id!=''){
        const innerArray = currentUser.chats.filter((data)=>data._id.equals(id))[0].innerArray;
        const obj={
            prompt:prompt,
            reply:reply,
        }
        innerArray.push(obj);
        
        // console.log(innerArray);
    }else{
        currentUser.chats.unshift(
        {
            innerArray:[
                {
                    prompt:prompt,
                    reply:reply,
                }
            ]
        }
        )
        id=currentUser.chats[0]._id;
        // console.log(currentUser.chats[0]._id);
    }
    // console.log(prompt);
    await currentUser.save();

    // console.log(currentUser.chats);
    res.json({id})
})

app.get('/remove',isLoggedIn,async(req,res)=>{
    
    const currentUser =await User.findById(req.user._id);
    const {q}=req.query;
    let chat = currentUser.chats.filter((data)=>data._id.equals(q))[0];
    let index = currentUser.chats.indexOf(chat)
    currentUser.chats.splice(index,1);
    // console.log(chats);
    currentUser.save();
    // console.log(currentUser.chats);
    res.redirect('/');
})

app.post('/updateapi',isLoggedIn,async(req,res)=>{
    const {api}=req.body;
    const currentUser=await User.findById(req.user._id);
    currentUser.api=api;
    await currentUser.save();
    req.flash('success','API updated successfully')
    res.redirect('/');
})

app.get('/getapi',isLoggedIn,async (req,res)=>{
    const currentUser=await User.findById(req.user._id);
    // api=currentUser.api;
    // console.log(currentUser.api)
    res.json({api:currentUser.api});
})

app.listen(port,()=>{
    console.log('Server started listening at port 4000');
})