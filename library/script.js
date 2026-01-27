var application = angular.module("myApp", []);

// Declare audioPlayer globally or at least outside AnunciarCarta
var audioPlayer = document.getElementById("cardAudio");

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
		AnunciarCarta(0);
		$scope.start=false;
		$scope.AddListCards=[];
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
						setTimeout(onComplete, 1000);
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
						setTimeout(onComplete, 1000);
					}
				};
				playSrc(audioSrc).catch(function(error) {
					console.error("Audio playback failed:", error);
				});
			} else {
				audioPlayer.onended = null;
				audioPlayer.onerror = null;
				playSrc(audioSrc).catch(function(error) {
					console.error("Audio playback failed:", error);
				});
				if (typeof onComplete === "function") {
					onComplete();
				}
			}
		}


});
