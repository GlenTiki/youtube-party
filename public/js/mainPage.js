var API_KEY = 'AIzaSyBWxb8QzNTy47Y_PVlWDmRhQ0ymcsp6JKk';

var socket = io();

var player;
function onYouTubeIframeAPIReady() {
	player = new YT.Player('player', {
 	  height: '390',
 	  width: '640',
 	  events: {
 	    'onReady': onPlayerReady,
 	    'onStateChange': onPlayerStateChange
 	  }
 	});
}

function onPlayerReady(event) {
  event.target.playVideo();
  socket.emit('get top of queue');
}

function onPlayerStateChange(event) {
	if(event.data == YT.PlayerState.ENDED){
  	socket.emit('pop top of queue');
	}
}

socket.on('new top of queue', function(top){
	if(player) player.loadVideoById(top);
});

var helloApp = angular.module("helloApp", []);

helloApp.controller("PlaylistCtrl", function($scope, $http) {
	$scope.playlist = [];
	$scope.cachedResponces = {};
	$scope.newSong = {};

	socket.on('current queue', function(queueArr){
		cacheAndAddVideos(queueArr);
	});

	$scope.skipSong = function(){
		socket.emit('pop top of queue', $scope.playlist[0]);
	}

	$scope.removeSong = function(song){
		for(i in $scope.playlist) {
      if($scope.playlist[i].id == song.id) {
        $scope.playlist.splice(i, 1);
      }
    }
		delete $scope.cachedResponces[song.id];
		socket.emit('delete song by id', song.id);
	}

	$scope.bringToFront = function(song){
		socket.emit('bring to front', song.id);
	}

	$scope.pushToBack = function(song){
		socket.emit('push to back', song.id);
	}

	$scope.saveSong = function(){
		socket.emit('add song', $scope.newSong.id);
		$scope.newSong = {};
	};

	function cacheAndAddVideos(queueArr){
		$scope.playlist.splice(queueArr.length, $scope.playlist.length - queueArr.length);
		queueArr.forEach(function(videoId, index){

			if($scope.cachedResponces[videoId]){
				$scope.cachedResponces[videoId].index = index;
				$scope.playlist[$scope.cachedResponces[videoId].index] = $scope.cachedResponces[videoId];
			} else {
				var responsePromise = $http.get("https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id="+videoId+"&key="+API_KEY);
	
				responsePromise.success(function(data, status, headers, config) {
					$scope.cachedResponces[videoId] = data.items[0].snippet;
					$scope.cachedResponces[videoId].duration = data.items[0].contentDetails.duration;
					$scope.cachedResponces[videoId].id = videoId;
				  $scope.cachedResponces[videoId].index = index;
					$scope.playlist[$scope.cachedResponces[videoId].index] = $scope.cachedResponces[videoId];
      	});

			}
		});
	}
});

helloApp.filter('convert_time', function() {

  return function(duration) {
    var a = duration.match(/\d+/g);
    if (duration.indexOf('M') >= 0 && duration.indexOf('H') == -1 && duration.indexOf('S') == -1) {
        a = [0, a[0], 0];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1) {
        a = [a[0], 0, a[1]];
    }
    if (duration.indexOf('H') >= 0 && duration.indexOf('M') == -1 && duration.indexOf('S') == -1) {
        a = [a[0], 0, 0];
    }
    duration = 0;
    if (a.length == 3) {
        duration = duration + parseInt(a[0]) * 3600;
        duration = duration + parseInt(a[1]) * 60;
        duration = duration + parseInt(a[2]);
    }
    if (a.length == 2) {
        duration = duration + parseInt(a[0]) * 60;
        duration = duration + parseInt(a[1]);
    }
    if (a.length == 1) {
        duration = duration + parseInt(a[0]);
    }
    return duration
	}
});

helloApp.filter('seconds_to_string', function() {

  return function(seconds) {
    var hours = Math.floor(seconds/60/60)
    var minutes = Math.floor((seconds/60)%60)
    var seconds =  Math.floor(seconds%60)

    return (hours > 0 ? hours + ' hours. ' : '') +  minutes + ' minutes. ' + seconds + ' seconds.';
	}
});
