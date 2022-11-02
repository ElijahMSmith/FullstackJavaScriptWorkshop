const cells = document.getElementsByClassName("cell");
const codeInput = document.getElementById("codeInput");
const nameInput = document.getElementById("nameInput");
const startForm = document.getElementById("startForm");
const gameStatus = document.getElementById("gameStatus");
const pingButton = document.getElementById("testPing");

const xMarker = '<img src="x.svg" class="marker" />';
const oMarker = '<img src="o.svg" class="marker" />';

const socket = io();

let activeGame = null;
let gameCode = null;
let myNumber = null;

for (const cell of cells) {
	cell.addEventListener("click", () => {
		if (!activeGame || activeGame.gameOver) return;
		const code = codeInput.value;
		const cellId = Number(cell.id);
		socket.emit(
			"playMove",
			code,
			[Math.floor(cellId / 3), cellId % 3],
			(success) => {
				if (!success) console.log("Not able to play move");
				else console.log("Move played successfully!");
			}
		);
	});
}

pingButton.addEventListener("click", () => testPing());

startForm.addEventListener("submit", (e) => {
	e.preventDefault();
	const code = codeInput.value;
	const name = nameInput.value;
	activeGame = null;

	socket.emit("joinGame", code, name, (success, playerNum, gameState) => {
		if (!success) console.log("Not able to create/join game");
		else {
			console.log("Game joined successfully!");
			gameCode = code;
			myNumber = playerNum;
		}
	});
});

socket.on("update", (gameState) => updateGame(gameState));

socket.on("terminated", () => {
	updateGame(null);
});

function updateGame(gameState) {
	console.log(gameState);
	for (let marker of document.querySelectorAll(".marker")) marker.remove();

	if (!gameState) {
		activeGame = null;
		gameCode = null;
		for (let box of document.querySelectorAll(".cell"))
			box.style.backgroundColor = "red";
	} else {
		activeGame = gameState;

		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				const val = activeGame.gameState[i][j];
				if (val === " ") continue;

				const parentId = i * 3 + j;
				let newMarker = document.createElement("img");
				newMarker.classList.add("marker");
				newMarker.style.display = "block";
				if (val === "X") newMarker.src = "x.svg";
				else if (val === "O") newMarker.src = "o.svg";
				document.getElementById(parentId).appendChild(newMarker);
			}
		}
		if (activeGame.gameOver && activeGame.winningTrio) {
			for (let pair of activeGame.winningTrio) {
				const squareId = pair[0] * 3 + pair[1];
				document.getElementById(squareId).style.backgroundColor =
					"green";
			}
		}
	}
	updateStatusMessage();
}

function testPing() {
	console.log("Ping!");
	const start = new Date().getTime();
	fetch("http://localhost:3000/ping", {
		method: "GET", // *GET, POST, PUT, DELETE, etc.
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((res) => res.json())
		.then((data) => {
			const end = new Date().getTime();
			const duration = end - start;
			console.log(data.ping + " - " + duration + "ms");
		})
		.catch((err) => console.error(err));
}

function updateStatusMessage() {
	if (!activeGame) gameStatus.innerText = "No Current Game Active";
	else if (activeGame.gameOver) gameStatus.innerText = "Game Over!";
	else if (!activeGame.playerTwoName || !activeGame.playerOneName)
		gameStatus.innerText = "Waiting For An Opponent";
	else
		gameStatus.innerText =
			"Playing against '" +
			(myNumber === 1
				? activeGame.playerTwoName ?? "Unknown"
				: activeGame.playerOneName ?? "Unknown") +
			"' - " +
			(myNumber === activeGame.activePlayer
				? "Your Move!"
				: "Waiting On Opponent");
}

updateStatusMessage();
