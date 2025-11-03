import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import stopsRouter from "./routes/stops.js";
import searchRouter from "./routes/search.js";
import adsRouter from "./routes/ads.js";
import variantRouter from "./routes/variant.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/", (req, res) =>
  res.json({ status: "API ONDEBUS ativa 🚍", version: "1.0.0" })
);

// v1
app.use("/v1/stops", stopsRouter);
app.use("/v1/search", searchRouter);
app.use("/v1/ads", adsRouter);
app.use("/v1/variant", variantRouter);

// 404
app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[ondebus] a escutar na porta ${PORT}`));
