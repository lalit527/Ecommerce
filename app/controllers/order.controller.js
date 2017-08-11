var mongoose = require('mongoose');
var express = require('express');

var mainRouter = express.Router();
var allProduct = mongoose.model('Product');
var allCart    = mongoose.model('Cart');
var allOrder   = mongoose.model('Order');
var responseGenerator = require('./../../library/responseGenerator');
var auth = require("./../../middlewares/auth");

module.exports.controllerFunction = function(app){

   
    mainRouter.get('/all', function(req, res){
        allProduct.find(function(err, result){
          if(err){
            console.log('An error occured while retrieving all blogs. Error:-'+err);
            res.send(err);
          }else{
            res.render('mainPage',{product:result});
          }
       });
    });


    mainRouter.get('/details/:id', function(req, res){
       allProduct.findOne({'_id':req.params.id}, function(err, foundProduct){
          //console.log(req.params.id);
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
                  res.render('productView',{product:foundProduct});
            }

       });
    });

    mainRouter.post('/add/cart/:id', auth.checkLogin, function(req, res){
        var userDetail = {id   : req.session.user._id,
                          name : req.session.user.userName
                          };
        var itemDetail;

        /*allCart.find({'items.id': req.params.id}, function(err, result){
          if(err){
             var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
             res.send(myResponse);
          }else if(result == null || result == undefined || result == []){
             var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
             res.send(myResponse);
          }else{
            res.send('Item'+result);
          }
        });*/
        allProduct.findOne({'_id':req.params.id}, function(err, foundProduct){
            console.log(req.params.id);
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

              }else if(foundProduct.status != 'available'){
                 var myResponse = responseGenerator.generate(true,"product out of stock",404,null);
                  //res.send(myResponse);
                  res.render('error', {
                    message: myResponse.message,
                    error: myResponse.data
                  });
              }
              else{
                    var newCartItem = new allCart({
                      user : userDetail,
                      items : foundProduct
                    });
                    newCartItem.save(function(err){
                       if(err){

                               var myResponse = responseGenerator.generate(true,err,500,null);
                               res.send(myResponse);
                              

                            }
                            else{
                                res.redirect('/main/cart/all');
                               
                            }

                      });
              }
        });                  
        
    });

     mainRouter.get('/cart/all', auth.checkLogin, function(req, res){
        allCart.find({$and:[{'user.id':req.session.user._id},{'items': {$exists : true}}]},  function(err, result){
          if(err){
            console.log('An error occured while retrieving all blogs. Error:-'+err);
            res.send(err);
          }else{
            //console.log(result);
            var arr = Object.keys(result);
            res.render('cartView',{product:result});
          }
       });
    });
  
   mainRouter.post('/cart/delete/:id', auth.checkLogin, function(req, res){
      allCart.remove({'_id':req.params.id}, function(err, result){
          if(err){
            console.log('An error occured while deleting product.'+req.params.productId+' Error:-'+err);
            res.send(err);
          }else{

            res.redirect('/main/cart/all');
          }
      });
   });
   
   mainRouter.post('/order/add', auth.checkLogin,function(req, res){
      allCart.find({$and:[{'user.id':req.session.user._id},{'items': {$exists : true}}]}, function(err, foundOrder){
         if(err){
            console.log('An error occured while retrieving all blogs. Error:-'+err);
            res.send(err);
          }else if(foundOrder == null || foundOrder.length <= 0){
            res.send('add items to the cart');
          }else{
            var userDetail = {id   : req.session.user._id,
                              name : req.session.user.userName
                             };
            var date = new Date();
            var item= [];
            var itemId = [];
            var sum = 0;
            for(var x=0; x<foundOrder.length; x++){
                sum += foundOrder[x].items.sellingPrice;
                var productDetail = {
                    'id'          : foundOrder[x].items._id,
                    'productName' : foundOrder[x].items.productName,
                    'model'       : foundOrder[x].items.model,
                    'brand'       : foundOrder[x].items.brand,
                    'sellingPrice': foundOrder[x].items.sellingPrice,
                    'productStatus' : 'Ordered'
                };
                item.push(productDetail);
                itemId.push(foundOrder[x].items._id);
            }
            var orderItems = new allOrder({
                user: userDetail,
                items: item,
                status : 'Ordered',
                purchasedOn : date,
                Quantity    : '',
                deliveryAddress : '',
                paymentMode : 'Cash On Delivery',
                price : sum
            });
            orderItems.save(function(err){
              if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
              }else{
                 allCart.remove({$and:[{'user.id':req.session.user._id},{'items': {$exists : true}}]}, function(err, foundOrder){
                        if(err){
                          var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                          res.send(myResponse);
                        }else{
                            allProduct.update({'_id': {$in: itemId}}, {'status': 'sold'}, {multi: true}, function(err, result){  
                                if(err){
                                   var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                                   res.send(myResponse);
                                }else{
                                  res.redirect('/main/order/all');
                                }
                            });
                             
                        }
                 });
                
              }
            });
            
          }
      });
   });

   mainRouter.get('/order/all', auth.checkLogin, function(req, res){
      allOrder.find({'user.id':req.session.user._id}, null, {sort: {purchasedOn: -1}}, function(err, foundOrder){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundOrder==null || foundOrder==undefined){
                console.log(foundOrder);
                var myResponse = responseGenerator.generate(true,"product not found",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{
                  res.render('orderView',{order:foundOrder});
            }
      });
   });

   mainRouter.post('/cart/cancel/item/:itemId/order/:orderId', auth.checkLogin, function(req, res){

       allOrder.findOneAndUpdate({$and:[{'user.id':req.session.user._id},{'_id': req.params.orderId}, {"items.id": req.params.itemId} ]}, {'$set': {
                                  'items.$.productStatus': 'Cancelled'
                              }}, function(err, response){
                                console.log(req.params.itemId);
           if(err){
            console.log('An error occured while retrieving editing blog.'+req.params.blogId+' Error:-'+err);
            res.send(err);
           }else{
            console.log('res'+response);
            res.send(response);
            //res.redirect('/main/order/all');
           }
       });

   });

   mainRouter.post('/cart/cancel/order/:orderId', auth.checkLogin, function(req, res){

       allOrder.findOneAndUpdate({$and:[{'user.id':req.session.user._id},{'_id': req.params.orderId}]}, {'$set': {'status': 'Cancelled'}}, function(err, response){
           if(err){
            console.log('An error occured while retrieving editing blog.'+req.params.blogId+' Error:-'+err);
            res.send(err);
           }else{
            console.log('res'+response);
            var itemId = [];
            for(var i=0; i< response.items.length; i++){
                itemId.push(response.items[i].id);
            }
            allProduct.update({'_id': {$in: itemId}}, {'status': 'available'}, {multi: true}, function(err, result){  
                if(err){
                   var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   res.send(myResponse);
                }else{
                  res.redirect('/main/order/all');
                }
            });
            //res.send(response.items);
            //res.redirect('/main/order/all');
           }
       });
   });

	 app.use('/main', mainRouter);
}