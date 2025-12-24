import express from "express";
import {
  getGeneralSettings,
  updateGeneralSettings,
  getAppIcon,
} from "../modules/generalsettings.js";

const router = express.Router();

router.get("/", getGeneralSettings);

router.patch("/", updateGeneralSettings);

router.get("/icon", getAppIcon);

export default router;
