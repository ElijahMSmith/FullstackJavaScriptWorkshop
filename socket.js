import { io } from "./index";
import Game from "./game";

io.on("connection", (socket) => {
	console.log("Connected socket " + socket.id);
});
