var mongoose = require('mongoose');
var express = require('express');

var supplierRouter = express.Router();
var supplierModel = mongoose.model('Supplier');
var responseGenerator = require('./../../library/responseGenerator');
var auth = require("./../../middlewares/auth");
var nodemailer = require("nodemailer");
var mailer = require('express-mailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
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

   supplierRouter.get('/login/screen',function(req,res){
            
        res.render('supplierlogin');

    });//end get login screen

    supplierRouter.get('/forgotpassword/screen',function(req,res){
            
        res.render('supplierforgotPassword');

    });

     supplierRouter.get('/signup/screen',function(req,res){
            
        res.render('suppliersignup');

    });//end get signup screen

    supplierRouter.get('/dashboard', auth.checkSupplierLogin, function(req,res){
        
            res.render('supplierdashboard',{supplier:req.session.supplier});
       

    });//end get dashboard

    supplierRouter.get('/logout',function(req,res){
      
      req.session.destroy(function(err) {

        res.redirect('/supplier/login/screen');

      })  

    });//end logout
   
    
   supplierRouter.post('/newpassword',function(req,res){
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
        
        
        
        supplierModel.findOneAndUpdate({'email': req.body.email}, {'forgotPass': rString}, function(err, response){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else{
                var mailOptions = {
                  from: 'ensemble@no-reply.com',
                  to: req.body.email,
                  subject: 'Sending Email using Node.js',
                  text: '<h2>Follow this link to reset your password.</h2><a href="http://localhost:3000/supplier/generateNewPassword/screen/'+rString+'/user/'+req.body.email+'">Click Here</a>'
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

   supplierRouter.post('/updatepassword/:id/:userEmail', function(req, res){
       supplierModel.findOneAndUpdate({$and:[{'email': req.params.userEmail}, {'forgotPass': req.params.id}]}, {'password': req.body.password}, function(err, response){
        if(err){
            console.log('An error occured while retrieving all blogs. Error:-'+err);
            res.send(err);
          }else{
            
            res.send('success');
          }
       });
   });

   supplierRouter.get('/generateNewPassword/screen/:id/user/:userId',function(req,res){
       var user = {
           'key': req.params.id,
           'email': req.params.userId 
       };
       res.render('supplierpassReset', {user: user});

   });

  

	supplierRouter.post('/signup', function(req, res){
           if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var newUser = new supplierModel({
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
                    req.session.supplier = newUser;
                    delete req.session.supplier.password;
                    res.redirect('/supplier/dashboard');
                   
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


	 supplierRouter.post('/login',function(req,res){

        supplierModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
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
                req.session.supplier = foundUser;
                delete req.session.supplier.password;
                res.redirect('/supplier/dashboard')  

            }

        });// end find


    });// end login api


	 app.use('/supplier', supplierRouter);
}
