import { createCipheriv, createDecipheriv } from "crypto";

const key = Buffer.from(process.env.AUTH_ENCRYPT_KEY as string, "hex");
const iv = Buffer.from(process.env.AUTH_INIT_VECTOR as string, "hex");

const algorithm = "aes-256-cbc";

export const encrypt = (text: string) => {
  try {
    const cipher = createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
};

export const decrypt = (encrypted: string) => {
  try {
    const decipher = createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw error;
  }
};
