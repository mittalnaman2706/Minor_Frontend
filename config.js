var mysql = require('mysql');
var connection = mysql.createConnection({

	multipleStatements: true,
	host     : 'localhost',
	user     : 'root',
	password : '',
    connectTimeout :  999999999,
	database : 'minor',
	// port : 8888
});

connection.connect(function(err){
if(!err) {
    console.log("Database is connected, Your website is started !");
} else {
    console.log(err + " Error while connecting with database :(, Try again");
}
});
module.exports = connection; 