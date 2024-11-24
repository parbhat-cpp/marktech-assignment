import express from 'express';
import * as SocketIO from "socket.io";
import { createServer, Server } from "http";
import cors from "cors";

import config from '../common/config';
import routes from "../routes/rest";
import { routeNotFound } from '../middlewares/route-not-found';

class ExpressServer {
    private _app!: express.Application;
    private _port!: number;
    private _server!: Server;

    public constructor() {
        this.listen();
    }

    private listen(): void {
        this._app = express();

        this._app.use(express.urlencoded({ extended: false }));
        this._app.use(express.json());
        this._app.use(cors());

        this._app.use('/api', routes);
        this._app.use("*", routeNotFound);

        this._port = config.SERVER_PORT;
        this._server = createServer(this._app);

        this._server.listen(this._port, () => {
            console.log("Running Express Server on port:", this._port);
        });
    }

    public close(): void {
        this._server.close((err) => {
            if (err) {
                throw Error();
            }

            console.info(new Date(), "Express Server Stopped");
        })
    }

    public initSocket(socket: SocketIO.Server): void {
        this._app.set('socket', socket);
    }

    get server(): Server {
        return this._server;
    }
}

export default ExpressServer;
