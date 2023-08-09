import mongoose from "mongoose";

export interface ICamera extends mongoose.Document {
  name: string;
  status: string;
  location: string;
  images: mongoose.Schema.Types.ObjectId[];
}

const cameraSchema = new mongoose.Schema<ICamera>(
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
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Camera = mongoose.model<ICamera>("Camera", cameraSchema);
