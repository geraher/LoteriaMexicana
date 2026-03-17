var application = angular.module("myApp", []);

// Declare audioPlayer globally or at least outside AnunciarCarta
var audioPlayer = document.getElementById("cardAudio");
var introLayerPlayer = new Audio();
var introRandomPlayer = new Audio();
var effectPlayer = new Audio();

var openingBaseEffect = "audio/efecto/vihuela1--_Marker 1.mp3";
var openingRandomEffects = [
	"audio/efecto/grito-long/mariachi10-_Marker 02.mp3",
	"audio/efecto/grito-long/mariachi12-_Marker 02.mp3",
	"audio/efecto/grito-long/mariachi13-_Marker 01.mp3",
	"audio/efecto/grito-long/mariachi3-_Marker 1-long.mp3",
	"audio/efecto/grito-long/mariachi4-_Marker 01.mp3",
	"audio/efecto/grito-long/mariachi5-_Marker 02.mp3",
	"audio/efecto/grito-long/mariachi8-_Marker 01.mp3"
];
var inicioEffects = [
	"audio/efecto/inicio/mariachi11-_Marker 01-om.mp3",
	"audio/efecto/inicio/mariachi2-_Marker 03-cqs.mp3",
	"audio/efecto/inicio/mariachi2-_Marker 06-ss.mp3",
	"audio/efecto/inicio/mariachi6-_Marker 02-oc.mp3"
];
var pauseEffects = [
	"audio/efecto/grito-short/mariachi1-_Marker 04.mp3",
	"audio/efecto/grito-short/mariachi1-_Marker 06.mp3",
	"audio/efecto/grito-short/mariachi1-_Marker 1.mp3",
	"audio/efecto/grito-short/mariachi10-_Marker 01.mp3",
	"audio/efecto/grito-short/mariachi12-_Marker 01.mp3",
	"audio/efecto/grito-short/mariachi2-_Marker 04.mp3",
	"audio/efecto/grito-short/mariachi2-_Marker 08.mp3",
	"audio/efecto/grito-short/mariachi3-_Marker 04.mp3",
	"audio/efecto/grito-short/mariachi4-_Marker 02.mp3",
	"audio/efecto/grito-short/mariachi5-_Marker 01.mp3",
	"audio/efecto/grito-short/mariachi6-_Marker 01.mp3",
	"audio/efecto/grito-short/mariachi6-_Marker 03.mp3",
	"audio/efecto/grito-short/mariachi6-_Marker 04.mp3",
	"audio/efecto/grito-short/mariachi6-_Marker 05.mp3",
	"audio/efecto/grito-short/mariachi7-_Marker 01.mp3",
	"audio/efecto/grito-short/mariachi9-_Marker 01.mp3",
	"audio/efecto/grito-short/mariachi9-_Marker 02.mp3"
];
var openingEffectPlayed = false;

function getRandomAudioSrc(list) {
	return list[Math.floor(Math.random() * list.length)];
}

function playEffect(audioObject, src) {
	audioObject.pause();
	audioObject.currentTime = 0;
	audioObject.src = src;
	audioObject.load();
	return audioObject.play().catch(function(error) {
		console.error("Effect playback failed:", error);
	});
}

function playRandomEffect(list) {
	return playEffect(effectPlayer, getRandomAudioSrc(list));
}

function playOpeningEffect() {
	if (openingEffectPlayed) {
		return;
	}

	Promise.all([
		playEffect(introLayerPlayer, openingBaseEffect),
		playEffect(introRandomPlayer, getRandomAudioSrc(openingRandomEffects))
	]).then(function() {
		openingEffectPlayed = true;
	});
}

window.addEventListener("load", function() {
	playOpeningEffect();
}, { once: true });

document.addEventListener("click", function() {
	playOpeningEffect();
}, { once: true });

document.addEventListener("touchstart", function() {
	playOpeningEffect();
}, { once: true });

// Start controller
// Add this variable at the top of your controller (inside the controller function)
var refreshTriggered = false;

