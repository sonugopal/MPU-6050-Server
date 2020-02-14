var express = require('express');
//var app = require('express')();
var app = express();
var queryParser = require('query-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var os = require('os');



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

  io.emit('accelData', accelData);

  accelX = req.query.aX
  accelY = req.query.aY
  accelZ = req.query.aZ
  temp = req.query.temp
  gyroX = req.query.gX
  gyroY = req.query.gY
  gyroZ = req.query.gZ
    
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
