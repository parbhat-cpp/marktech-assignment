import { connectDB } from "../db";
import ExpressServer from "./ExpressServer"
import SocketServer from "./SocketServer";

export default () => {
    // start express server
    const expressServer = new ExpressServer();
    const expressInstance = expressServer.server;
    const expressApp = expressServer.app;

    // start socket server
    const socketServer = new SocketServer(expressInstance, expressApp.locals.userState);
    const socketInstance = socketServer.instance;
    expressServer.initSocket(socketInstance);

    // connect database
    connectDB();
    
    process.on('exit', () => {
        expressServer.close();
        socketServer.close();
    }).on("SIGINT", () => {
        expressServer.close();
        socketServer.close();
    });
}
