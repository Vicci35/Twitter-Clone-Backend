import mongoose from "mongoose";

const followSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //Den som följer
    required: true,
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", //dem som blir följd
    required: true,
  },
});

const Follow = mongoose.model("Follow", followSchema);

export default Follow;