application.controller("myCtrl", function ($scope, $http, $window, $timeout, $document) {
	//variables
	$scope.tiempopasar=1400;
	$scope.tiempopasar_min=800;
	$scope.tiempopasar_max=4000;
	$scope.start=true;
	$scope.isPaused=false;
	$scope.AddListCards=[];
	$scope.Card="cartas/"+0+".PNG";
	let arr = [];
	var cards= 54;

	$scope.voces = [{
	  id: 0,
	  label: 'marco'
	},
	{
	  id: 1,
	  label: 'pavel'
	}
	];

	$scope.vozselected = $scope.voces[0];

	// In $scope.iniciar, update the card shuffling loop to check the flag
	$scope.iniciar = function (){
		refreshTriggered = false;
		gameRunning = true;
		$scope.start=false;
		$scope.isPaused=false;
		$scope.AddListCards=[];
		$scope.Card="cartas/"+0+".PNG";
		barajear();
		var i = 0;
		var c = 1;
		var showcards;
		setTimeout(function() {
			if ($scope.tiempopasar === 4000) {
				var playNext = function () {
					if (i > cards || refreshTriggered) return;
					AnunciarCarta(arr[i], function () {
						i++;
						playNext();
					});
					var src="cartas/"+arr[i]+".jpg";
					$scope.AddListCards.push({ Imagen: src, num: c});
					$scope.Card=$scope.AddListCards[i].Imagen;
					$scope.$apply();
					c++;
				};
				playNext();
			} else {
				while (i <= cards) {
					(function(i) {
						setTimeout(function() {
							// Stop shuffling if refresh was triggered
							if (refreshTriggered) return;
							AnunciarCarta(arr[i]);
							var src="cartas/"+arr[i]+".jpg";
							$scope.AddListCards.push({ Imagen: src, num: c});
							$scope.Card=$scope.AddListCards[i].Imagen;
							$scope.$apply();						
							c++;
						}, $scope.tiempopasar * i)
					})(i++)
				}
			}
		},2300*($scope.tiempopasar/1400))
	}

	// Modify $scope.refresh to set the flag and play audio before reload
	$scope.refresh = function () {
		refreshTriggered = true;
		setTimeout(function() {
			var audio = new Audio("audio/marco/55.m4a");
			audio.play().catch(function(e) {
				console.error("Audio playback failed:", e);
			});
			setTimeout(function() {
				location.reload();
			}, 1500); // 1.5 second delay before reload
		}, 0);
	}

	function barajear() {
		arr = [];
		do {
			let num = Math.floor(Math.random() * cards + 1);
		  	arr.push(num);
		  	arr = arr.filter((item, index) => {
	    		return arr.indexOf(item) === index
	  		});
		} while (arr.length < cards);
	}

	$scope.changepasar = function (tiempo){
		$scope.tiempopasar=tiempo;
	}


	// Create a single AudioContext globally
	var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

	function AnunciarCarta(_carta, onComplete) {
			if (!audioPlayer) {
				audioPlayer = document.createElement("AUDIO");
				audioPlayer.setAttribute("id", "cardAudio");
				document.body.appendChild(audioPlayer);
			}
			
			// Choose the voice folder; use "<label>_long" when tiempopasar is 4000
			var baseFolder = $scope.vozselected.label;
			var useLong = $scope.tiempopasar === 4000;
			var voiceFolder = baseFolder + (useLong ? "_long" : "");
			var audioSrc = "audio/" + voiceFolder + "/" + _carta + ".m4a";
			var normalSrc = "audio/" + baseFolder + "/" + _carta + ".m4a";

			function playSrc(src) {
				audioPlayer.setAttribute("src", src);
				audioPlayer.load();
				audioPlayer.playbackRate = Math.max(1,1400 / $scope.tiempopasar);
				return audioPlayer.play();
			}

			// When tiempopasar is 4000, play long first, then normal
			if (useLong) {
				var playedNormal = false;
				audioPlayer.onended = function () {
					if (!playedNormal) {
						playedNormal = true;
						playSrc(normalSrc).catch(function(error) {
							console.error("Audio playback failed:", error);
						});
						return;
					}
					if (typeof onComplete === "function") {
						onComplete();
					}
				};
				audioPlayer.onerror = function () {
					if (!playedNormal) {
						playedNormal = true;
						playSrc(normalSrc).catch(function(error) {
							console.error("Audio playback failed:", error);
						});
						return;
					}
					if (typeof onComplete === "function") {
						onComplete();
					}
				};
				playSrc(audioSrc).catch(function(error) {
					console.error("Audio playback failed:", error);
				});
			} else {
				audioPlayer.onended = function () {
					if (typeof onComplete === "function") {
						onComplete();
					}
				};
				audioPlayer.onerror = function () {
					if (typeof onComplete === "function") {
						onComplete();
					}
				};
				playSrc(audioSrc).catch(function(error) {
					console.error("Audio playback failed:", error);
				});
			}
		}


});
