var fs = require('fs');

var queue = [];

var configPath = process.resourcesPath || process.cwd() + '/config/'

try{
  queue = require(configPath + 'ytpt-currQueue.js');
} catch(err){
	console.error('Cannot find a valid currQueue file');
}

fs.exists(configPath, function(exists){
	if(!exists) fs.mkdir(configPath);
})

function addSongToQueue(song){
	if(queue.indexOf(song) === -1) queue.push(song);
	else { moveSong(queue.indexOf(song), queue.length-1)};

	writeQueueToFile()
}

function getQueue(){
	return queue;
}

function pushTopSongToEnd(){
  var element = queue[0];
  queue.splice(0, 1);
  queue.push(element);
  writeQueueToFile()
}

function moveSong(currentLocation, newLocation){
  var element = queue[currentLocation];
  queue.splice(currentLocation, 1);
  queue.splice(newLocation, 0, element);
  writeQueueToFile()
}

function deleteSong(currentLocation){
	queue.splice(currentLocation, 1);
	writeQueueToFile()
}

function writeQueueToFile(){
	var buff = new Buffer('module.exports = ' + JSON.stringify(queue) + ';');
	var fd = configPath + 'ytpt-currQueue.js';

	fs.writeFile(fd, buff, function(err){
		if(err) {
			console.error('problem writing to file', err);
		}
		console.log('finished write to file function');
	});
}

module.exports = {
	'addSongToQueue': addSongToQueue,
	'getQueue': getQueue,
	'pushTopSongToEnd': pushTopSongToEnd,
	'moveSong': moveSong,
  'deleteSong': deleteSong
};