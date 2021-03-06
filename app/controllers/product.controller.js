var mongoose = require('mongoose');
var express = require('express');

var productRouter = express.Router();
var userProduct = mongoose.model('Product');
var responseGenerator = require('./../../library/responseGenerator');
var auth = require("./../../middlewares/auth");

module.exports.controllerFunction = function(app){

   productRouter.get('/create/screen', auth.checkSupplierLogin, function(req,res){
            
        res.render('createProduct');

    });//end get login screen

    /*productRouter.get('/products/update/:productId',function(req,res){
        userProduct.findOne({'_id':req.params.productId},function(err,foundProduct){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundProduct==null || foundProduct==undefined || foundProduct.productName==undefined){
                console.log(foundProduct);
                var myResponse = responseGenerator.generate(true,"product not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{
                  res.render('updateProduct',{product:foundProduct});
            }

        });

    });//end get login screen
*/
    productRouter.post('/products/update/:productId', auth.checkSupplierLogin, function(req,res){
        var update = req.body;
        userProduct.findOneAndUpdate({'_id':req.params.productId},update,function(err,foundProduct){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundProduct==null || foundProduct==undefined || foundProduct.productName==undefined){
                console.log(foundProduct);
                var myResponse = responseGenerator.generate(true,"product not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{
                  res.redirect('/product/products/'+req.params.productId);
            }

        });

    });//end get login screen

   
   productRouter.post('/products/delete/:productId', auth.checkSupplierLogin, function(req,res){

        userProduct.remove({'_id': req.params.productId}, function(err, result){
              if(err){
                console.log('An error occured while deleting product.'+req.params.productId+' Error:-'+err);
                res.send(err);
              }else{

                res.redirect('/product/products');
              }
        });

    });//end get all users


   productRouter.get('/products/:productId', auth.checkSupplierLogin, function(req,res){

        userProduct.findOne({'_id':req.params.productId},function(err,foundProduct){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundProduct==null || foundProduct==undefined || foundProduct.productName==undefined){
                console.log(foundProduct);
                var myResponse = responseGenerator.generate(true,"product not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{
                  res.render('productDetail',{product:foundProduct});
            }

        });// end find
      

    });//end get all users

    productRouter.get('/products', auth.checkSupplierLogin, function(req, res){
        userProduct.find({'seller.email':req.session.supplier.email}, function(err, result){
          if(err){
            console.log('An error occured while retrieving all blogs. Error:-'+err);
            res.send(err);
          }else{
            res.render('product',{product:result});
          }
       });
    });

    


    productRouter.post('/add', auth.checkSupplierLogin, function(req, res){
           if(true){
            var data = {
              'email':  req.session.supplier.email,
              'id'   :  req.session.supplier._id
            };
            var newProduct = new userProduct({
                productName        : req.body.productName,
                category           : req.body.category,
                subCategory        : req.body.subCategory,
                description        : req.body.description,
                model              : req.body.model,
                brand              : req.body.brand,
                sellingPrice       : req.body.sellingPrice,
                seller             : data,
                status             : 'available'
            });// end new user 

            newProduct.save(function(err){
                if(err){

                   var myResponse = responseGenerator.generate(true,err,500,null);
                   res.send(myResponse);
                  

                }
                else{
                    res.redirect('/product/products');
                   
                }

            });//end new user save


        }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 404,
                data: null
            };

            res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
            });

            

        }
    });


	 app.use('/product', productRouter);
}