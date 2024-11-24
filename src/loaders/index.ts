import { connectDB } from "../db";
import ExpressServer from "./ExpressServer"
import SocketServer from "./SocketServer";

export default () => {
    // start express server
    const expressServer = new ExpressServer();
    const expressInstance = expressServer.server;

    // start socket server
    const socketServer = new SocketServer(expressInstance);
    const socketInstance = socketServer.instance;
    expressServer.initSocket(socketInstance);

    connectDB();
    process.on('exit', () => {
        expressServer.close();
        socketServer.close();
    }).on("SIGINT", () => {
        expressServer.close();
        socketServer.close();
    });
}
