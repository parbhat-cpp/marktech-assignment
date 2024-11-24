import * as SocketIO from 'socket.io';
import { Server } from 'http';
import jwt from "jsonwebtoken";

import config from '../common/config';
import { VerifiedSocket } from '../common/types';

class SocketServer {
    private _io!: SocketIO.Server;
    public sharedUserState: any;

    public constructor(server: Server, sharedUserState: any) {
        this._io = new SocketIO.Server(server, {
            cors: {
                origin: config.SOCKET_URL,
                methods: ['GET', 'POST'],
            }
        });

        this.sharedUserState = sharedUserState;

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
            this._io.on("connection", (socket: VerifiedSocket) => {
                const currentUser = socket.decoded;
                const currentUserId = currentUser._id;

                this.sharedUserState.users[currentUserId] = socket.id;

                // basic chat implementation
                socket.on("send-message", (receivingUserId, message) => {
                    const receiverSocketId = this.sharedUserState.users[receivingUserId] as string;

                    if (!message) {
                        // send to sending user
                        socket.emit("empty-message", { "error": "empty message" });
                        return;
                    }

                    if (!receiverSocketId) {
                        socket.emit("user-not-active", { "message": "receiving user not active right" });
                        return;
                    }

                    socket.to(receiverSocketId).emit("receive-message", {
                        _id: currentUser?._id,
                        username: currentUser?.username,
                        fullname: currentUser?.fullname,
                        message: message,
                    });
                });

                socket.on("disconnect", () => {
                    delete this.sharedUserState.users[currentUserId];
                });
            });
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
