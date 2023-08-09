import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { extname, join } from "path";
import { Camera, ICamera } from "./models/camera";
import { IImage, Image } from "./models/image";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";

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
    .populate("images", "url -_id")
    .lean()
    .then((cameras) => {
      const camerasWithImageURLs = cameras.map((camera) => ({
        ...camera,
        images: camera.images.map((image: any) => image.url), // Extract the 'url' field from each image
      }));

      res.send(camerasWithImageURLs);
    })
    .catch((error) => {
      res.send(error);
    });
});

app.get("/camera/:id", (req, res) => {
  Camera.findById(req.params.id)
    .populate("images", "url -_id")
    .lean()
    .then((camera) => {
      if (!camera) return res.status(404).send("Camera not found");

      res.send({
        ...camera,
        images: camera.images.map((image: any) => image.url),
      });
    })
    .catch((error) => {
      res.send(error);
    });
});

app.post("/camera", multer({ storage }).array("images"), (req, res) => {
  const images: any[] = [];
  new Camera({
    name: req.body.name,
    status: req.body.status,
    location: req.body.location,
  })
    .save()
    .then((camera) => {
      const saveImagePromises = (req.files as Array<Express.Multer.File>)?.map(
        (file) =>
          new Promise<void>((resolve, reject) => {
            new Image({
              date: new Date(req.body.date || Date.now()),
              camera_id: camera._id,
              url: file.filename,
            })
              .save()
              .then((image) => {
                images.push(image._id);
                resolve();
              })
              .catch((error) => {
                reject(error);
              });
          })
      );

      Promise.all(saveImagePromises)
        .then(() => {
          if (images.length === req.files?.length) {
            camera.images = images;
            camera.save().then((camera) => {
              res.send(camera);
            });
          } else {
            res.send("Some images failed to save.");
          }
        })
        .catch((error) => {
          res.send(error);
        });
    })
    .catch((error) => {
      res.send(error);
    });
});

app.post(
  "/camera/:id/image",
  multer({ storage }).array("images"),
  (req, res) => {
    const images: any[] = [];
    Camera.findById(req.params.id)
      .then((camera) => {
        if (!camera) return res.status(404).send("Camera not found");
        const saveImagePromises = (req.files as Array<Express.Multer.File>).map(
          (file) =>
            new Promise<void>((resolve, reject) => {
              new Image({
                date: new Date(req.body.date || Date.now()),
                camera_id: camera._id,
                url: file.filename,
              })
                .save()
                .then((image) => {
                  images.push(image._id);
                  resolve();
                })
                .catch((error) => {
                  reject(error);
                });
            })
        );

        Promise.all(saveImagePromises)
          .then(() => {
            if (images.length === req.files?.length) {
              camera.images = [...camera.images, ...images];
              camera.save().then((camera) => {
                res.send(camera);
              });
            } else {
              res.send("Some images failed to save.");
            }
          })
          .catch((error) => {
            res.send(error);
          });
      })
      .catch((error) => {
        res.send(error);
      });
  }
);

app.get("/camera/:id/export", (req, res) => {
  const list = "temp.txt";
  Camera.findById(req.params.id)
    .populate("images", "url -_id")
    .lean()
    .then((camera) => {
      if (!camera) return res.status(404).send("Camera not found");
      const images = camera.images.map((image: any) =>
        join(__dirname, "..", "uploads", image.url)
      );

      const command = ffmpeg();

      fs.writeFileSync(
        list,
        images
          .map((imagePath) => `file '${imagePath}'\nduration 0.03333`)
          .join("\n")
      );

      command
        .input(list)
        .inputOptions("-f concat")
        .inputOptions("-safe 0")
        // .outputOptions("-r 1")
        .outputOptions("-framerate 60")
        .outputOptions("-c:v libx264")
        .outputOptions("-pix_fmt yuv420p")
        .output(`./exports/${camera.name + "-" + new Date().toISOString()}.mp4`)
        .on("progress", (progress) => {
          console.log("Processing: " + progress.percent + "% done");
        })
        .on("end", () => {
          console.log("Video export completed");
          // Remove the temporary file after the video export is completed
          fs.unlinkSync(list);
        })
        .on("error", (err) => {
          console.error("Error exporting video:", err);
          // Remove the temporary file if there is an error
          fs.unlinkSync(list);
        })
        .run();

      res.send(camera);
    })
    .catch((error) => {
      res.send(error);
    });
});

mongoose
  .connect("mongodb://admin:secret@localhost:27017/cctv?authSource=admin")
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
