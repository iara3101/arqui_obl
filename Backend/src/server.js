import express from "express";
const app = express();

app.get("/health", (_req, res) => {
  // Checklist RNF2: vivo y listo para recibir requests
  res.status(200).json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API up on :${PORT}`));