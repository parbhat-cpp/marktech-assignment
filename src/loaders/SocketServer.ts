import * as SocketIO from 'socket.io';
import { Server } from 'http';
import jwt from "jsonwebtoken";

import config from '../common/config';
import { VerifiedSocket } from '../common/types';
import { socketHandler } from '../routes/socket';

class SocketServer {
    private _io!: SocketIO.Server;

    public constructor(server: Server) {
        this._io = new SocketIO.Server(server, {
            cors: {
                origin: config.SOCKET_URL,
                methods: ['GET', 'POST'],
            }
        });

        this.listen();
    }

    private listen(): void {
        this._io.use((socket: VerifiedSocket, next) => {
            const token = socket.handshake.headers.authorization?.split(" ")[1] as string;

            if (!token) {
                return next(new Error("Authorization Error: No token provided"));
            }

            jwt.verify(token, config.JWT_SECRET as string, (err, decoded) => {
                if (err) {
                    return next(new Error("Authorization Error: invalid token"));
                }

                socket.decoded = decoded;
                next();
            });
        });

        if (this._io) {
            console.log("Socket Server running on port:", config.SOCKET_PORT);

            this._io.listen(config.SOCKET_PORT);
            this._io.on("connection", socketHandler);
        }
    }

    public close(): void {
        this._io.on("end", (socket: VerifiedSocket) => {
            socket.disconnect();
            console.info(new Date(), 'Socket server stopped');
        });
    }

    get instance(): SocketIO.Server {
        return this._io;
    }
}

export default SocketServer;
