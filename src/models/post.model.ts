import { model, Schema } from "mongoose";

interface IPost {
    userId: any;
    title: string;
    subtitle: string;
    content: string;
    comments: Array<any>;
}

const postSchema = new Schema<IPost>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: false,
        default: "",
    },
    content: {
        type: String,
        default: "",
    },
    comments: {
        type: [Schema.Types.ObjectId],
        ref: "comment",
        default: [],
    }
}, { timestamps: true });

export const Post = model<IPost>("post", postSchema);
