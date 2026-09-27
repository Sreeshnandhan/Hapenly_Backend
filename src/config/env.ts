import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not defined`);
  }

  return value;
}

const JWT_SECRET: string = getRequiredEnv("JWT_SECRET");
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error("FRONTEND_URL is not defined");
}

export { PORT, JWT_SECRET, FRONTEND_URL };
