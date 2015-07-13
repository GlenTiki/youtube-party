var API_KEY = 'AIzaSyBWxb8QzNTy47Y_PVlWDmRhQ0ymcsp6JKk';

var socket = io();

var player, lastEvent;
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
  socket.emit('player added');
  var oldTime = 0;

  setInterval(function(){
  	if(player.getCurrentTime() - oldTime > 0.2 ||
  		  player.getCurrentTime() - oldTime < -0.2){
  		var evt = {
  			data: player.getPlayerState(),
  			target: {
  				B: {
						currentTime: player.getCurrentTime()
  				}
  			}
  		}
			socket.emit('player state change', evt);
  	}
  	oldTime = player.getCurrentTime();
  }, 1000)
}

function onPlayerStateChange(event) {
	if(event.data == YT.PlayerState.ENDED){
  	socket.emit('pop top of queue', player.getVideoData().video_id);
	} else {
  	socket.emit('player state change', event);
	}
}

var helloApp = angular.module("helloApp", []);

helloApp.controller("PlaylistCtrl", function($scope, $http) {
	$scope.playlist = [];
	$scope.searchResults = [];
	$scope.cachedResponces = {};
	$scope.newSong = {};
	$scope.queryStr = '';
	$scope.playing = true;

	var oldQueryStr = '';
	var nextPageToken = '';

	socket.on('current queue', function(queueArr){
		cacheAndAddVideos(queueArr);

		if(player){
			if(player.getVideoData().video_id !== queueArr[0]){
				player.loadVideoById(queueArr[0]);
			}
		}

		$scope.$apply();
	});

	socket.on('player state change', function(event){
		if(player){
			if(event.target.B.currentTime > player.getCurrentTime()+2 ||
				 event.target.B.currentTime < player.getCurrentTime()-2){
		  	player.seekTo(event.target.B.currentTime);
	  	}
			if(event.data == YT.PlayerState.PAUSED){
				player.pauseVideo();
			}
			if(event.data == YT.PlayerState.PLAYING){
				player.playVideo();
			}
		}
		if(event.data == 1){
			$scope.playing = true;
		} else if(event.data == 2){
			$scope.playing = false;
		}
	});

	$scope.skipSong = function(){
		socket.emit('pop top of queue', $scope.playlist[0].id);
	}

	$scope.removeSong = function(song){
		socket.emit('delete song by id', song.id);
	}

	$scope.bringToFront = function(song){
		socket.emit('bring to front', song.id);
	}

	$scope.pushToBack = function(song){
		socket.emit('push to back', song.id);
	}

	$scope.saveSong = function(songId){
		socket.emit('add song', songId);
	};

	$scope.pauseSong = function(){
		socket.emit('pause song');
	};

	$scope.playSong = function(){
		socket.emit('play song');
	};

	$scope.search = function(queryStr){
		$scope.searchResults = [];
		oldQueryStr = queryStr;
		var responsePromise = $http.get("https://www.googleapis.com/youtube/v3/search?part=snippet&q="+queryStr+"&maxResults=25&key="+API_KEY);
	
		responsePromise.success(function(data, status, headers, config) {
		  nextPageToken = data.nextPageToken;
			data.items.forEach(function(video, i){
				video.snippet.id = video.id.videoId;
				$scope.searchResults.push(video.snippet);
			})
			$scope.$apply();
     });
	};

	$scope.loadMoreResults = function(){
		var responsePromise = $http.get("https://www.googleapis.com/youtube/v3/search?part=snippet&q="+oldQueryStr+"&pageToken="+nextPageToken+"&maxResults=25&key="+API_KEY);
	
		responsePromise.success(function(data, status, headers, config) {
		  nextPageToken = data.nextPageToken;
			data.items.forEach(function(video, i){
				video.snippet.id = video.id.videoId;
				$scope.searchResults.push(video.snippet);
			})
			$scope.$apply();
     });
	}

	socket.on('pause song', function(){
		if(player){
			player.pauseVideo();
		}
	})

	socket.on('play song', function(){
		if(player){
			player.playVideo();
		}
	})

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
  	if(!duration) return;

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

$(document).ready(function(){
	$('#search').click(function(){
		console.log('clicked');
		$('#collapseSearch').collapse('show');
	});

	$('#mainContent').click(function(){
		console.log('clicked other');
		$('#collapseSearch').collapse('hide');
	});

	$('#collapseSearch').on('shown.bs.collapse', function(){
		$('#search-expand').html('Hide');
	});

	$('#collapseSearch').on('hidden.bs.collapse', function(){
		$('#search-expand').html('Expand');
	});
});