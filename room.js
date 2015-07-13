var fs = require('fs');

var queue = [];
try{
  queue = require(process.cwd() + '/config/ytpt-currQueue.js');
} catch(err){
	console.error('Cannot find a valid currQueue file');
}

exports.addSongToQueue = function(song){
	if(queue.indexOf(song) === -1) queue.push(song);

	writeQueueToFile()
}

exports.getQueue = function(){
	return queue;
}

exports.pushTopSongToEnd = function(){
  var element = queue[0];
  queue.splice(0, 1);
  queue.push(element);
  writeQueueToFile()
}

exports.moveSong = function(currentLocation, newLocation){
  var element = queue[currentLocation];
  queue.splice(currentLocation, 1);
  queue.splice(newLocation, 0, element);
  writeQueueToFile()
}

exports.deleteSong = function(currentLocation){
	queue.splice(currentLocation, 1);
	writeQueueToFile()
}

function writeQueueToFile(){
	var buff = new Buffer('module.exports = ' + JSON.stringify(queue) + ';');
	var fd = process.cwd() + '/config/ytpt-currQueue.js';

	fs.writeFile(fd, buff, function(err){
		if(err) {
			console.error('problem writing to file', err);
		}
		console.log('finished write to file function');
	});

}