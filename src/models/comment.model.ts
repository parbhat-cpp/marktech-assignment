import { model, Schema } from "mongoose";

interface IComment {
    userId: string;
    comment: string;
}

const commentSchema = new Schema<IComment>({
    userId: {
        type: String,
        required: true,
    },
    comment: {
        type: String,
        required: true,
    }
}, { timestamps: true });

export const Comment = model("comment", commentSchema);
