import { Game, Player } from "./game.js";
import { Server } from "socket.io";

const startSocketServer = (server) => {
	const io = new Server(server);
	const activeGames = new Map();

	io.on("connection", (socket) => {
		console.log("Connected socket " + socket.id);
		socket.on("disconnecting", () => {
			// Terminate games and disconnect all players if
			// disconnecting socket was participating
			console.log("Disconnecting socket " + socket.id);
			activeGames.forEach((game, code) => {
				if (
					game.player1?.playerId === socket.id ||
					game.player2?.playerId === socket.id
				) {
					io.to(code).emit("terminated");
					io.socketsLeave(code);
					activeGames.delete(code);
				}
			});
		});

		socket.on("joinGame", (code, name, callback) => {
			console.log("joinGame", code, name);
			let game = activeGames.get(code);
			let playerNum = -1;

			if (game) {
				// If game exists and a slot is open, insert as player 2
				if (game.player2 !== null) {
					callback(false, -1);
					return;
				}
				game.player2 = new Player(socket.id, name, 2);
				playerNum = 2;
			} else {
				// Create and store new game, fill as player 1
				game = new Game(new Player(socket.id, name, 1));
				activeGames.set(code, game);
				playerNum = 1;
			}

			// Terminate and disconnect anyone involved in games the user is currently in
			activeGames.forEach((otherGame, otherCode) => {
				if (
					otherCode !== code &&
					(otherGame.player1.playerId === socket.id ||
						otherGame.player2.playerId === socket.id)
				) {
					io.to(otherCode).emit("terminated");
					io.socketsLeave(otherCode);
					activeGames.delete(otherCode);
				}
			});
			// Join to new/existing game room and send updated player config
			socket.join(code);
			io.to(code).emit("update", game.currentState);
			callback(true, playerNum);
		});

		socket.on("playMove", (code, location, callback) => {
			console.log("playMove", code, location);
			let game = activeGames.get(code);

			// Game doesn't exist or isn't full yet
			if (!game || !game.player1 || !game.player2) {
				callback(false);
				return;
			}

			const playerNum = game.player1.playerId === socket.id ? 1 : 2;

			// Play the new move
			const newState = game.playMove(playerNum, location);
			if (!newState) {
				// Move didn't work
				callback(false);
			} else {
				// Move worked, terminate game if it is now over so room is reusable
				io.to(code).emit("update", newState);
				if (newState.gameOver) {
					io.socketsLeave(code);
					activeGames.delete(code);
				}
				callback(true);
			}
		});
	});
};

export { startSocketServer };
