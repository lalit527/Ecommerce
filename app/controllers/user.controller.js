var mongoose = require('mongoose');
var express = require('express');

var userRouter = express.Router();
var userModel = mongoose.model('User');
var responseGenerator = require('./../../library/responseGenerator');
var auth = require("./../../middlewares/auth");
var nodemailer = require("nodemailer");
var mailer = require('express-mailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'testnode527@gmail.com',
    pass: 'gmail98765'
  }
});

var randomString = function(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) 
                result += chars[Math.floor(Math.random() * chars.length)];
            return result;
}
var rString = randomString(12, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

module.exports.controllerFunction = function(app){

   userRouter.get('/login/screen',function(req,res){
            
        res.render('login');

    });//end get login screen

    userRouter.get('/forgotpassword/screen',function(req,res){
            
        res.render('forgotPassword');

    });

     userRouter.get('/signup/screen',function(req,res){
            
        res.render('signup');

    });//end get signup screen

    userRouter.get('/dashboard',auth.checkLogin,function(req,res){
        
            res.render('dashboard',{user:req.session.user});
       

    });//end get dashboard

    userRouter.get('/logout',function(req,res){
      
      req.session.destroy(function(err) {

        res.redirect('/user/login/screen');

      })  

    });//end logout
   
    
   userRouter.post('/newpassword',function(req,res){
      /*if(req.body.email == "") {
          res.send("Error: Email & Subject should not blank");
          return false;
        }
        // Sending Email Without SMTP
        nodemailer.mail({
            from: "<no-reply@lalit.in>", // sender address
            to: req.body.email, // list of receivers
            subject: "Ensemble Password", // Subject line
            //text: "Hello world ✔", // plaintext body
            html: "<b>forgot password</b>" // html body
        });
        res.send("Email has been sent successfully"); */
        
        
        
        userModel.findOneAndUpdate({'email': req.body.email}, {'forgotPass': rString}, function(err, response){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else{
                var mailOptions = {
                  from: 'ensemble@no-reply.com',
                  to: req.body.email,
                  subject: 'Sending Email using Node.js',
                  text: '<h2>Follow this link to reset your password.</h2><a href="http://localhost:3000/user/generateNewPassword/screen/'+rString+'/user/'+req.body.email+'">Click Here</a>'
                };

                transporter.sendMail(mailOptions, function(error, info){
                  if (error) {
                    console.log(error);
                    res.send(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                    res.send('Email sent: ' + info.response);
                  }
                }); 
                }

        });

        
              
   });
   userRouter.post('/updatepassword/:id/:userEmail', function(req, res){
       userModel.findOneAndUpdate({$and:[{'email': req.params.userEmail}, {'forgotPass': req.params.id}]}, {'password': req.body.password}, function(err, response){
        if(err){
            console.log('An error occured while retrieving all blogs. Error:-'+err);
            res.send(err);
          }else{
            
            res.send('success');
          }
       });
   });

   userRouter.get('/generateNewPassword/screen/:id/user/:userId',function(req,res){
       var user = {
           'key': req.params.id,
           'email': req.params.userId 
       };
       res.render('passReset', {user: user});

   });

   userRouter.get('/:userName/info',function(req,res){

        userModel.findOne({'userName':req.params.userName},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                  res.render('dashboard', { user:foundUser  });

            }

        });// end find
      

    });//end get all users

	userRouter.post('/signup', function(req, res){
           if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var newUser = new userModel({
                userName            : req.body.firstName+''+req.body.lastName,
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email,
                mobileNumber        : req.body.mobileNumber,
                password            : req.body.password


            });// end new user 

            newUser.save(function(err){
                if(err){

                    var myResponse = responseGenerator.generate(true,err,500,null);
                   res.send(myResponse);
                  

                }
                else{
                    req.session.user = newUser;
                    delete req.session.user.password;
                    res.redirect('/user/dashboard');
                   
                }

            });//end new user save


        }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

            res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
            });

            

        }
	});


	 userRouter.post('/login',function(req,res){

        userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

                var myResponse = responseGenerator.generate(true,"user not found. Check your email and password",404,null);
                res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                var myResponse = responseGenerator.generate(false,"successfully logged in user",200,foundUser);
                //res.send(myResponse);
                req.session.user = foundUser;
                delete req.session.user.password;
                res.redirect('/user/dashboard')  

            }

        });// end find


    });// end login api


	 app.use('/user', userRouter);
}