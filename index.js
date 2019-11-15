var express=require("express");
var bodyParser=require('body-parser');
var session = require('express-session');

var connection = require('./config');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

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
})

app.post('/predict',urlencodedParser,function(req,res){
	console.log(req.body);
	var output = network.run([req.body.age,req.body.sex,req.body.cp,req.body.trestbps,req.body.chol,
	req.body.fbs,req.body.restecg,req.body.thalach,req.body.exang,req.body.slope,req.body.oldpeak,req.body.ca,req.body.thal]);
	
	console.log(output);

res.render('results',{resultdata:output});
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

app.get('/Sign-Up', function(req,res){
	if(req.session.loggedin)
		req.session.destroy();
	res.sendFile(__dirname + '/signup.html');
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
        	// console.log(results);
            if(password == results[0].Password){
               
               req.session.loggedin = true;
               req.session.username=username;
               req.session.name = results[0].name;
               req.session.email = results[0].email;
               req.session.phone = results[0].phone;
               
               module.exports.uname = username;
               res.redirect('/home');
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