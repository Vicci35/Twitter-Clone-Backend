import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        maxlength: 140,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        }
    ]
})

const Post = mongoose.model("Post", postSchema);
export default Post;