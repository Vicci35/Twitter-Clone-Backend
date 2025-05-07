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
        defaut: "",
    },
    hometown: {
        type: String,
        defaut: "",
    },
    website: {
        type: String,
        defaut: "",
    },
    occupation: {
        type: String,
        defaut: "",
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
    }]
})

const User = mongoose.model("User", userSchema);

export default User;