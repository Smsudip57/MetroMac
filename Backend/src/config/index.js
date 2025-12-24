import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_DEV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt_secret_token: process.env.JWT_SECRET_TOKEN,
  jwt_secret_expire: process.env.JWT_SECRET_EXPIRE,
  jwt_refresh_token: process.env.JWT_REFRESH_TOKEN,
  jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRE,
  // Super User Credentials
  super_admin_name: process.env.SUPER_ADMIN_NAME,
  super_admin_username: process.env.SUPER_ADMIN_USERNAME,
  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
};
