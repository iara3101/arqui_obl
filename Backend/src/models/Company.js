import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db.js";

export class Company extends Model {}

Company.init(
  {
    name: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    address: { type: DataTypes.STRING(255), allowNull: false },
    websiteUrl: { type: DataTypes.STRING(255), allowNull: false },
    logoUrl: { type: DataTypes.STRING(255), allowNull: false },
  },
  { sequelize, modelName: "company", tableName: "companies", timestamps: true }
);