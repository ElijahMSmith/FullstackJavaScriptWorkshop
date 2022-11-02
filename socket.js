import { Game, Player } from "./game";

export default (server) => {
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
			const game = activeGames.get(code);
			if (game) {
				if (game.player2 !== null) {
					callback(false);
					return;
				}
				game.player2 = new Player(socket.id, name, 2);
			} else {
				const newGame = new Game(new Player(socket.id, name, 1));
				activeGames[code] = newGame;
				socket.join(code);
			}

			io.to(code).emit("update", newGame.currentState);
			callback(true);
		});

		socket.on("playMove", (code, location, callback) => {
			console.log("playMove", code, location);
			const game = activeGames.get(code);
			if (
				!game ||
				(game.player1.playerId !== socket.id &&
					game.player2.playerId !== socket.id)
			) {
				callback(false);
				return;
			}

			const playerNum = game.player1.playerId === socket.id ? 1 : 2;

			const newState = game.playMove(playerNum, location);
			if (!moveResult) {
				callback(false);
			} else {
				io.to(code).emit("update", newState);
				callback(true);
			}
		});
	});
};
