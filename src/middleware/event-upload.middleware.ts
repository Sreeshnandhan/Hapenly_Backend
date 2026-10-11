import multer from "multer"
import type { Request, Response, NextFunction } from "express"
import { FRONTEND_URL } from "../config/env"

const parseImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 14,
    parts: 15,
    fieldSize: 16 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype))
      return callback(new Error("Choose a JPG, PNG or WebP image."))
    callback(null, true)
  },
}).single("image")

export function parseEventUpload(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const origin = req.get("origin")
  const allowed = [FRONTEND_URL]
  if (process.env.NODE_ENV !== "production")
    allowed.push(
      "http://localhost:8443",
      "http://localhost:5173",
      "http://127.0.0.1:8443",
      "http://127.0.0.1:5173",
    )
  if (origin && !allowed.includes(origin))
    return res.status(403).json({ message: "Request origin is not allowed." })
  parseImage(req, res, (error: unknown) => {
    if (!error) return next()
    return res
      .status(400)
      .json({
        success: false,
        message:
          error instanceof multer.MulterError
            ? error.code === "LIMIT_FILE_SIZE"
              ? "Image must be 5 MB or smaller."
              : "Upload one image with valid event details."
            : "Choose a JPG, PNG or WebP image.",
      })
  })
}
