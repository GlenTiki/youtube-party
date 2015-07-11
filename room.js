var fs = require('fs');

var queue = require('./currQueue');

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

var writeQueueToFile = function(){
	var buff = new Buffer('module.exports = ' + JSON.stringify(queue) + ';');
	var fd = __dirname + '/currQueue.js';
	
	fs.writeFile(fd, buff, function(err){
		if(err) {console.log('problem writing to file');}
		console.log('finished write to file');
	});
}