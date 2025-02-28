import cors from "cors";
import express from "express";
import multer from "multer";
import dbconnection from "./db/connect";
import { archerManager } from "./model/archer-manager";
import { archerRepo } from "./db/archerRepo";
import { distinctionRepo } from "./db/distinctionRepo";
import "dotenv/config";
import EncryptionUtils from "./model/encryption-utils";
import { authorizationManager } from "./model/authorization-manager";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const upload = multer({ dest: "uploads/" });

const ADMIN_ROLE = "ADMIN";

app.post("/users/authenticate", async (req, res) => {
  const input = req.body as { noLicence: string; password: string };
  const encP = EncryptionUtils.encode(input.password);
  const user = await archerRepo.authenticate(input.noLicence, encP);
  if (user) {
    res.send({
      noLicence: user.noLicence,
      nom: user.nom,
      prenom: user.prenom,
      token: EncryptionUtils.encode(user.id!.toString()),
    });
  } else {
    res.status(400).send({ message: "Username or password is incorrect" });
  }
});

async function checkRole(role: string, req: any, res: any): Promise<boolean> {
  const user = await authorizationManager.authorizeUser(
    getAuthorizationHeader(req)
  );
  if (user === null || (role !== "" && user.role !== role)) {
    res.status(401).send({ message: "Unauthorized" });
    return false;
  }
  return true;
}

app.post("/import", upload.single("arc"), async (req, res, next) => {
  if (await checkRole(ADMIN_ROLE, req, res)) {
    await archerManager.import(req.file!.path);
    res.send({ status: "File uploaded successfully" });
  }
});

app.post("/archers/distinction/:id/status", async (req, res, next) => {
  if (await checkRole(ADMIN_ROLE, req, res)) {
    const input = req.body as { status: string };
    await distinctionRepo.updateStatus(parseInt(req.params.id), input.status);
    res.send({ status: "Status updated successfully !" });
  }
});

app.get("/archers", async (req, res) => {
  if (await checkRole(ADMIN_ROLE, req, res)) {
    const archers = await archerRepo.getAll();
    res.send(archers);
  }
});

app.get("/archers/distinctions", async (req, res) => {
  if (await checkRole(ADMIN_ROLE, req, res)) {
    res.send(await distinctionRepo.getAllWithResultat());
  }
});

app.get("/distinctions/to-order", async (req, res) => {
  if (await checkRole(ADMIN_ROLE, req, res)) {
    res.send(await distinctionRepo.getToOrder());
  }
});

app.get("/archer/:id/details", async (req, res) => {
  if (await checkRole("", req, res)) {
    res.send(await archerRepo.getArcherDetails(parseInt(req.params.id)));
  }
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

function getAuthorizationHeader(req: any): string {
  return req.header("Authorization") || "";
}
