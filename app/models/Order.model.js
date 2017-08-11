var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
	user        	    : {},
	items    			: [],
	status              : {type:String},
	purchasedOn         : {type: Date},
    Quantity            : {type: Number},
    deliveryAddress     : {},
    paymentMode         : {type: String},
    price               : {}

});

mongoose.model('Order', orderSchema);