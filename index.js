var nodemailer = require('nodemailer');
var express=require("express");
var bodyParser=require('body-parser');
var session = require('express-session');
var Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');

var connection = require('./config');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })


var from = 'heartx2143@gmail.com';            //Your Email ID
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: from,
    pass: 'Qwerty@123' 			//Write your password here
  }
});

const brain = require('brain.js');
var _ = require('lodash');

const network = new brain.NeuralNetwork({
	hiddenLayers:[11],
	// activation:'relu',
	// alpha:0.0001,
	// learning_rate_init:0.001,
	// momentum:0.9
	// activation:'relu', alpha:0.0001, batch_size:'auto', beta_1:0.9,
 //    beta_2:0.999, early_stopping:false, epsilon:1e-08,
 //    learning_rate:'constant',
 //    learning_rate_init:0.001, max_iter:200, momentum:0.9,
 //    n_iter_no_change:10, nesterovs_momentum:true, power_t:0.5,
 //    random_state:1, shuffle:true, solver:'lbfgs', tol:0.0001,
 //    validation_fraction:0.1, verbose:false, warm_start:false
});

var numTrainingData = 245;
var array = require('./arr.js');

const trainingData = array.trainingData;
// console.log(trainingData)
network.train(trainingData);

// console.log(network.run([0.708333333, 1, 1, 0.481132075, 0.244292237, 1, 0, 0.603053435, 0, 0.370967742, 0, 0, 0]))
// console.log(network.run([0.583333333, 1, 0, 0.547169811, 0.337899543, 0, 1, 0.129770992, 1, 0.193548387, 0.5, 0.25, 1]))
// console.log(network.run([0.729166667, 1, 0, 0.481132075, 0.196347032, 0, 0, 0.465648855, 0, 0.322580645, 0.5, 0.5, 0]))

app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));        // Needed to open background images

var registerController=require('./controllers/register-controller');
 
app.set('trust proxy', 1)
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: true
})); 

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.get('/logout', function(req, res, next) {
	req.session.destroy();
	console.log('Logout successful !');
	res.redirect('/');
});

app.get('/predict',function(req,res){
	console.log(req.query);
res.render('index');
});

app.get('/changePass', function(req,res){
	if(req.session.loggedin) {
		console.log(req.session.phone);
		console.log(req.session.email);
		res.render('changePass', {username:req.session.username, phone:req.session.phone, email: req.session.email, name:req.session.name});	
	}
	else
		res.send('Please <a href=\"/login\">login</a> to view this page');
});

app.get('/analysis',function(req,res){
		res.sendFile(__dirname + '/analysis.html');
});

app.get('/forgot-pass', function(req,res){
	res.sendFile(__dirname + '/forgot-pass.html');
});

app.post('/message', urlencodedParser, function(req, res){

	console.log(req.body);
	res.sendFile(__dirname + '/contact.html');
});

app.post('/predict',urlencodedParser,function(req,res){

	console.log(req.body);

	var age = 1.0*(req.body.age-29)/48;
	var sex = 1.0*req.body.sex;
	var cp = 1.0*req.body.cp/3;
	var trestbps= 1.0*(req.body.trestbps-94)/106;
	var chol= 1.0*(req.body.chol-126)/438;
	var fbs= 1.0*req.body.fbs;
	var restecg = 1.0*(req.body.restecg)/2;
	var thalach = 1.0*(req.body.thalach-71)/131;
	var exang =1.0*(req.body.exang);
	var oldpeak =1.0*(req.body.oldpeak)/6.2;
	var slope= 1.0*(req.body.slope)/2;
	var ca=1.0*(req.body.ca)/4;
	var thal= 1.0*(req.body.thal)/3;
	// var target=1.0*(req.body.target);

	var output = network.run([age,sex,cp,trestbps,chol,fbs,restecg,thalach,exang,slope,oldpeak,ca,thal]);
	
	output *= 100;
	output = output.toFixed(2);

	var s = "No disease presence predicted!";
	var p = "No";
	if(output>=50){
		s = "Disease presence is predicted. You are advised to meet your doctor as soon as possible!"
		p = "Yes";		
	} 
	
	console.log(s);
	// console.log(req,session.name);    

	var hist={
		"username":req.session.username,
        "Age":req.body.age,
        "Gender":req.body.sex,
        "Chest_Pain_Type":req.body.cp,
        "Resting_Blood_Pressure":req.body.trestbps,
        "Serum_Cholestrol":req.body.chol,
        "Fasting_Blood_Sugar":req.body.fbs,
        "Resting_ECG":req.body.restecg,
        "Max_Heart_Rate":req.body.thalach,
        "Excercise_Anigma":req.body.exang,
        "ST_Depression":req.body.oldpeak,
        "Slope_ST":req.body.slope,
        "Major_Vessels":req.body.ca,
        "Result":p
    }

     connection.query('INSERT INTO history SET ?',hist, function (error, results, fields) {
      if (error) {
        console.log(error);
        res.json({
            status:false,
            message:'there are some error with query'
        })
      }
      else{
      	console.log(results);
      }
    });


res.render('results',{resultdata:output, ans: s});
})

