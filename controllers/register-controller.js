var express=require("express");
var connection = require('./../config');
 
module.exports.register=function(req,res){
    // var today = new Date();
    var EMail = req.body.email;
    var user={
        "Name":req.body.name,
        "Password":req.body.password,
        "E-Mail":req.body.email,
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
        res.send('<h1>Registration successful !<br>Click <a href="/login">here</a> to login.');
      });            
        }
    });
    }
    });
}