import dotenv from 'dotenv';
import path from 'path';

export const NODE_ENV = process.env.NODE_ENV ;

const evaPath ={
    dev: path.resolve("./config/.env.dev"),
    prod: path.resolve("./config/.env.prod"),
}

dotenv.config({ path: evaPath[NODE_ENV || "dev"] });

export const SERVER_PORT = 
process.env.PORT || 3000;

export const DB_URL_LOCAL =
process.env.DB_URL_LOCAL || 3000;
export const REDIS_URL =
process.env.REDIS_URL || "";

export const SALT_ROUND = 
parseInt(process.env.SALT_ROUND) || 10;
export const ENCRYPTION_KEY = 
process.env.ENCRYPTION_KEY;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID 
export const TOKEN_SIGNATURE_User_ACCESS = 
process.env.TOKEN_SIGNATURE_User_ACCESS ;
export const TOKEN_SIGNATURE_Admin_ACCESS = 
process.env.TOKEN_SIGNATURE_Admin_ACCESS ;
export const TOKEN_SIGNATURE_User_REFRESH = 
process.env.TOKEN_SIGNATURE_User_REFRESH ;
export const TOKEN_SIGNATURE_Admin_REFRESH = 
process.env.TOKEN_SIGNATURE_Admin_REFRESH ;

export const EMAIL_USER = 
process.env.EMAIL_USER ;
export const EMAIL_PASS = 
process.env.EMAIL_PASS ;