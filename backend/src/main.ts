import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { extname } from "path";
import { Camera } from "./models/camera";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + extname(file.originalname));
  },
});

app.get("/camera", (req, res) => {
  Camera.find()
    .then((cameras) => {
      res.send(cameras);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/camera/:id", (req, res) => {
  Camera.findById(req.params.id)
    .then((camera) => {
      res.send(camera);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.post("/camera", multer({ storage }).array("images"), (req, res) => {
  new Camera({
    name: req.body.name,
    status: req.body.status,
    location: req.body.location,
    images: (req.files as Array<Express.Multer.File>)?.map(
      (file) => file.filename
    ),
  })
    .save()
    .then((camera) => {
      res.send(camera);
    });
});

app.patch("/camera/:id", multer({ storage }).array("images"), (req, res) => {
  Camera.findById(req.params.id)
    .then((camera) => {
      if (!camera) return res.status(404).send("Camera not found");
      camera.name = req.body.name;
      camera.status = req.body.status;
      camera.location = req.body.location;
      camera.images = [
        ...camera.images,
        ...(req.files as Array<Express.Multer.File>)?.map(
          (file) => file.filename
        ),
      ];

      camera.save().then((camera) => {
        res.send(camera);
      });
    })
    .catch((error) => {
      res.send(error);
    });
});

mongoose
  .connect("mongodb://admin:secret@localhost:27017")
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server
    app.listen(3000, () => {
      console.log(`Server is running on port 3000`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
