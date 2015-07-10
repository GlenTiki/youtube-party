var API_KEY = 'YOUR API KEY';

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
  socket.emit('get queue');
}

function onPlayerStateChange(event) {
	if(event.data == YT.PlayerState.ENDED){
  	socket.emit('pop top of queue', player.getVideoData().video_id);
	}
}

var helloApp = angular.module("helloApp", []);

helloApp.controller("PlaylistCtrl", function($scope, $http) {
	$scope.playlist = [];
	$scope.cachedResponces = {};
	$scope.newSong = {};

	socket.on('current queue', function(queueArr){
		cacheAndAddVideos(queueArr);

		if(player){
			if(player.getVideoData().video_id !== queueArr[0]){
				player.loadVideoById(queueArr[0]);
        player.stopVideo();
			}
		}

		$scope.$apply();
	});

	$scope.skipSong = function(){
		socket.emit('pop top of queue', $scope.playlist[0].id);
	}

	$scope.removeSong = function(song){
		delete $scope.playlist[$scope.cachedResponces[song.id].index];
		delete $scope.cachedResponces[song.id];
		console.log($scope.playlist);
		$scope.$apply();
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
		$scope.playlist.splice(0, queueArr.length);
		queueArr.forEach(function(videoId, index){
			if($scope.cachedResponces[videoId]){
				$scope.cachedResponces[videoId].index = index;
				$scope.playlist[index] = $scope.cachedResponces[videoId];
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
