const io = require('socket.io').listen(1337);
const cron = require('cron');

var endpoint = io.of('/' + id);

var servers = {};

var parseServers = cron.job("*/15 * * * * *", function() {

});

endpoint.on('connection', function (socket) {
	var sendServerStatus = cron.job("*/15 * * * * *", function() {
		room.emit('serverStatus', );
	});

	socket.on('data', function (data) {
		//room.emit('data', data);
	});
});

parseServers.start();
sendServerStatus.start();
