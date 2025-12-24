import { PrismaClient } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import ResponseFormatter from "../../helpers/responseFormater.js";
import ApiError from "../../errors/ApiError.js";
import { FileManager } from "../../helpers/FilleManager.js";

const prisma = new PrismaClient();

async function getGeneralSettings(req, res, next) {
  try {
    const settings = await prisma.generalSetting.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      return ResponseFormatter.error(
        res,
        new ApiError(
          StatusCodes.NOT_FOUND,
          "General settings not found. Please initialize settings."
        )
      );
    }

    return ResponseFormatter.success(
      res,
      settings,
      "General settings retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
}

async function updateGeneralSettings(req, res, next) {
  try {
    // console.log("Update request received with body:", JSON.stringify(req.body, null, 2));

    const {
      company_name,
      company_logo,
      company_icon,
      company_address,
      company_phone,
      company_trn,
      default_currency,
      currency_sign,
      file_storage_type,
      api_key,
      amazon_s3_access_key,
      amazon_s3_secret_key,
      amazon_s3_bucket,
      amazon_s3_region,
      cloudinary_cloud_name,
      cloudinary_api_key,
      cloudinary_api_secret,
    } = req.body;

    // Ensure general settings record exists (create with id:1 if it doesn't)
    let existingSettings = await prisma.generalSetting.findUnique({
      where: { id: 1 },
    });

    if (!existingSettings) {
      existingSettings = await prisma.generalSetting.create({
        data: { id: 1 },
      });
    }

    const updateData = {};

    if (company_name) updateData.company_name = company_name;
    if (company_address) updateData.company_address = company_address;
    if (company_phone) updateData.company_phone = company_phone;
    if (company_trn) updateData.company_trn = company_trn;
    if (default_currency) updateData.default_currency = default_currency;
    if (currency_sign) updateData.currency_sign = currency_sign;
    if (file_storage_type) updateData.file_storage_type = file_storage_type;
    if (api_key) updateData.api_key = api_key;
    if (amazon_s3_access_key)
      updateData.amazon_s3_access_key = amazon_s3_access_key;
    if (amazon_s3_secret_key)
      updateData.amazon_s3_secret_key = amazon_s3_secret_key;
    if (amazon_s3_bucket) updateData.amazon_s3_bucket = amazon_s3_bucket;
    if (amazon_s3_region) updateData.amazon_s3_region = amazon_s3_region;
    if (cloudinary_cloud_name)
      updateData.cloudinary_cloud_name = cloudinary_cloud_name;
    if (cloudinary_api_key) updateData.cloudinary_api_key = cloudinary_api_key;
    if (cloudinary_api_secret)
      updateData.cloudinary_api_secret = cloudinary_api_secret;

    // Handle company_logo update - same pattern as profilePicture
    if (company_logo) {
      // Only process if changed
      if (
        company_logo &&
        company_logo !== (existingSettings?.company_logo || null)
      ) {
        try {
          const result = await FileManager.normal({ url: company_logo });
          updateData.company_logo = result.url;

          // Delete old logo if it exists
          if (existingSettings && existingSettings.company_logo) {
            try {
              await FileManager.delete(existingSettings.company_logo);
            } catch (e) {
              // Log error but don't block update
              console.error("Failed to delete old company logo:", e.message);
            }
          }
        } catch (e) {
          return next(
            new ApiError(400, "Failed to process company logo: " + e.message)
          );
        }
      } else if (!company_logo) {
        // Delete old logo if removing it
        if (existingSettings && existingSettings.company_logo) {
          try {
            await FileManager.delete(existingSettings.company_logo);
          } catch (e) {
            console.error("Failed to delete company logo:", e.message);
          }
        }
        updateData.company_logo = null;
      }
    }

    // Handle company_icon update - same pattern as company_logo
    if (company_icon) {
      // Only process if changed
      if (
        company_icon &&
        company_icon !== (existingSettings?.company_icon || null)
      ) {
        try {
          const result = await FileManager.normal({ url: company_icon });
          updateData.company_icon = result.url;

          // Delete old icon if it exists
          if (existingSettings && existingSettings.company_icon) {
            try {
              await FileManager.delete(existingSettings.company_icon);
            } catch (e) {
              // Log error but don't block update
              console.error("Failed to delete old company icon:", e.message);
            }
          }
        } catch (e) {
          return next(
            new ApiError(400, "Failed to process company icon: " + e.message)
          );
        }
      } else if (!company_icon) {
        // Delete old icon if removing it
        if (existingSettings && existingSettings.company_icon) {
          try {
            await FileManager.delete(existingSettings.company_icon);
          } catch (e) {
            console.error("Failed to delete company icon:", e.message);
          }
        }
        updateData.company_icon = null;
      }
    }

    if (file_storage_type) {
      const validStorageTypes = ["local", "amazon_s3", "cloudinary"];
      if (!validStorageTypes.includes(file_storage_type)) {
        return ResponseFormatter.error(
          res,
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Invalid file_storage_type. Must be one of: local, amazon_s3, cloudinary"
          )
        );
      }
    }

    if (default_currency) {
      if (!/^[A-Z]{3}$/.test(default_currency)) {
        return ResponseFormatter.error(
          res,
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Invalid currency code. Must be 3 uppercase letters (e.g., USD, EUR, GBP)"
          )
        );
      }
    }

    if (currency_sign && currency_sign.trim() === "") {
      return ResponseFormatter.error(
        res,
        new ApiError(StatusCodes.BAD_REQUEST, "Currency sign cannot be empty")
      );
    }

    if (file_storage_type === "amazon_s3") {
      if (
        !amazon_s3_access_key ||
        !amazon_s3_secret_key ||
        !amazon_s3_bucket ||
        !amazon_s3_region
      ) {
        return ResponseFormatter.error(
          res,
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Amazon S3 requires: access_key, secret_key, bucket, region"
          )
        );
      }
    }

    if (file_storage_type === "cloudinary") {
      if (
        !cloudinary_cloud_name ||
        !cloudinary_api_key ||
        !cloudinary_api_secret
      ) {
        return ResponseFormatter.error(
          res,
          new ApiError(
            StatusCodes.BAD_REQUEST,
            "Cloudinary requires: cloud_name, api_key, api_secret"
          )
        );
      }
    }

    const settings = await prisma.generalSetting.upsert({
      where: { id: 1 },
      update: updateData,
      create: { id: 1, ...updateData },
    });

    return ResponseFormatter.success(
      res,
      settings,
      "General settings updated successfully"
    );
  } catch (error) {
    // console.error("ERROR in updateGeneralSettings:", error);
    // console.error("Error message:", error.message);
    // console.error("Error code:", error.code);
    // console.error("Error stack:", error.stack);

    if (error.code === "P2002") {
      return ResponseFormatter.error(
        res,
        new ApiError(StatusCodes.CONFLICT, "API key already exists")
      );
    }
    next(error);
  }
}

async function getAppIcon(req, res, next) {
  try {
    const settings = await prisma.generalSetting.findUnique({
      where: { id: 1 },
      select: { company_icon: true, company_name: true },
    });

    if (!settings || !settings.company_icon) {
      return res.status(404).json({
        success: false,
        message: "App icon not configured",
      });
    }

    // Return the icon URL from settings
    res.set("Cache-Control", "public, max-age=86400"); // Cache 24 hours
    return res.json({
      success: true,
      data: {
        icon: settings.company_icon,
        appName: settings.company_name || "MetroMac",
      },
    });
  } catch (error) {
    next(error);
  }
}

export { getGeneralSettings, updateGeneralSettings, getAppIcon };
