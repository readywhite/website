const { recordWallCorrection } = require("../lib/operational-store");

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function readRequestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isAuthorized(req) {
  const token = process.env.ADMIN_API_TOKEN && process.env.ADMIN_API_TOKEN.trim();
  if (!token && process.env.NODE_ENV !== "production") return true;
  return req.headers.authorization === `Bearer ${token}`;
}

module.exports = async function wallCorrectionsHandler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!isAuthorized(req)) {
    sendJson(res, 401, { error: "Unauthorized" });
    return;
  }

  try {
    const body = await readRequestBody(req);
    const result = await recordWallCorrection(body);
    sendJson(res, 200, {
      ok: true,
      persisted: result.persisted,
      correction: result.correction,
      event: result.event,
      warning: result.reason || null,
    });
  } catch (error) {
    sendJson(res, 400, { error: error.message });
  }
};
