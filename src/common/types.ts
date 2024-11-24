import { Request } from 'express';
import * as SocketIO from 'socket.io';

export interface VerifiedSocket extends SocketIO.Socket {
    decoded?: any;
}

export interface VerifiedRequest extends Request {
    user?: any;
}
