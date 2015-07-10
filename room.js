var queue = [
		'lwlogyj7nFE',
		'YXdOAUKCc0k',
		'6hzrDeceEKc',
		'r8OipmKFDeM',
		'gGdGFtwCNBE'
	];

exports.addSongToQueue = function(song){
	queue.push(song);
}

exports.getQueue = function(){
	return queue;
}

exports.pushTopSongToEnd = function(){
  var element = queue[0];
  queue.splice(0, 1);
  queue.push(element);
}

exports.moveSong = function(currentLocation, newLocation){
  var element = queue[currentLocation];
  queue.splice(currentLocation, 1);
  queue.splice(newLocation, 0, element);
}

exports.deleteSong = function(currentLocation){
	queue.splice(currentLocation, 1);
}
