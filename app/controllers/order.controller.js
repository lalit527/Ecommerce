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
            console.log('An error occured while showing all products. Error:-'+err);
            var myResponse = responseGenerator.generate(true,"some error occured"+err,500,null);
            res.send(myResponse);
          }else{
            res.render('mainPage',{product:result});
          }
       });
    });


    mainRouter.get('/details/:id', function(req, res){
       allProduct.findOne({'_id':req.params.id}, function(err, foundProduct){
          //console.log(req.params.id);
          if(err){
                console.log('An error occured while showing details of a product. Error:-'+err);
                var myResponse = responseGenerator.generate(true,"some error has occured. Try Again"+err,500,null);
                res.send(myResponse);
            }
            else if(foundProduct==null || foundProduct==undefined || foundProduct.productName==undefined){
                console.log(foundProduct);
                console.log('Details for this product is not available.'+req.params.id);
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
            if(err){
                  var myResponse = responseGenerator.generate(true,"some error occured. Try again"+err,500,null);
                  res.send(myResponse);
              }
              else if(foundProduct==null || foundProduct==undefined || foundProduct.productName==undefined){
                  console.log(foundProduct);
                  console.log('Cant be added to cart as Details for this product is not available.'+req.params.id);
                  var myResponse = responseGenerator.generate(true,"product not found",404,null);
                  //res.send(myResponse);
                  res.render('error', {
                    message: myResponse.message,
                    error: myResponse.data
                  });

              }else if(foundProduct.status != 'available'){
                 console.log('Cant be added to cart as product is out of stock.'+req.params.id);
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
                               console.log('Error occured while adding item to the cart. Error:-'+err);
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
            console.log('An error occured while retrieving all items in the card. Error:-'+err);
            var myResponse = responseGenerator.generate(true,'An error occured. Please try again.' ,500,null);
            res.send(myResponse);
          }else{
            res.render('cartView',{product:result});
          }
       });
    });
  
   mainRouter.post('/cart/delete/:id', auth.checkLogin, function(req, res){
      allCart.remove({$and:[{'user.id':req.session.user._id},{'_id':req.params.id}]}, function(err, result){
          if(err){
            console.log('An error occured while deleting product in the cart.'+req.params.productId+' Error:-'+err);
            var myResponse = responseGenerator.generate(true,'An error occured. Please try again.' ,500,null);
            res.send(myResponse);
          }else{

            res.redirect('/main/cart/all');
          }
      });
   });
   
   mainRouter.post('/order/add', auth.checkLogin,function(req, res){
      allCart.find({$and:[{'user.id':req.session.user._id},{'items': {$exists : true}}]}, function(err, foundOrder){
         if(err){
            console.log('An error occured while adding items in the card. Error:-'+err);
            var myResponse = responseGenerator.generate(true,'An error occured. Please try again.' ,500,null);
            res.send(myResponse);
          }else if(foundOrder == null || foundOrder.length <= 0){
            console.log('An error occured while adding items in the card. Error:-'+err);
            var myResponse = responseGenerator.generate(true,'No Item in the cart. Please add item to the Cart.' ,500,null);
            res.send(myResponse);
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
                console.log('some error occured while ordering items from the cart. ERR:-'+err);
                var myResponse = responseGenerator.generate(true,"some error occured"+err,500,null);
                res.send(myResponse);
              }else{
                 allCart.remove({$and:[{'user.id':req.session.user._id},{'items': {$exists : true}}]}, function(err, foundOrder){
                        if(err){
                          console.log('some error occured while removing items from the cart. ERR:-'+err);
                          var myResponse = responseGenerator.generate(true,"some error occured"+err,500,null);
                          res.send(myResponse);
                        }else{
                            allProduct.update({'_id': {$in: itemId}}, {'status': 'sold'}, {multi: true}, function(err, result){  
                                if(err){
                                   console.log('some error occured while changing status of item from available to sold. ERR:-'+err);
                                   var myResponse = responseGenerator.generate(true,"some error occured"+err,500,null);
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
                console.log('some error occured while checking order. ERR:-'+err);
                var myResponse = responseGenerator.generate(true,"some error occured"+err,500,null);
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

   /*mainRouter.post('/cart/cancel/item/:itemId/order/:orderId', auth.checkLogin, function(req, res){

       allOrder.findOneAndUpdate({$and:[{'user.id':req.session.user._id},{'_id': req.params.orderId}, {"items.id": req.params.itemId} ]}, {'$set': {
                                  'items.$.productStatus': 'Cancelled'
                              }}, function(err, response){
                                console.log(req.params.itemId);
           if(err){
             var myResponse = responseGenerator.generate(true,"some error occured while cancelling orders"+err+"Please",500,null);
             res.send(myResponse);
           }else{
            //res.send(response);
            res.redirect('/main/order/all');
           }
       });

   });*/

   mainRouter.post('/cart/cancel/order/:orderId', auth.checkLogin, function(req, res){

       allOrder.findOneAndUpdate({$and:[{'user.id':req.session.user._id},{'_id': req.params.orderId}]}, {'$set': {'status': 'Cancelled'}}, function(err, response){
           if(err){
              console.log('some error occured while cancelling order. ERR:-'+err);
              var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
              res.send(myResponse);
           }else{
            var itemId = [];
            for(var i=0; i< response.items.length; i++){
                itemId.push(response.items[i].id);
            }
            allProduct.update({'_id': {$in: itemId}}, {'status': 'available'}, {multi: true}, function(err, result){  
                if(err){
                   console.log('some error occured while updating status of order after cancelling. ERR:-'+err);
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