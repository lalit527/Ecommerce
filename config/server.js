var express = require('express');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;



passport.use(new Strategy({
	clientID: '',
	clientSecret: '',
	callbackURL: ''
},
    function(accessToken, refreshToken, profile, cb){

    	return cb(null, profile);

    }
));

passport.serializeUser(function(user, cb){
	console.log(user);
	cb(null, user);
});

passport.deserializeUser(function(obj, cb){
	cb(null, obj);
})