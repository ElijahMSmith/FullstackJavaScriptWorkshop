class Game {
	constructor(player1, player2) {
		this.player1 = player1 ?? null; // X
		this.player2 = player2 ?? null; // O
		this.activePlayer = 1;
		this.gameState = [
			[" ", " ", " "],
			[" ", " ", " "],
			[" ", " ", " "],
		];
		this.winningTrio = undefined;
		this.gameOver = false;
	}

	playMove(playerNum, location) {
		if (this.gameOver) return null;
		if (playerNum !== this.activePlayer) return null;

		if (
			!location ||
			typeof location.row !== "number" ||
			typeof location.col !== "number"
		)
			return null;

		this.gameState[location.row][location.col] =
			playerNum === 1 ? "X" : "O";
		this.checkIfGaveOver();
		if (!this.gameOver) this.activePlayer = (this.activePlayer + 1) % 2;

		return this.currentState;
	}

	get currentState() {
		return {
			playerOneName: this.player1?.playerName,
			playerTwoName: this.player2?.playerName,
			activePlayer: this.activePlayer,
			gameState: this.gameState,
			gameOver: this.gameOver,
			winningTrio: this.winningTrio,
		};
	}

	checkIfGaveOver() {
		const gs = this.gameState;
		for (let i = 0; i < 3; i++) {
			if ((gs[i][0] === gs[i][1]) === gs[i][2]) {
				this.winningTrio = [
					[i, 0],
					[i, 1],
					[i, 2],
				];
				this.gameOver = true;
				return;
			}
		}
		for (let j = 0; j < 3; j++) {
			if ((gs[0][j] === gs[1][j]) === gs[2][j]) {
				this.winningTrio = [
					[0, j],
					[1, j],
					[2, j],
				];
				this.gameOver = true;
				return;
			}
		}
		if ((gs[0][0] === gs[1][1]) === gs[2][2]) {
			this.winningTrio = [
				[0, 0],
				[1, 1],
				[2, 2],
			];
			this.gameOver = true;
		} else if ((gs[0][2] === gs[1][1]) === gs[2][0]) {
			this.winningTrio = [
				[0, 2],
				[1, 1],
				[2, 0],
			];
			this.gameOver = true;
		}
	}
}

class Player {
	constructor(playerId, playerName, playerNum) {
		this.playerId = playerId;
		this.playerName = playerName;
		this.playerNum = playerNum;
	}
}

export { Game, Player };
