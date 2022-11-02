const cells = document.getElementsByClassName("cell");
const codeInput = document.getElementById("codeInput");
const nameInput = document.getElementById("nameInput");
const startForm = document.getElementById("startForm");
const gameStatus = document.getElementById("gameStatus");

const xMarker = '<img src="x.svg" class="marker" />';
const oMarker = '<img src="o.svg" class="marker" />';

const socket = io();
console.log(socket);

let activeGame = null;
let gameCode = null;
let gameName = null;

for (const cell of cells) {
	cell.addEventListener("click", () => {
		if (!activeGame || activeGame.gameOver) return;
		const code = codeInput.value;
		const cellId = Number(cell.id);
		socket.emit("playMove", code, [cellId / 3, cellId % 3], (success) => {
			if (!success) console.log("Not able to play move");
			else console.log("Move played successfully!");
		});
	});
}

startForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const code = codeInput.value;
	const name = nameInput.value;
	activeGame = null;

	socket.emit("joinGame", code, name, (success) => {
		if (!success) console.log("Not able to create/join game");
		else {
			console.log("Game joined successfully!");
			gameCode = code;
			gameName = name;
		}
	});
});

socket.on("update", (gameState) => updateGame(gameState));

socket.on("terminated", () => {
	updateGame(null);
});

function updateGame(gameState) {
	console.log(gameState);
	if (!gameState) {
		activeGame = null;
		gameCode = null;
	} else {
		activeGame = gameState;
		for (let marker of document.getElementsByClassName("marker"))
			marker.remove();
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				const val = activeGame.gameState[i][j];
				const parentId = i * 3 + j;
				if (val === "X")
					document.getElementById(parentId).innerHTML = xMarker;
				else if (val === "O")
					document.getElementById(parentId).innerHTML = oMarker;
			}
		}
		if (activeGame.gameOver) {
			// TODO: Change bg of winning Trio
			for (let pair of activeGame.winningTrio) {
				const squareId = pair[0] * 3 + pair[1];
				document.getElementById(squareId).style.backgroundColor =
					"green";
			}
		}
	}
	updateStatusMessage();
}

function updateStatusMessage() {
	if (!activeGame || !activeGame.code)
		gameStatus.innerText = "No Current Game Active";
	else if (activeGame.gameOver) gameStatus.innerText = "Game Over!";
	else if (activeGame.code && !activeGame.playerTwoName)
		gameStatus.innerText = "Waiting for Opponent";
	else
		gameStatus.innerText =
			"Playing against '" +
			(gameName === activeGame.playerOneName
				? activeGame.playerTwoName
				: activeGame.playerOneName) +
			"' - " +
			(activeGame.activePlayer === activeGame.activePlayer
				? "Your Move!"
				: "Waiting On Opponent");
}

updateStatusMessage();
