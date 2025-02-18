import express, { Request, Response } from "express";
import multer from "multer";
import cors from "cors";

// configures dotenv to work in your application
const app = express();
app.use(cors());

const PORT = 3000;
const upload = multer({ dest: "uploads/" });

app.post("/import", upload.single("arc"), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.file, req.body);
});

app
  .listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
  })
  .on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
  });
