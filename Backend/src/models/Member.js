import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";
import { Company } from "./Company.js";

export class Member extends Model {}

Member.init(
  {
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: true },
    role: {
      type: DataTypes.ENUM("ADMIN", "MEMBER"),
      allowNull: false,
      defaultValue: "MEMBER",
    },
    status: {
      type: DataTypes.ENUM("INVITED", "ACTIVE", "DISABLED"),
      allowNull: false,
      defaultValue: "INVITED",
    },
    mustResetPassword: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    inviteTokenHash: { type: DataTypes.STRING(255), allowNull: true },
    inviteExpiresAt: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "member", tableName: "members", timestamps: true }
);

// Relaciones
Company.hasMany(Member, { foreignKey: "companyId" });
Member.belongsTo(Company, { foreignKey: "companyId" });