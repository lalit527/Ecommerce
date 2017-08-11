var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
	productName 	    : {type:String,default:'',required:true},
	category  			: {type:String,default:''},
	subCategory  		: {type:String,default:''},
	description	  		: {type:String,default:''},
	model	  			: {type:String,default:''},
	brand	  			: {type:String,default:''},
	sellingPrice        : {type:Number,default:''},
	seller              : {},
	status              : {type:String,default:'available'}

});

mongoose.model('Product', productSchema);