import express from "express";
import 'dotenv/config';


import morgan from "morgan";

const app = new express();

app.use(express.json());
app.use(morgan('dev'));


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

export default app;