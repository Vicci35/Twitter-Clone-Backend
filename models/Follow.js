import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //Den som följer
      require: true,
    },
    followeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //dem som blir följd
      require: true,
    },
  },
  { timestamps: true }
);

const Follow = mongoose.model("Follow", followSchema);

export default Follow;
