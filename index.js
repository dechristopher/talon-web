//Load required modules
const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
const cron = require('cron');
const g = require('gulp-util');
const rq = require('requestify');

//Load config file
var config = JSON.parse(fs.readFileSync('./config.json'));

//Configure WSS with SSL
var options = {
    key: fs.readFileSync('./private.key'),
    cert: fs.readFileSync('./ssl.crt')
};

const server = https.createServer(options, app);
const io = require('socket.io')(server);

//Global server status variable
var servers = [
    {
        online: 0,
        players: 0
    }, {
        online: 0,
        players: 0
    }, {
        online: 0,
        players: 0
    }, {
        online: 0,
        players: 0
    }, {
        online: 0,
        players: 0
    }, {
        online: 0,
        players: 0
    }, {
        online: 0,
        players: 0
    }, {
        online: 0,
        players: 0
    }
];

//Number of connected clients
var hereNow = 0;
//Highest number of connected clients
var hereMax = 0;

//Start message
console.log('~ [' + g.colors.green('KIWI') + '] WSS server starting...')

//When a client connects, do the following...
io.on('connection', function(socket) {
	//Update number of connected clients
	hereNow++;

    //Update hereMax if necessary
    if(hereNow > hereMax) {
        hereMax = hereNow;
    }

	//Set random connection id for this connection
	var id = require('./helpers/randomstring')(4);
	//Previously sent hereNow message number
	var lastHere = hereNow;
    //Previously sent hereMax message number
    var lastHereMax = hereMax;

	console.log('~    Connect -> ID: [' + g.colors.cyan(id) + '] -> Total: [' + g.colors.yellow(hereNow) + ']');

	//Send connection id to client
	socket.emit('message', id);
	//Send hereNow to client
	socket.emit('hereNow', hereNow);
    //Send hereNow to client
	socket.emit('hereMax', hereMax);
	//Send initial server data
	socket.emit('serverStatus', JSON.stringify(servers));

	//Send server data every 15 seconds
	var sendServerStatus = cron.job("*/15 * * * * *", function() {
		socket.emit('serverStatus', JSON.stringify(servers));
	});
	sendServerStatus.start();

    //Send hereNow and hereMax data every 5 seconds
	var sendHereDate = cron.job("*/5 * * * * *", function() {
		if(hereNow != lastHere) {
			lastHere = hereNow;
			socket.emit('hereNow', hereNow);
		}
        if(hereMax != lastHereMax) {
			lastHereMax = hereMax;
			socket.emit('hereMax', hereMax);
		}
	});
	sendHereData.start();

    //Stop sending server and hereNow data to disconnected clients and subtract one from connected clients
    socket.on('disconnect', function() {
        sendServerStatus.stop();
		sendHereData.stop();
        hereNow--;
        console.log('~ Disconnect -> ID: [' + g.colors.cyan(id) + '] -> Total: [' + g.colors.yellow(hereNow) + ']');
    });
});

//Start WSS listener
server.listen(config.port, function() {
    console.log('~ Server listening on port ' + g.colors.magenta('%s'), config.port);
});

//Call the KIWI API for server status
var parseServers = cron.job("*/10 * * * * *", function() {
    rq.get('http://kiir.us/api.php/?cmd=serverStatus&key=2F6E713BD4BA889A21166251DEDE9').then(response => setServers(response.getBody()));
});

//Set global server status variable with given api response
function setServers(apiResponse) {
    var splitSrvTotal = apiResponse.toString().split("_");
    var allServers = splitSrvTotal[0];
    var totalPlayers = splitSrvTotal[1];

    var srvArray = allServers.toString().split("~");

    for (var i = 0; i < 7; i++) {
        var thisSrv = srvArray[i].toString().split("-");
        servers[i].online = thisSrv[0];
        servers[i].players = thisSrv[1];
    }

    servers[7].online = 1;
    servers[7].players = totalPlayers;

    //console.log(servers);
}

//Start the API parser
parseServers.start();
