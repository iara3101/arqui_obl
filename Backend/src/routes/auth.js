import express from "express";
import argon2 from "argon2";
import { Member } from "../models/Member.js";

export const authRouter = express.Router();

/**
 * POST /auth/accept-invite
 * body: { token, password }
 */
authRouter.post("/accept-invite", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ error: "Missing token/password" });

    // Buscar miembros en estado INVITED y con token no expirado
    const candidate = await Member.findOne({
      where: { status: "INVITED" },
      order: [["createdAt", "DESC"]], // heurística; el match real es por verify del hash
    });
    if (!candidate || !candidate.inviteTokenHash || !candidate.inviteExpiresAt) {
      return res.status(400).json({ error: "Invalid or expired invite" });
    }
    if (candidate.inviteExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: "Invite expired" });
    }

    const match = await argon2.verify(candidate.inviteTokenHash, token);
    if (!match) return res.status(400).json({ error: "Invalid token" });

    // Setear password y activar. Mantenemos mustResetPassword=true para forzar cambio tras el primer login real
    const passwordHash = await argon2.hash(password);
    candidate.passwordHash = passwordHash;
    candidate.status = "ACTIVE";
    candidate.mustResetPassword = true;
    candidate.inviteTokenHash = null;
    candidate.inviteExpiresAt = null;
    await candidate.save();

    return res.status(200).json({ message: "Invite accepted. You can log in." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});