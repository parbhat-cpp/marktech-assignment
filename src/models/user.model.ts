import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface IUser {
    fullname: string;
    email: string;
    password: string;
    username: string;
    isPasswordMatch: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>({
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(this.password, salt);
        this.password = passwordHash;
        next();
    } catch (error: any) {
        next(error);
    }
});

userSchema.methods.isPasswordMatch = async function (password: string) {
    const user = this;
    return bcrypt.compare(password, user.password);
}

export const User = model<IUser>("user", userSchema);
