import { Game, Player } from "./game.js";
import { Server } from "socket.io";

const startSocketServer = (server) => {
	const io = new Server(server);
	const activeGames = new Map();

	io.on("connection", (socket) => {
		console.log("Connected socket " + socket.id);
		socket.on("disconnecting", () => {
			console.log("Disconnecting socket " + socket.id);
			activeGames.forEach((game, code) => {
				if (
					game.player1.playerId === socket.id ||
					game.player2.playerId === socket.id
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
				if (game.player2 !== null) {
					callback(false, -1);
					return;
				}
				game.player2 = new Player(socket.id, name, 2);
				playerNum = 2;
			} else {
				game = new Game(new Player(socket.id, name, 1));
				activeGames.set(code, game);
				playerNum = 1;
			}

			socket.join(code);
			io.to(code).emit("update", game.currentState);
			callback(true, playerNum, game.currentState);
		});

		socket.on("playMove", (code, location, callback) => {
			console.log("playMove", code, location);
			let game = activeGames.get(code);

			// If there is no game, or the game only has one player, fail
			if (!game || !game.player1 || !game.player2) {
				callback(false);
				return;
			}

			const playerNum = game.player1.playerId === socket.id ? 1 : 2;

			const newState = game.playMove(playerNum, location);
			if (!newState) {
				callback(false);
			} else {
				io.to(code).emit("update", newState);
				callback(true);
			}
		});
	});
};

export { startSocketServer };
