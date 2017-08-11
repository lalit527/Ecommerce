var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var cartSchema = new Schema({
	user        	    : {},
	items    			: {}

});

mongoose.model('Cart', cartSchema);