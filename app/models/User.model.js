var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	userName 			: {type:String,default:'',required:true},
	firstName  			: {type:String,default:''},
	lastName  			: {type:String,default:''},
	email	  			: {type:String,default:'', unique:true},
	mobileNumber  		: {type:Number,default:''},
	password			: {type:String,default:''},
	forgotPass          : {type:String},
	customer            : {type:String},
	buyer               : {type:String}

});

mongoose.model('User', userSchema);