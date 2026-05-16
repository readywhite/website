const { recordWallCorrection } = require("../lib/operational-store");
const { requireRole } = require("../lib/auth");

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


module.exports = async function wallCorrectionsHandler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const auth = requireRole(req, res, ["ops", "admin"]);
  if (!auth) return;

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
