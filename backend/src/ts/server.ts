import cors from "cors";
import express from "express";
import multer from "multer";
import dbconnection from "./db/connect";
import { archerManager } from "./model/archer-manager";
import { archerRepo } from "./db/archerRepo";
import { resultatRepo } from "./db/resultatRepo";
import { distinctionRepo } from "./db/distinctionRepo";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const upload = multer({ dest: "uploads/" });

app.post("/import", upload.single("arc"), async (req, res, next) => {
  await archerManager.import(req.file!.path);
  res.send({ status: "File uploaded successfully" });
});

app.post("/archers/distinction/:id/status", async (req, res, next) => {
  const input = req.body as { status: string };
  await distinctionRepo.updateStatus(parseInt(req.params.id), input.status);
  res.send({ status: "Status updated successfully" });
});

app.get("/archers", async (req, res) => {
  res.send(await archerRepo.getAll());
});

app.get("/archers/max-score", async (req, res) => {
  res.send(await resultatRepo.getBestResults());
});

app.get("/archers/distinctions", async (req, res) => {
  res.send(await distinctionRepo.getAllWithResultat());
});

app
  .listen(PORT, async () => {
    console.log("Server starting, testing connection...");
    try {
      await dbconnection.authenticate();
      console.log("Connection has been established successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
    console.log("Server running at PORT: ", PORT);
  })
  .on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
  });
