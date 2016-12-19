const io = require('socket.io').listen(1337);
const cron = require('cron');
const rq = require('requestify');

var endpoint = io.of('/servers');

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

console.log('~ Starting talon-web server watcher');

var parseServers = cron.job("*/10 * * * * *", function() {
	rq.get('http://kiir.us/api.php/?cmd=serverStatus&key=2F6E713BD4BA889A21166251DEDE9').then(response => setServers(response.getBody()));
});

endpoint.on('connection', function (socket) {
	console.log('connection');
	var sendServerStatus = cron.job("*/15 * * * * *", function() {
		socket.emit('serverStatus', JSON.stringify(servers));
		console.log('emiting server status');
	});
	sendServerStatus.start();

	//socket.on('data', function (data) {
		//room.emit('data', data);
	//});
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

	servers[7].online = 1;
	servers[7].players = totalPlayers;

	console.log(servers);
}

parseServers.start();
