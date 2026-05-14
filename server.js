const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { URLSearchParams } = require('node:url');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = __dirname;
const GHL_API_BASE = process.env.GHL_API_BASE || 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = process.env.GHL_API_VERSION || '2023-02-21';
const GHL_CONTACT_ENDPOINT = process.env.GHL_CONTACT_ENDPOINT || '/contacts/upsert';
const DEFAULT_GHL_TAGS = ['Website Lead', 'Property Refresh', 'Interior Estimate', 'ready-white'];
const MAX_BODY_BYTES = 1024 * 1024;

const STATIC_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp'
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(body));
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function isAuthorizedLeadRequest(req) {
  const expectedSecret = process.env.LEAD_WEBHOOK_SECRET;
  if (!expectedSecret) return true;

  const authorization = req.headers.authorization || '';
  const bearerToken = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length).trim() : '';
  const headerToken = req.headers['x-readywhite-webhook-secret'] || '';

  return bearerToken === expectedSecret || headerToken === expectedSecret;
}

function splitName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ')
  };
}

function normalizeLead(input) {
  const fullName = input.fullName || input.name || input.full_name || '';
  const names = splitName(fullName);
  const notes = input.notes || input.projectNotes || input.project_notes || '';
  const propertyAddress = input.propertyAddress || input.property_address || input.address || '';
  const serviceNeeded = input.serviceNeeded || input.service_needed || input.service || '';
  const timeline = input.timeline || '';
  const vacant = input.vacant || input.isVacant || input.is_vacant || '';
  const propertyType = input.propertyType || input.property_type || '';
  const photoUrls = input.photoUrls || input.photo_urls || input.photos || '';
  const leadSource = input.leadSource || input.lead_source || input.source || 'Squarespace';
  const utmSource = input.utmSource || input.utm_source || '';
  const utmMedium = input.utmMedium || input.utm_medium || '';
  const utmCampaign = input.utmCampaign || input.utm_campaign || '';

  return {
    fullName: String(fullName).trim(),
    firstName: input.firstName || input.first_name || names.firstName,
    lastName: input.lastName || input.last_name || names.lastName,
    phone: input.phone || '',
    email: input.email || '',
    companyName: input.companyName || input.company_name || '',
    propertyAddress,
    propertyType,
    serviceNeeded,
    timeline,
    vacant,
    notes,
    photoUrls,
    leadSource,
    utmSource,
    utmMedium,
    utmCampaign
  };
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getGhlTags(lead) {
  const configuredTags = process.env.GHL_CONTACT_TAGS
    ? process.env.GHL_CONTACT_TAGS.split(',').map((tag) => tag.trim()).filter(Boolean)
    : DEFAULT_GHL_TAGS;

  const dynamicTags = [];
  if (lead.leadSource) dynamicTags.push(`source-${slugify(lead.leadSource)}`);
  if (lead.timeline) dynamicTags.push(`timeline-${slugify(lead.timeline)}`);
  if (lead.vacant) dynamicTags.push(`vacant-${slugify(lead.vacant)}`);
  if (lead.serviceNeeded) dynamicTags.push(`service-${slugify(lead.serviceNeeded)}`);

  return [...new Set([...configuredTags, ...dynamicTags].filter(Boolean))];
}

function buildOpportunityName(lead) {
  const name = lead.fullName || [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.email || lead.phone || 'Website Lead';
  const service = lead.serviceNeeded ? ` - ${lead.serviceNeeded}` : '';
  return `Ready White Website Lead - ${name}${service}`;
}

function buildNotes(lead) {
  return [
    'Ready White website lead',
    `Property Address: ${lead.propertyAddress || 'Not provided'}`,
    `Property Type: ${lead.propertyType || 'Not provided'}`,
    `Service Needed: ${lead.serviceNeeded || 'Not provided'}`,
    `Timeline: ${lead.timeline || 'Not provided'}`,
    `Vacant: ${lead.vacant || 'Not provided'}`,
    `Company: ${lead.companyName || 'Not provided'}`,
    `Lead Source: ${lead.leadSource || 'Not provided'}`,
    `UTM Source: ${lead.utmSource || 'Not provided'}`,
    `UTM Medium: ${lead.utmMedium || 'Not provided'}`,
    `UTM Campaign: ${lead.utmCampaign || 'Not provided'}`,
    lead.photoUrls ? `Photo URLs: ${Array.isArray(lead.photoUrls) ? lead.photoUrls.join(', ') : lead.photoUrls}` : 'Photo URLs: Not provided',
    '',
    'Project Notes:',
    lead.notes || 'Not provided'
  ].join('\n');
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('Request body too large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function parseLead(req) {
  const rawBody = await readBody(req);
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('application/json')) {
    return normalizeLead(rawBody ? JSON.parse(rawBody) : {});
  }

  if (contentType.includes('application/x-www-form-urlencoded')) {
    return normalizeLead(Object.fromEntries(new URLSearchParams(rawBody)));
  }

  throw new Error('Use application/json or application/x-www-form-urlencoded');
}

async function ghlFetch(endpoint, body) {
  const token = requireEnv('GHL_PRIVATE_INTEGRATION_TOKEN');
  const response = await fetch(`${GHL_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_API_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(body)
  });

  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!response.ok) {
    const message = data.message || data.error || `GoHighLevel request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

function getContactId(contactResponse) {
  return contactResponse.contact?.id || contactResponse.id || contactResponse.contactId;
}

async function handleGhlLead(req, res) {
  try {
    if (!isAuthorizedLeadRequest(req)) {
      return sendJson(res, 401, { error: 'Unauthorized lead submission.' });
    }

    const locationId = requireEnv('GHL_LOCATION_ID');
    const pipelineId = requireEnv('GHL_PIPELINE_ID');
    const pipelineStageId = process.env.GHL_PIPELINE_STAGE_ID;
    const lead = await parseLead(req);

    if (!lead.email && !lead.phone) {
      return sendJson(res, 400, { error: 'Email or phone is required.' });
    }

    const contact = await ghlFetch(GHL_CONTACT_ENDPOINT, {
      locationId,
      firstName: lead.firstName,
      lastName: lead.lastName,
      name: lead.fullName || [lead.firstName, lead.lastName].filter(Boolean).join(' '),
      email: lead.email,
      phone: lead.phone,
      companyName: lead.companyName,
      address1: lead.propertyAddress,
      source: lead.leadSource || 'Ready White Squarespace Form',
      tags: getGhlTags(lead),
      additionalEmails: [],
      additionalPhones: []
    });

    const contactId = getContactId(contact);
    if (!contactId) throw new Error('GoHighLevel contact response did not include a contact ID.');

    const opportunityBody = {
      locationId,
      pipelineId,
      contactId,
      name: buildOpportunityName(lead),
      status: 'open',
      source: lead.leadSource || 'Ready White Squarespace Form',
      notes: buildNotes(lead)
    };

    if (pipelineStageId) opportunityBody.pipelineStageId = pipelineStageId;

    const opportunity = await ghlFetch('/opportunities/', opportunityBody);

    return sendJson(res, 200, {
      ok: true,
      contactId,
      opportunityId: opportunity.opportunity?.id || opportunity.id || opportunity.opportunityId || null
    });
  } catch (error) {
    const status = error.status || (error.message.includes('required environment') ? 500 : 400);
    return sendJson(res, status, {
      error: error.message,
      details: process.env.NODE_ENV === 'production' ? undefined : error.details
    });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requestedPath = url.pathname === '/' ? '/index.html' : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(PUBLIC_DIR, requestedPath));

  const relativePath = path.relative(PUBLIC_DIR, filePath);
  const hasHiddenSegment = relativePath.split(path.sep).some((segment) => segment.startsWith('.'));

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath) || hasHiddenSegment) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': STATIC_TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS' && req.url.startsWith('/api/ghl-lead')) {
    return sendJson(res, 204, {});
  }

  if (req.method === 'POST' && req.url.startsWith('/api/ghl-lead')) {
    return handleGhlLead(req, res);
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res);
  }

  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Ready White server listening on port ${PORT}`);
});
