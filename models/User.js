import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
        unique: true,
    },
    about: {
        type: String,
        default: "",
    },
    hometown: {
        type: String,
        default: "",
    },
    website: {
        type: String,
        default: "",
    },
    occupation: {
        type: String,
        default: "",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    profileImage: {
        type: String,
        default: "",
    }
})

const User = mongoose.model("User", userSchema);

export default User;