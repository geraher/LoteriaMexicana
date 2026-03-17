var application = angular.module("myApp", []);

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
		throw error;
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
	}).catch(function() {
		// Ignore autoplay failures. User interaction listeners retry once.
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

var refreshTriggered = false;

application.controller("myCtrl", function ($scope) {
	$scope.tiempopasar = 1400;
	$scope.tiempopasar_min = 800;
	$scope.tiempopasar_max = 4000;
	$scope.start = true;
	$scope.isPaused = false;
	$scope.AddListCards = [];
	$scope.Card = "cartas/" + 0 + ".PNG";

	var arr = [];
	var cards = 54;
	var currentCardIndex = 0;
	var currentCardNumber = 1;
	var gameRunning = false;
	var startDelayTimer = null;
	var waitTimer = null;
	var waitDelay = 0;
	var waitStartedAt = 0;
	var waitRemaining = 0;
	var waitingForNextCard = false;
	var pausedDuringAudio = false;

	$scope.voces = [{
		id: 0,
		label: "marco"
	}, {
		id: 1,
		label: "pavel"
	}];

	$scope.vozselected = $scope.voces[0];

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

	function clearStartDelayTimer() {
		if (startDelayTimer) {
			clearTimeout(startDelayTimer);
			startDelayTimer = null;
		}
	}

	function getPostReadDelay() {
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
		clearStartDelayTimer();
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
		$scope.AddListCards.push({ Imagen: src, num: currentCardNumber });
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
		$scope.start = false;
		$scope.isPaused = false;
		$scope.AddListCards = [];
		$scope.Card = "cartas/" + 0 + ".PNG";
		barajear();

		currentCardIndex = 0;
		currentCardNumber = 1;
		clearStartDelayTimer();
		clearWaitTimer();
		pausedDuringAudio = false;
		playRandomEffect(inicioEffects);

		startDelayTimer = setTimeout(function() {
			startDelayTimer = null;
			if (!gameRunning || refreshTriggered || $scope.isPaused) {
				return;
			}

			AnunciarCarta(0, function() {
				scheduleNextCard(getPostReadDelay());
			});
		}, 1500);
	};

	$scope.pauseGame = function () {
		if (!gameRunning || $scope.isPaused) {
			return;
		}

		$scope.isPaused = true;
		playRandomEffect(pauseEffects);

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
	};

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

		if (startDelayTimer) {
			return;
		}

		playNextCard();
	};

	$scope.refresh = function () {
		refreshTriggered = true;
		gameRunning = false;
		clearStartDelayTimer();
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
			}, 1500);
		}, 0);
	};

	function barajear() {
		arr = [];
		do {
			var num = Math.floor(Math.random() * cards + 1);
			arr.push(num);
			arr = arr.filter(function(item, index) {
				return arr.indexOf(item) === index;
			});
		} while (arr.length < cards);
	}

	$scope.changepasar = function (tiempo){
		$scope.tiempopasar = tiempo;
	};

	function AnunciarCarta(_carta, onComplete) {
		if (!audioPlayer) {
			audioPlayer = document.createElement("audio");
			audioPlayer.setAttribute("id", "cardAudio");
			document.body.appendChild(audioPlayer);
		}

		var baseFolder = $scope.vozselected.label;
		var useLong = $scope.tiempopasar === 4000;
		var voiceFolder = baseFolder + (useLong ? "_long" : "");
		var audioSrc = "audio/" + voiceFolder + "/" + _carta + ".m4a";
		var normalSrc = "audio/" + baseFolder + "/" + _carta + ".m4a";

		function playSrc(src) {
			audioPlayer.setAttribute("src", src);
			audioPlayer.load();
			audioPlayer.playbackRate = Math.max(1, 1400 / $scope.tiempopasar);
			return audioPlayer.play();
		}

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
