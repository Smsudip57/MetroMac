import jwt from "jsonwebtoken";
import config from "../config/index.js";

export const jwtHelpers = {
  signToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, config.jwt_secret_token, { expiresIn });
  },
  verifyToken(token, secret) {
    return jwt.verify(token, secret);
  },
};
