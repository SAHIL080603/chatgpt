const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');

const userSchema=new mongoose.Schema({
    // username:{
    //     type:String,
    //     unique:true,
    // },
    // password:String,

    //the above two fileds are automatically added by passport local no need to add yourself
    email:{
        type:String,
        unique:true,
    },
    api:String,
    chats: [
        {
            innerArray:[
                {
                    prompt:String,
                    reply:String,
                }
                
            ]
        }
    ],
})

userSchema.plugin(passportLocalMongoose);

const User=mongoose.model('User',userSchema);

module.exports=User;