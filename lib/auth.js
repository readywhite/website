const ROLE_TOKENS = {
  admin: "ADMIN_API_TOKEN",
  ops: "OPS_API_TOKEN",
  vendor_ops: "VENDOR_OPS_API_TOKEN",
  read_only: "OPS_READ_API_TOKEN",
};

const ROLE_HIERARCHY = {
  admin: ["admin", "ops", "vendor_ops", "read_only"],
  ops: ["ops", "read_only"],
  vendor_ops: ["vendor_ops", "read_only"],
  read_only: ["read_only"],
};

function getConfiguredRoles() {
  return Object.entries(ROLE_TOKENS)
    .filter(([, envName]) => process.env[envName] && process.env[envName].trim())
    .map(([role]) => role);
}

function tokenFromRequest(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();
  return req.headers["x-readywhite-token"] || "";
}

function roleForToken(token) {
  if (!token) return null;
  for (const [role, envName] of Object.entries(ROLE_TOKENS)) {
    if (process.env[envName] && token === process.env[envName].trim()) return role;
  }
  return null;
}

function roleCanAccess(actualRole, allowedRoles) {
  if (!actualRole) return false;
  const inherited = ROLE_HIERARCHY[actualRole] || [];
  return allowedRoles.some((role) => inherited.includes(role));
}

function authorize(req, allowedRoles = ["admin"]) {
  const configuredRoles = getConfiguredRoles();
  if (process.env.NODE_ENV !== "production" && configuredRoles.length === 0) {
    return { ok: true, role: "dev", actorId: "dev_operator" };
  }

  const role = roleForToken(tokenFromRequest(req));
  if (!roleCanAccess(role, allowedRoles)) {
    return { ok: false, role: role || "anonymous", actorId: null };
  }

  return {
    ok: true,
    role,
    actorId: req.headers["x-operator-id"] || role,
  };
}

function requireRole(req, res, allowedRoles = ["admin"]) {
  const auth = authorize(req, allowedRoles);
  if (auth.ok) return auth;
  res.statusCode = 401;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Unauthorized", requiredRoles: allowedRoles }));
  return null;
}

module.exports = {
  authorize,
  requireRole,
  roleCanAccess,
};
