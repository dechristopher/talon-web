const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const cron = require('cron');
const rq = require('requestify');

var options = {
  key: fs.readFileSync('./file.pem', 'utf-8'),
  cert: fs.readFileSync('./file.crt', 'utf-8')
};

const server = https.createServer(options, app);
const io = require('socket.io')(server);

var servers = [
	{online:0, players:0},
	{online:0, players:0},
	{online:0, players:0},
	{online:0, players:0},
	{online:0, players:0},
	{online:0, players:0},
	{online:0, players:0},
	{online:0, players:0}
];

io.on('connection', function(socket) {
  console.log('connection');
  socket.emit('message', '\"Retakes suck\" -drop');

  var sendServerStatus = cron.job("*/15 * * * * *", function() {
	  socket.emit('serverStatus', servers);
  });
  sendServerStatus.start();
});

server.listen(1337, function() {
  console.log('~ Server running on %s port', serverPort);
});

var parseServers = cron.job("*/10 * * * * *", function() {
	rq.get('http://kiir.us/api.php/?cmd=serverStatus&key=2F6E713BD4BA889A21166251DEDE9').then(response => setServers(response.getBody()));
});

function setServers(apiResponse) {
	var splitSrvTotal = apiResponse.toString().split("_");
	var allServers = splitSrvTotal[0];
	var totalPlayers = splitSrvTotal[1];

	var srvArray = allServers.toString().split("~");

	for(var i = 0; i < 7; i++){
		var thisSrv = srvArray[i].toString().split("-");
		servers[i].online = thisSrv[0];
		servers[i].players = thisSrv[1];
	}

	servers[8].online = 1;
	servers[8].players = totalPlayers;

	//console.log(servers);
}

parseServers.start();
