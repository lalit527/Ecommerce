var mongoose = require('mongoose');
var userModel = mongoose.model('User');
var supplierModel = mongoose.model('Supplier');
var userProduct = mongoose.model('Product');
var responseGenerator = require('./../library/responseGenerator');

exports.setLoogedInUser = function(req, res, next){
    if(req.session && req.session.user){
       userModel.findOne({'email': req.session.user.email}, function(err, user){
            if(user){
				req.user = user;
				delete req.user.password; 
				req.session.user = user;
				next()
			}
			else{
				// do nothing , because this is just to set the values
			}
       });
    }else{
    	next();
    }
}

exports.setLoogedInSupplier = function(req, res, next){
    if(req.session && req.session.supplier){
       supplierModel.findOne({'email': req.session.user.email}, function(err, supplier){
            if(supplier){
				req.supplier = supplier;
				delete req.supplier.password; 
				req.session.supplier = supplier;
				next()
			}
			else{
				// do nothing , because this is just to set the values
			}
       });
    }else{
    	next();
    }
}

exports.checkLogin = function(req,res,next){

	if(!req.user && !req.session.user){
		res.redirect('/user/login/screen');
	}
	else{

		next();
	}

}// end checkLogin

exports.checkSupplierLogin = function(req,res,next){

	if(!req.supplier && !req.session.supplier){
		res.redirect('/supplier/login/screen');
	}
	else{

		next();
	}

}// end checkLogin


exports.validUser = function(req,res,next){

	   userModel.findOne({'email': req.body.email}, function(err, user){
	        if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }else if(user){
				
				next()
			}
			else{
				var myResponse = responseGenerator.generate(true,"user not found"+err,404,null);
                res.send(myResponse);
			}
	   });

}// end checkLogin


exports.validSupplier = function(req,res,next){

	   supplierModel.findOne({'email': req.body.email}, function(err, user){
	        if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }else if(user){
				
				next()
			}
			else{
				var myResponse = responseGenerator.generate(true,"user not found"+err,404,null);
                res.send(myResponse);
			}
	   });

}// end checkLogin


exports.validProductStatus = function(req,res,next){

	 
	userProduct.findOne({$and: [{'_id':req.params.productId}, {'seller.email':req.session.supplier.email}]},function(err,foundProduct){
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
	                console.log(foundProduct);
	                var myResponse = responseGenerator.generate(true,"product cannot be updated now",404,null);
	                //res.send(myResponse);
	                res.render('error', {
	                  message: myResponse.message,
	                  error: myResponse.data
	                });

	            }
	            else{
	                  next();
	            }

	        });
}