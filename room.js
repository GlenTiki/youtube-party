var queue = ["sENM2wA_FTg", "fe4EK4HSPkI", "bXHuC84WniI", "rn9AQoI7mYU", "6hzrDeceEKc", "RIZdjT1472Y", "lwlogyj7nFE", "7E0fVfectDo", "YXdOAUKCc0k", "gGdGFtwCNBE", "otCpCn0l4Wo", "YgSPaXgAdzE", "SSbBvKaM6sk", "UclCCFNG9q4", "hTMrlHHVx8A", "gOLY7bjCTTE", "r8OipmKFDeM"];

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