app.get('/home', function (req, res) {  
	if(req.session.loggedin) 
		res.render('index', {name:req.session.name, username:req.session.username});
	else
		res.send("<h1>Please <a href=\"/login\">login</a> to view this page</h1>");
});  

app.get('/history', function(req,res){

	if(req.session.loggedin) {
		var user = req.session.username;
	
		connection.query('SELECT * FROM users WHERE username = ?',[user], function (erro, resul, fields) {
		if(erro) res.send("Network Error!");
		else{		
		connection.query('SELECT * FROM history WHERE username = ?',[user], function (error, results, fields) {
				
			console.log(results);
			res.render('history', {name:req.session.name, username:req.session.username, result: results});
			});
		}
		});
	}
	else
		res.send('Please <a href=\"/login\">login</a> to view this page');

});


app.get('/login', function(req,res){
	if(req.session.loggedin){
		req.session.destroy();
	}
	res.sendFile(__dirname + '/login.html');
});

app.get('/about', function(req,res){
	res.sendFile(__dirname + '/about.html');
});
app.get('/contact', function(req,res){
	res.sendFile(__dirname + '/contact.html');
});


app.get('/', function(req,res){
	if(req.session.loggedin)
		res.render('index', {name:req.session.name, username:req.session.username});
	res.sendFile(__dirname + '/main.html');
});

app.get('/forgot-pass', function(req,res){
	res.sendFile(__dirname + '/forgot-pass.html');
});

app.post('/forgot', function(req, res) {
	
	var username = req.body.username;
    connection.query('SELECT * FROM users WHERE username = ?',[username], function (error, results, fields) {
	if(results.length > 0){

        var Password = results[0].Password;
        var Email = results[0].EMail;

        var mailOptions = {
		from: from,
		to: Email,
		subject: 'NO REPLY: Forgot Password HeartX',
		text: 'Your password is recovered: ' + Password
		};

		transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email sent !');
		  }
		});
		res.redirect('login');
	}	
	else
		res.send('Wrong Username');
	});
});

app.get('/Sign-Up', function(req,res){
	if(req.session.loggedin)
		req.session.destroy();
	res.sendFile(__dirname + '/signup.html');
});

app.get('/profile', function(req,res){
	if(req.session.loggedin) {
		console.log(req.session.phone);
		console.log(req.session.email);
		res.render('profile', {username:req.session.username, phone:req.session.phone, email: req.session.email, name:req.session.name});	
	}
	else
		res.send('Please <a href=\"/login\">login</a> to view this page');
});

app.post('/controllers/register-controller', registerController.register);

app.post('/auth', function(req, res) {	
	
	if(req.session.loggedin)
		req.session.destroy();
	var username=req.body.username;
    var password=req.body.password;
    console.log(username + " " + password);

    connection.query('SELECT * FROM users WHERE username = ?',[username], function (error, results, fields) {
        if(results.length >0){

        	console.log(results);

            if(password == results[0].Password){
               
               req.session.loggedin = true;
               req.session.username = username;
               req.session.name = results[0].Name;
               req.session.email = results[0].EMail;
               req.session.phone = results[0].Phone;
               
               // module.exports.uname = username;
               console.log(req.session.name);
               res.render('index', {name: req.session.name});
               // res.redirect('/home');
            }
            else
	    		res.send('Username and/or password Incorrect !!!');
        }
       	else
    		res.send('Username or password Incorrect !!!');
 	   });
});

app.listen(3000, '0.0.0.0', function() {
	console.log('Hosting started on localhost:3000');
});
