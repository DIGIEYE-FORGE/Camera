import mongoose from "mongoose";

export interface IImage extends Document {
  url: string;
  date: Date;
  camera_id: mongoose.Schema.Types.ObjectId;
}

const imageSchema = new mongoose.Schema<IImage>(
  {
    date: {
      type: Date,
    },
    url: {
      type: String,
    },
    camera_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camera",
    },
  },
  {
    timestamps: true,
  }
);

export const Image = mongoose.model<IImage>("Image", imageSchema);
