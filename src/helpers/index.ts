import crypto from "crypto";
import dotenv from "dotenv";
import * as fs from "fs";
import path from "path";

dotenv.config();

const SECRET = "ALE-REST-API";

export const authentication = (salt: string, password: string): string => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};

export const random = () => crypto.randomBytes(128).toString("base64");

export const base64ToPng = async (base64String: string, outputPath: string) => {
  if (!base64String || !outputPath) {
    console.error("it is neccesary base64String and outputPath");
    return;
  }

  const srcFolderPath = path.join(__dirname, "..", "..");
  const qrFolderPath = path.join(srcFolderPath, "img");
  const fullOutputPath = path.join(qrFolderPath, outputPath);

  const data = base64String.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(data, "base64");

  if (!fs.existsSync(path.join(srcFolderPath, "img"))) {
    fs.mkdirSync(path.join(srcFolderPath, "img"), { recursive: true });
  }
  if (!fs.existsSync(path.join(qrFolderPath, "qr"))) {
    fs.mkdirSync(path.join(qrFolderPath, "qr"), { recursive: true });
  }

  fs.writeFileSync(fullOutputPath, buffer);
};
