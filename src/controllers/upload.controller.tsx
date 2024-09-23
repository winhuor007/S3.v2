import express, { Request, Response } from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import configs from "../config"; // Import your config file

const router = express.Router();

// Create S3 client using the configs
const s3 = new S3Client({
  region: configs.awsRegion,
  credentials: {
    accessKeyId: configs.awsAccessKeyId,
    secretAccessKey: configs.awsSecretAccessKey,
  },
});

// File filter to restrict file types to images only
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(
      new Error("Invalid file type. Only JPG, PNG, and GIF files are allowed.")
    );
  }
};

// Set up multer with S3 and file filter
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: configs.awsS3Bucket,
    key: function (
      _req: Request,
      file: Express.Multer.File,
      cb: (error: any, key?: string) => void
    ) {
      // Use the original filename as the key
      cb(null, file.originalname);
    },
  }),
  fileFilter: fileFilter, // Apply the file filter
  limits: { fileSize: 5 * 1024 * 1024 }, // Optional: limit file size to 5 MB
});

// Route to handle file uploads
router.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  console.log(req.file); // Check the uploaded file details
  if (!req.file) {
    return res.status(400).send("No file uploaded or invalid file type.");
  }
  const location = (req.file as any).location; // The file URL in S3
  res.send(`Successfully uploaded ${req.file.originalname} at ${location}`);
});

export default router;
