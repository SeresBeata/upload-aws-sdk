const express = require("express");
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const app = express();
const port = 3000;
const AWS = require("aws-sdk");
AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
AWS_REGION = process.env.AWS_REGION;
AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
AWS_BUCKET = "my-cool-local-bucket";
RETRIEVE_URL = "http://localhost:4566/my-cool-local-bucket/river.jpg";

const s3Client = new S3Client({
  region: AWS_REGION,
  endpoint: "http://localhost:4566",
  forcePathStyle: true,
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

app.get("/images/download", (req, res) => {
  res.redirect(RETRIEVE_URL);
});

app.get("/images/upload", (req, res) => {
  const file = "./images/river.jpg";
  const fileName = "river.jpg";
  const uploadFile = () => {
    fs.readFile(file, (err, data) => {
      if (err) throw err;
      const params = {
        Bucket: AWS_BUCKET,
        Key: fileName,
        Body: data,
      };
      s3.upload(params, function (s3err, data) {
        if (s3err) throw s3err;
        console.log("File uploaded", data);
      });
    });
  };
  uploadFile();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
