import Express from "express";
import { Server } from "socket.io";
import http from "http";

const app = Express();
const server = http.createServer(app);
const io = new Server(server);
const port = 3000;

app.use("/", Express.static("client"));
app.use("/api/connect", (req, res) => {
	res.status(200).send({ hello: "world" });
});

server.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});

export { io };
