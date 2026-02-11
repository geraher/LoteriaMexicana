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

	var currentCardIndex = 0;
	var currentCardNumber = 1;
	var gameRunning = false;
	var waitTimer = null;
	var waitDelay = 0;
	var waitStartedAt = 0;
	var waitRemaining = 0;
	var waitingForNextCard = false;
	var pausedDuringAudio = false;

	function clearWaitTimer() {
		if (waitTimer) {
			clearTimeout(waitTimer);
			waitTimer = null;
		}
		waitDelay = 0;
		waitStartedAt = 0;
		waitRemaining = 0;
		waitingForNextCard = false;
	}

	function getPostReadDelay() {
		// iOS buffer for normal and rapido to prevent clipping at the end.
		return $scope.tiempopasar === 4000 ? 0 : 250;
	}

	function scheduleNextCard(delay) {
		if (!gameRunning || refreshTriggered || $scope.isPaused) {
			return;
		}
		waitingForNextCard = true;
		waitDelay = delay;
		waitStartedAt = Date.now();
		waitRemaining = delay;
		waitTimer = setTimeout(function() {
			waitingForNextCard = false;
			waitTimer = null;
			playNextCard();
		}, delay);
	}

	function finishGame() {
		gameRunning = false;
		clearWaitTimer();
	}

	function playNextCard() {
		if (!gameRunning || refreshTriggered || $scope.isPaused) {
			return;
		}
		if (currentCardIndex >= arr.length) {
			finishGame();
			return;
		}

		var card = arr[currentCardIndex];
		var src = "cartas/" + card + ".jpg";
		$scope.AddListCards.push({ Imagen: src, num: currentCardNumber});
		$scope.Card = src;
		$scope.$applyAsync();

		currentCardIndex++;
		currentCardNumber++;

		AnunciarCarta(card, function() {
			scheduleNextCard(getPostReadDelay());
		});
	}

	$scope.iniciar = function (){
		refreshTriggered = false;
		gameRunning = true;
		$scope.start=false;
		$scope.isPaused=false;
		$scope.AddListCards=[];
		$scope.Card="cartas/"+0+".PNG";
		barajear();

		currentCardIndex = 0;
		currentCardNumber = 1;
		clearWaitTimer();
		pausedDuringAudio = false;

		// Start with card 0 and continue after it finishes, using real audio length.
		AnunciarCarta(0, function() {
			scheduleNextCard(getPostReadDelay());
		});
	}

	$scope.pauseGame = function () {
		if (!gameRunning || $scope.isPaused) {
			return;
		}
		$scope.isPaused = true;

		if (waitingForNextCard && waitTimer) {
			var elapsed = Date.now() - waitStartedAt;
			waitRemaining = Math.max(0, waitDelay - elapsed);
			clearWaitTimer();
		}

		pausedDuringAudio = false;
		if (audioPlayer && !audioPlayer.paused && !audioPlayer.ended) {
			audioPlayer.pause();
			pausedDuringAudio = true;
		}
	}

	$scope.resumeGame = function () {
		if (!gameRunning || !$scope.isPaused) {
			return;
		}
		$scope.isPaused = false;

		if (pausedDuringAudio && audioPlayer) {
			audioPlayer.play().catch(function(error) {
				console.error("Audio playback failed:", error);
			});
			pausedDuringAudio = false;
			return;
		}

		if (waitRemaining > 0) {
			scheduleNextCard(waitRemaining);
			waitRemaining = 0;
			return;
		}

		playNextCard();
	}

	$scope.refresh = function () {
		refreshTriggered = true;
		gameRunning = false;
		clearWaitTimer();
		if (audioPlayer) {
			audioPlayer.pause();
		}
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
