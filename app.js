require('dotenv').config(); // this is the npm module to keep our secret words api keys in safe and different envoriment

const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
// const encrypt=require('mongoose-encryption');  // It was level 3 security
// const md5=require('md5'); // to able to hash password with md5 hash method
const bcrypt = require('bcrypt');
const saltRounds = 10;

app=express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({
  extended:true
}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema= new mongoose.Schema({
  email:String,
  password:String
});


//ENCRYPTION PART
// console.log(process.env.API_KEY);
// const secret=process.env.SECRET;
// userSchema.plugin(encrypt,{secret:secret , encryptedFields:["password"]}); //used to encrypt pass

const User=mongoose.model("User",userSchema);




app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",(req,res)=>{
  res.render("login",{error:''});
});

app.get("/register",(req,res)=>{
  res.render("register",{error:""});
});

app.post("/register", (req,res)=>{


    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      const userMail=req.body.usermail;
      const upassword= hash
      const newUser = new User({
        email:userMail,
        password:upassword
      });
      User.findOne({email:userMail},function(err,foundUser){
        if(!err){
          if(foundUser===null){
            newUser.save(function(err){
              if(!err){
                res.redirect("/login");
              }
            });
          }else{
            res.render("register",{error:"The User already exists try to login."});
          }
        }
      });
    });


});

app.post("/login", (req,res)=>{
  const userMail=req.body.usermail;
  const enteredPassword=req.body.password;
  User.findOne({email:userMail},function(err,foundUser){
    if(!err){
      bcrypt.compare(enteredPassword, foundUser.password, function(err, result) { // in order to check hash is matching 
          if(result===true){
            res.render("secrets");
          }else{
            res.render("login",{error:"Incorrect Password!"});
          }
      });
    }
  });
});




app.listen(3000,()=>{
  console.log("Server has started on port 3000");
});
