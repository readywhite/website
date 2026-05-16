const { getPool } = require("../lib/operational-store");
const { requireRole } = require("../lib/auth");

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

module.exports = async function photoUploadHandler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = requireRole(req, res, ["read_only", "ops", "admin"]);
  if (!auth) return;

  const db = getPool();
  if (!db) {
    sendJson(res, 503, { error: "DATABASE_URL is required for stored photo retrieval" });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const photoId = url.searchParams.get("id");
  if (!photoId) {
    sendJson(res, 400, { error: "photo id is required" });
    return;
  }

  const result = await db.query("SELECT mime_type, original_name, image_bytes FROM operational_photo_uploads WHERE photo_id = $1", [photoId]);
  const photo = result.rows[0];
  if (!photo) {
    sendJson(res, 404, { error: "photo not found" });
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", photo.mime_type);
  res.setHeader("Content-Disposition", `inline; filename=\"${String(photo.original_name || "ready-white-photo").replace(/[\r\n\"]/g, "_")}\"`);
  res.end(photo.image_bytes);
};
