"use strict";

import app from "./src/server.js";

import fs from "fs";
import https from "https";

const key = fs.readFileSync("./localhost-key.pem");
const cert = fs.readFileSync("./localhost.pem");


const server = https.createServer({key: key, cert: cert }, app);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is listening on port ${process.env.PORT || 3000}`);
});
