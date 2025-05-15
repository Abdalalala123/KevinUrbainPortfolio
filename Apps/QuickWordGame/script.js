// =============================================
// CONSTANTES ET ÉTAT DU JEU
// =============================================
const GameState = {
	words: [],
	currentWords: [],
	score: 0,
	correctWords: 0,
	incorrectWords: 0,
	timerInterval: null,
	timeLeft: 60,
	isPlaying: false,
	startTime: null,
	lastTypedTime: null,
	wpm: 0,
	accuracy: 100,
	totalTyped: 0,
};

// Sélection des éléments DOM
const DOM = {
	wordDisplayArea: document.querySelector("#word-display-area"),
	typingInput: document.querySelector("#typing-input"),
	correctWordsDisplay: document.querySelector("#correct-words"),
	timeLeftDisplay: document.querySelector("#time-left"),
	startResetButton: document.querySelector("#start-reset-button"),
	gameContainer: document.querySelector("#game-container"),
	resultsSummary: document.querySelector("#results-summary"),
	finalWPM: document.querySelector("#final-wpm"),
	finalAccuracy: document.querySelector("#final-accuracy"),
	finalCorrectWords: document.querySelector("#final-correct-words"),
	finalIncorrectWords: document.querySelector("#final-incorrect-words"),
	playAgainButton: document.querySelector("#play-again-button"),
	wpmScore: document.querySelector("#wpm-score"),
	accuracyScore: document.querySelector("#accuracy-score"),
};

// =============================================
// FONCTIONS UTILITAIRES
// =============================================
function shuffleArray(array) {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

function getRandomWord(excludeWords = []) {
	const availableWords = GameState.words.filter(
		(word) => !excludeWords.includes(word)
	);
	return availableWords[Math.floor(Math.random() * availableWords.length)];
}

function calculateWPM() {
	if (!GameState.startTime || GameState.correctWords === 0) return 0;

	const elapsedMinutes = (60 - GameState.timeLeft) / 60;
	return Math.round(GameState.correctWords / elapsedMinutes);
}

function calculateAccuracy() {
	if (GameState.totalTyped === 0) return 100;
	return Math.round((GameState.correctWords / GameState.totalTyped) * 100);
}

function updateStats() {
	GameState.wpm = calculateWPM();
	GameState.accuracy = calculateAccuracy();

	DOM.wpmScore.textContent = GameState.wpm;
	DOM.accuracyScore.textContent = GameState.accuracy;
}

// =============================================
// FONCTIONS DU JEU
// =============================================
async function loadWords() {
	try {
		const response = await fetch("french-words.json");
		GameState.words = await response.json();
		setupEventListeners();
	} catch (error) {
		console.error("Erreur lors du chargement des mots :", error);
	}
}

function startGame() {
	resetGameState();
	GameState.startTime = Date.now();
	startTimer();
	displayWords();
	DOM.typingInput.focus();
	GameState.isPlaying = true;
}

function resetGameState() {
	GameState.currentWords = [];
	GameState.score = 0;
	GameState.correctWords = 0;
	GameState.incorrectWords = 0;
	GameState.timeLeft = 60;
	GameState.wpm = 0;
	GameState.accuracy = 100;
	GameState.totalTyped = 0;
	GameState.startTime = null;
	GameState.lastTypedTime = null;

	DOM.correctWordsDisplay.textContent = "0";
	DOM.timeLeftDisplay.textContent = "60";
	DOM.wpmScore.textContent = "0";
	DOM.accuracyScore.textContent = "100";
	DOM.wordDisplayArea.innerHTML = "";
}

function displayWords(count = 5) {
	DOM.wordDisplayArea.innerHTML = "";
	GameState.currentWords = [];

	for (let i = 0; i < count; i++) {
		const word = getRandomWord(GameState.currentWords);
		if (!word) break;

		GameState.currentWords.push(word);
		const span = document.createElement("span");
		span.classList.add("word");
		span.textContent = word;
		DOM.wordDisplayArea.appendChild(span);
	}
}

function startTimer() {
	if (GameState.timerInterval) {
		clearInterval(GameState.timerInterval);
	}

	GameState.timerInterval = setInterval(() => {
		GameState.timeLeft--;
		DOM.timeLeftDisplay.textContent = GameState.timeLeft;
		updateStats();

		if (GameState.timeLeft <= 0) {
			endGame();
		}
	}, 1000);
}

function handleWordInput() {
	const typedWord = DOM.typingInput.value.trim();

	if (!typedWord || !GameState.isPlaying) return;

	GameState.totalTyped++;
	GameState.lastTypedTime = Date.now();

	if (typedWord === GameState.currentWords[0]) {
		handleCorrectWord();
	} else {
		handleIncorrectWord();
	}

	updateStats();
	DOM.typingInput.value = "";
}

function handleCorrectWord() {
	GameState.correctWords++;
	GameState.score++;
	DOM.correctWordsDisplay.textContent = GameState.correctWords;

	// Retirer le mot affiché
	DOM.wordDisplayArea.removeChild(DOM.wordDisplayArea.firstChild);
	GameState.currentWords.shift();

	// Ajouter un nouveau mot
	const nextWord = getRandomWord(GameState.currentWords);
	if (nextWord) {
		GameState.currentWords.push(nextWord);
		const span = document.createElement("span");
		span.classList.add("word");
		span.textContent = nextWord;
		DOM.wordDisplayArea.appendChild(span);
	}
}

function handleIncorrectWord() {
	GameState.incorrectWords++;
	// Vous pourriez ajouter un feedback visuel ici
}

function endGame() {
	clearInterval(GameState.timerInterval);
	GameState.isPlaying = false;

	// Calcul des résultats finaux
	const finalWPM = calculateWPM();
	const finalAccuracy = calculateAccuracy();

	// Affichage des résultats
	DOM.finalWPM.textContent = finalWPM;
	DOM.finalAccuracy.textContent = finalAccuracy;
	DOM.finalCorrectWords.textContent = GameState.correctWords;
	DOM.finalIncorrectWords.textContent = GameState.incorrectWords;

	// Basculer vers l'écran de résultats
	DOM.gameContainer.classList.add("hidden");
	DOM.resultsSummary.classList.remove("hidden");
}

function setupEventListeners() {
	DOM.startResetButton.addEventListener("click", startGame);
	DOM.playAgainButton.addEventListener("click", () => {
		DOM.resultsSummary.classList.add("hidden");
		DOM.gameContainer.classList.remove("hidden");
		startGame();
	});

	DOM.typingInput.addEventListener("keydown", (e) => {
		if (e.code === "Enter") {
			e.preventDefault();
			handleWordInput();
		}
	});
}

// =============================================
// INITIALISATION
// =============================================
loadWords();
