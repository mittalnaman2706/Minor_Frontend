var nodemailer = require('nodemailer');
var express=require("express");
var connection = require('./../config');
var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');

var from = 'heartx2143@gmail.com';            //Your Email ID
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: from,
    pass: 'Qwerty@123'          //Write your password here
  }
});

module.exports.register=function(req,res){
    // var today = new Date();
    var EMail = req.body.email;
    // var encryptedString = cryptr.encrypt(req.body.password);
    var user={
        "Name":req.body.name,
        "Password":req.body.password,
        "EMail":req.body.email,
        "Phone":req.body.phone,
        "UserName":req.body.username,
    }
    var uname = req.body.username;
    connection.query('SELECT * FROM users WHERE Username = ?',[req.body.username], function (error, results, fields) {
        if(results.length > 0){
            res.send('<h1>Username "'+uname+'" not available !<br>Click <a href="/Sign-Up">here</a> to register again.');
        }
    else{

    connection.query('INSERT INTO users SET ?',user, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.json({
            status:false,
            message:'there are some error with query'
        })
      }else{

        connection.query('SELECT * FROM users WHERE username = ?',[req.body.Username], function (error, results, fields) {
        
            var mailOptions = {
            from: from,
            to: EMail,
            subject: 'Congrats! Registration successfull!',
            html: '<h1>Welcome ' + req.body.name + ', to HeartX'
            };

            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } 
              else {
                console.log('Email sent !');
              }
            });
            res.send('<h1>Registration successful !<br>Click <a href="/login">here</a> to login.');

      });            
     }
    });
    }
    });
}