import express from "express";
import { sequelize } from "./config/db.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";

const app = express();
app.use(express.json());

// Health
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// Rutas
app.use("/admin", adminRouter);
app.use("/auth", authRouter);

// Levantar + sync DB mínima
const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // crea/actualiza tablas mínimas
    app.listen(PORT, () => console.log(`API up on :${PORT}`));
  } catch (err) {
    console.error("DB error:", err);
    process.exit(1);
  }
})();