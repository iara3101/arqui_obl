import express from "express";
import crypto from "crypto";
import argon2 from "argon2";
import { Company } from "../models/Company.js";
import { Member } from "../models/Member.js";
import { sendInviteEmail } from "../lib/mailer.js";

export const adminRouter = express.Router();

/**
 * RF1: crear empresa
 * POST /admin/companies
 */
adminRouter.post("/companies", async (req, res) => {
  try {
    const { name, address, websiteUrl, logoUrl } = req.body || {};
    if (!name || !address || !websiteUrl || !logoUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const company = await Company.create({ name, address, websiteUrl, logoUrl });
    return res.status(201).json(company);
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Company name already exists" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});

/**
 * RF2: invitar miembro
 * POST /admin/companies/:companyId/members/invitations
 * body: { email }
 */
adminRouter.post("/companies/:companyId/members/invitations", async (req, res) => {
  try {
    const { companyId } = req.params;
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });

    const company = await Company.findByPk(companyId);
    if (!company) return res.status(404).json({ error: "Company not found" });

    // email único global
    const exists = await Member.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // generar token y guardar hash + expiración (72h)
    const token = crypto.randomBytes(32).toString("hex");
    const inviteTokenHash = await argon2.hash(token);
    const inviteExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await Member.create({
      companyId: company.id,
      email,
      role: "MEMBER",
      status: "INVITED",
      mustResetPassword: true,
      inviteTokenHash,
      inviteExpiresAt,
    });

    // enviar email real
    await sendInviteEmail(email, token);

    return res.status(201).json({ message: "Invitation sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal error" });
  }
});