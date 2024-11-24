import { VerifiedSocket } from "../../common/types";

const users = new Map<string, string>;

export const socketHandler = (socket: VerifiedSocket) => {
    const user = socket.decoded;
    const sendingUserId = user._id;
    // on connection mapping user id with their socket id
    users.set(sendingUserId, socket.id);

    // basic chat implementation
    socket.on("send-message", (receivingUserId, message) => {
        const receiverSocketId = users.get(receivingUserId) as string;

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
            _id: user?._id,
            username: user?.username,
            fullname: user?.fullname,
            message: message,
        });
    });

    // Notify user on new comment
    socket.on("notify-comment", (userId) => {
        const receiverSocketId = users.get(userId) as string;

        if (!receiverSocketId) {
            socket.emit("user-not-active", { "message": "User not active" });
            return;
        }

        socket.to(receiverSocketId).emit("get-comment-notification", {
            "message": "notify"
        });
    });

    socket.on("disconnect", () => {
        // remove user
        users.delete(sendingUserId);
    });
}
