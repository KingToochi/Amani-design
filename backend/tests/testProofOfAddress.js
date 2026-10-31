import fs from "fs";
import { verifyProofOfAddress } from "../services/proofOfAddressService.js";

const imageBuffer = fs.readFileSync(
  "./proofofaddress.jpeg"
);

const userAddress = "10C NIBO STREET";

const result = await verifyProofOfAddress(
  imageBuffer,
  userAddress
);

console.log("Proof of Address Result:", result);