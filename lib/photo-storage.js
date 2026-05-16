const crypto = require("crypto");
const { getPool } = require("./operational-store");

function publicBaseUrl(req) {
  const configured = process.env.PUBLIC_BASE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const host = req?.headers?.host;
  if (!host) return "";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}`;
}

function digest(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function persistEstimatePhotos(files, req) {
  const db = getPool();
  const baseUrl = publicBaseUrl(req);
  const persistedAt = new Date().toISOString();

  if (!db) {
    return files.map((file) => ({
      ...file,
      storage: {
        persisted: false,
        reason: "DATABASE_URL is not configured; photo bytes were validated but not durably stored",
        sha256: digest(file.buffer),
        photoUrl: null,
        persistedAt,
      },
    }));
  }

  const output = [];
  for (const file of files) {
    const photoId = crypto.randomUUID();
    const sha256 = digest(file.buffer);
    await db.query(
      `INSERT INTO operational_photo_uploads
        (photo_id, wall_id, original_name, mime_type, byte_size, width, height, sha256, image_bytes, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)`,
      [
        photoId,
        file.wallId,
        file.originalname,
        file.detectedMimeType || file.mimetype,
        file.size,
        file.imageWidth || null,
        file.imageHeight || null,
        sha256,
        file.buffer,
        JSON.stringify({ source: "photo-estimate", photo_policy: "one_wall_one_reference_sheet" }),
      ],
    );
    output.push({
      ...file,
      persistedPhotoId: photoId,
      storage: {
        persisted: true,
        sha256,
        photoUrl: baseUrl ? `${baseUrl}/api/photo-upload?id=${photoId}` : `/api/photo-upload?id=${photoId}`,
        persistedAt,
      },
    });
  }
  return output;
}

module.exports = {
  persistEstimatePhotos,
};
