const express = require('express');
const bodyParser= require('body-parser')
var mongodb = require('mongodb')

const app = express();
var portNum= 3002;
var MongoClient = mongodb.MongoClient;

const fs = require('fs');

var Promise = require('bluebird');
var Converter = require('csvtojson').Converter;

var url = 'mongodb://localhost:27017/UK_Census';

app.use(bodyParser.urlencoded({extended: true}))

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
//connect to mongodb
app.listen(portNum, function() {
	console.log('listening on '+portNum)	
})

//connect to mongodb
var db
// Use connect method to connect to the Server
MongoClient.connect(url, function (err, database) {
	db=database;
  	if (err) {
    	console.log('Unable to connect to the mongoDB server. Error:', err);
  	} else {
   		console.log('Connection established to mongodb', url);
  	}
});

//index page
app.get('/', function(req, res) {
	res.render('index');
});

app.get('/', function(req, res) {
	res.render('age_demographics_uk_2011');
});

//csv to json conversion bsw 20160802, KS101EWDATA
app.get('/KS101EWDATA', function(req, res) {

var csvFileName = __dirname + "/public/data/KS101EWDATA.CSV";

var myObj = new Object();
myObj["path"]   = csvFileName;

fs.exists(csvFileName,function(exists){
if(exists){
console.log('file exists');

}else{
console.log('file does not exist');

}
});

Promise.promisifyAll(Converter.prototype);

var csvConverter=new Converter();

//end_parsed will be emitted once parsing finished
csvConverter.on("end_parsed",function(jsonObj){
if(!jsonObj){
    // CSV to JSON conversion failed
    res.send('CSV to JSON conversion failed');
} else {
    // CSV to JSON OK send it
res.send(jsonObj);
}
//console.log("here is your result json object"); //here is your result json object

});

//read from file
fs.createReadStream(csvFileName).pipe(csvConverter);

});


//csv to json conversion bsw 20160802, KS102EWDATA
app.get('/KS102EWDATA', function(req, res) {

var csvFileName = __dirname + "/public/data/KS102EWDATA.CSV";

var myObj = new Object();
myObj["path"]   = csvFileName;

fs.exists(csvFileName,function(exists){
if(exists){
console.log('file exists');

}else{
console.log('file does not exist');

}
});

Promise.promisifyAll(Converter.prototype);

var csvConverter=new Converter();

//end_parsed will be emitted once parsing finished
csvConverter.on("end_parsed",function(jsonObj){
if(!jsonObj){
    // CSV to JSON conversion failed
    res.send('CSV to JSON conversion failed');
} else {
    // CSV to JSON OK send it
res.send(jsonObj);
}
//console.log("here is your result json object"); //here is your result json object

});

//read from file
fs.createReadStream(csvFileName).pipe(csvConverter);

});

function fieldsDescription (req, res, next) {
	db.collection('Age_Structure_Description').find({"ColumnVariableMeasurementUnit": req.query.searchby}, {"ColumnVariableCode" : 1, "ColumnVariableDescription" : 1}).toArray(function(err, collection_data) {
		req.structure = collection_data;
		next();
	});
}

//search results
app.get('/search-results', fieldsDescription, function(req, res) {
	var areaCode="";
	if(req.query.area){
		areaCode=req.query.area;
	}
	var myObj = new Object();
	if(areaCode!=""){
		db.collection('Age_Structure').findOne({"GeographyCode" : areaCode}, function(err, document) {
			if (err) {
				myObj["error"]   = 'not found';
				res.send(myObj);
      		} else if (document) {
      			if(document!=""){
      				myObj["aaData"]   = document;
      				myObj["columnDetails"]   = req.structure;
					res.send(myObj);
     			}else{
					myObj["error"]   = 'not found';
					res.send(myObj);
				}
      		}
      	});
    }else{
		myObj["error"]   = 'Please select any location!';
		res.send(myObj);
    }
});

app.get('/:id', function(req, res) {
	res.render(req.params.id, {
      	 queryStr : req.query
    });
});

