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
// const data = require('./heart_final.json');

var _ = require('lodash');

const network = new brain.NeuralNetwork({
	hiddenLayers:[3]
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
	var output = network.run([req.body.age,req.body.sex,req.body.cp,req.body.trestbps,req.body.chol,
	req.body.fbs,req.body.restecg,req.body.thalach,req.body.exang,req.body.slope,req.body.oldpeak,req.body.ca,req.body.thal]);
	
	output *= 100;
	output = output.toFixed(2);

	var s = "No disease presence predicted!";
	if(output>=50) 
		s = "Disease presence is predicted. You are advised to meet your doctor as soon as possible!"
	
	console.log(s);
	// console.log(req,session.name);

res.render('results',{resultdata:output, ans: s});
})

app.get('/home', function (req, res) {  
	if(req.session.loggedin) 
		res.render('index', {name:req.session.name, username:req.session.username});
	else
		res.send("<h1>Please <a href=\"/login\">login</a> to view this page</h1>");
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
