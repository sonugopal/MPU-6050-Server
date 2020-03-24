var express = require('express');
//var app = require('express')();
var app = express();
var queryParser = require('query-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var os = require('os');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'IOT';
var db;
// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    db = client.db(dbName);

   // client.close();
});

//app.use(queryParser.json())

app.use(express.static(path.join(__dirname, '/public')));

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}

var accelData={};
var accelX;
var accelY;
var accelZ;
var temp;
var gyroX;
var gyroY;
var gyroZ;
var location;

server.listen(3000, process.argv[2], function() {
	var host = server.address().address
	var port = server.address().port
	console.log("Server listening on %s:%s...", host, port);
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/location', function(req, res) {

    location = req.query
    location.city="bangalore";
	location.country="india";
	location.lat=12.923078
    location.lon=77.611756
	io.emit('location', location);

});


app.get('/sensorValues', function(req, res) {
  //console.log(req.query.nodeID)
  //console.log(req.query.data.accel.accelX)
  //console.log(req.query.data.accel.accelY)
  //console.log(req.query.data.accel.accelZ)
  //console.log(req.query.data.temp)
  //console.log(req.query.data.gyro.gyroX)
  //console.log(req.query.data.gyro.gyroY)
  //console.log(req.query.data.gyro.gyroZ)

  accelData = req.query
    console.log(accelData)

  io.emit('location', accelData);
  accelX = parseFloat(req.query.aX)
  accelY = parseFloat(req.query.aY)
  accelZ = parseFloat(req.query.aZ)
  temp = req.query.temp
  gyroX = req.query.gX
  gyroY = req.query.gY
  gyroZ = req.query.gZ

    const collection = db.collection('values');
    collection.insert(accelData,function (err,result) {
        if(err){
            console.log(err)
        }
        else{
            console.log("inserted")
        }
    })

    io.emit('accelData', accelData);
    if( (0.30>=accelData.aZ && accelData.aZ>-0.05) || (0.00>accelData.aY && accelData.aY>-0.04) ){
        console.log(accelData.aZ)
        console.log(accelData.aY)
        const collection2 = db.collection('accident');
        collection2.insert(accelData,function (err,result) {
            if(err){
                console.log(err)
            }
            else{
                console.log("inserted")
            }
        })
        io.emit('emergency', true);
    }
  //io.emit('accelX', accelX);
  //io.emit('accelY', accelY);
  //io.emit('accelZ', accelZ);
  //io.emit('temp', temp);
  //io.emit('gyroX', gyroX);
  //io.emit('gyroY', gyroY);
  //io.emit('gyroZ', gyroZ);
    res.json(true)
});

io.on('connection', function (socket) {
	socket.on('location', function (data) {
		console.log(data);
	});
	socket.on('accelData', function (data) {
		//console.log(data);
	});
});
