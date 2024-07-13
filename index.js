const express = require("express");
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { NodeHttpHandler } = require("@aws-sdk/node-http-handler");
const fs = require("fs");
// const fileUpload = require("express-fileupload");
const app = express();
const port = 3000;
const AWS = require("aws-sdk");
// Require the upload middleware
const upload = require("./upload");
AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
AWS_REGION = process.env.AWS_REGION;
AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
AWS_BUCKET = "my-cool-local-bucket";
RETRIEVE_URL = "http://localhost:4566/my-cool-local-bucket/river.jpg";

const s3Client = new S3Client({
  region: AWS_REGION,
  endpoint: "http://localhost:4566",
  forcePathStyle: true,
  requestHandler: new NodeHttpHandler(),
});

const s3 = new AWS.S3({
  endpoint: "http://localhost:4566", // required for localstack
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, // required for localstack
});

app.get("/images", (req, res) => {
  const listObjectsParams = {
    Bucket: AWS_BUCKET,
  };
  s3Client
    .send(new ListObjectsV2Command(listObjectsParams))
    .then((listObjectsResponse) => {
      res.send(listObjectsResponse);
    });
});

app.get("/download", (req, res) => {
  const downloadFilePath = "downloads/";
  console.log(req.query);
  const key = req.query.file;
  const downloadImage = async (path, key) => {
    try {
      // Get the image stream from S3
      const data = await s3Client.send(
        new GetObjectCommand({ Bucket: AWS_BUCKET, Key: key })
      );
      // console.log(data);
      // Save the image to local disk
      const writeStream = fs.createWriteStream(`${path}${key}`);
      console.log(writeStream);
      if (data.Body) {
        data.Body.pipe(writeStream);
        // console.log(data.Body);
        res.send("Downloaded");
      }
    } catch (err) {
      console.error("Error", err);
    }
  };
  downloadImage(downloadFilePath, key);
});

// Set up a route for file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  // Handle the uploaded file
  // console.log(req.file);
  const IMAGE_PATH = req.file.path;
  const IMAGE_KEY = req.file.filename;
  // const input = {
  //   Body: IMAGE_PATH,
  //   Bucket: AWS_BUCKET,
  //   Key: { IMAGE_KEY },
  // };
  // s3Client.send(new PutObjectCommand(input)).then((PutObjectResponse) => {
  //   res.send(PutObjectResponse);
  // });
  const uploadFile = () => {
    fs.readFile(IMAGE_PATH, (err, data) => {
      if (err) throw err;
      const params = {
        Bucket: AWS_BUCKET,
        Key: IMAGE_KEY,
        Body: data,
      };
      s3.upload(params, function (s3err, data) {
        if (s3err) throw s3err;
        console.log("File uploaded", data);
      });
    });
  };
  uploadFile();
  res.json({ message: "File uploaded successfully!" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
