import mongoose from "mongoose";

const cameraSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    location: {
      type: String,
    },
    images: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

export const Camera = mongoose.model("Camera", cameraSchema);
