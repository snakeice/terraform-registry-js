import exp from "constants";
import express from "express";
import serverless from "serverless-http";
import 'dotenv/config';


const app = new express();

app.use(express.json());


const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!</h1>");
  res.end();
});

import { registry } from "./terraform.js";

registry(router);


app.use("/.netlify/functions/", router);
app.use(router)

app.handler = serverless(app);
export default app;