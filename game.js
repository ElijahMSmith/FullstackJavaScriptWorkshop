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
		if (!Array.isArray(location) || !location.length === 2) return null;
		if (this.gameState[location[0]][location[1]] !== " ") return null;

		this.gameState[location[0]][location[1]] = playerNum === 1 ? "X" : "O";
		this.checkIfGaveOver();
		if (!this.gameOver) this.activePlayer = this.activePlayer === 1 ? 2 : 1;

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

		for (let s = 0; s < 2; s++) {
			const symbol = s === 0 ? "X" : "O";
			for (let i = 0; i < 3; i++) {
				if (
					gs[i][0] === symbol &&
					gs[i][1] === symbol &&
					gs[i][2] === symbol
				) {
					this.winningTrio = [
						[i, 0],
						[i, 1],
						[i, 2],
					];
					this.gameOver = true;
					return;
				}

				if (
					gs[0][i] === symbol &&
					gs[1][i] === symbol &&
					gs[2][i] === symbol
				) {
					this.winningTrio = [
						[0, i],
						[1, i],
						[2, i],
					];
					this.gameOver = true;
					return;
				}
			}

			if (
				gs[0][0] === symbol &&
				gs[1][1] === symbol &&
				gs[2][2] === symbol
			) {
				this.winningTrio = [
					[0, 0],
					[1, 1],
					[2, 2],
				];
				this.gameOver = true;
				return;
			}
			if (
				gs[0][2] === symbol &&
				gs[1][1] === symbol &&
				gs[2][0] === symbol
			) {
				this.winningTrio = [
					[0, 2],
					[1, 1],
					[2, 0],
				];
				this.gameOver = true;
				return;
			}
		}

		let count = 0;
		for (let i = 0; i < 3; i++)
			for (let j = 0; j < 3; j++) if (gs[i][j] !== " ") count++;
		if (count === 9) {
			this.winningTrio = null;
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
