const fs = require("fs");
const path = require("path");

const SITE_TITLE = "Ready White | Fast Interior Property Refreshes";
const SITE_DESCRIPTION = "Ready White provides fast interior repaint and property refresh services for rentals, apartments, property managers, investors, and move-out turnovers in Central Pennsylvania.";
const ROOT_URL = "https://www.readywhite.com";
const OG_IMAGE = `${ROOT_URL}/assets/ready-white-before-after-property-refresh.svg`;
const MAX_IMAGE_BYTES = 500 * 1024;
const MAX_PAGE_BYTES = 5 * 1024 * 1024;

const pages = [
  {
    file: "index.html",
    slug: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    requiredLinks: ["/services", "/vendors", "/gallery", "/get-started", "/contact"],
  },
  {
    file: "services.html",
    slug: "/services",
    title: "Services | Ready White",
    descriptionIncludes: ["Interior repaint services", "apartment turnover painting", "property manager"],
    requiredLinks: ["/get-started"],
  },
  {
    file: "vendors.html",
    slug: "/vendors",
    title: "Vendor Network | Ready White",
    descriptionIncludes: ["vendor network", "interior repaint", "Central PA"],
    requiredLinks: ["#vendor-sign-up"],
  },
  {
    file: "locations.html",
    slug: "/locations",
    title: "Locations | Ready White",
    descriptionIncludes: ["Harrisburg", "Hershey", "Lebanon", "Palmyra", "Central Pennsylvania"],
    requiredLinks: ["/services"],
    requiredText: [
      "apartment painting Harrisburg PA",
      "rental repaint Harrisburg",
      "property manager painting Central PA",
      "apartment turnover repainting Pennsylvania",
      "move-out painting services",
    ],
  },
  {
    file: "gallery.html",
    slug: "/gallery",
    title: "Gallery | Ready White",
    descriptionIncludes: ["before and after", "apartment move-out repainting", "Central PA"],
    requiredLinks: ["/get-started"],
  },
  {
    file: "get-started.html",
    slug: "/get-started",
    title: "Get Started | Ready White",
    descriptionIncludes: ["interior repaint", "apartment turnovers", "property manager"],
    requiredLinks: ["/services"],
  },
  {
    file: "contact.html",
    slug: "/contact",
    title: "Contact | Ready White",
    descriptionIncludes: ["interior repaint", "rental turnovers", "Central PA"],
    requiredLinks: ["/services"],
  },
];

const requiredGalleryImages = [
  {
    file: "assets/occupied-apartment-before-interior-repaint.svg",
    alt: "Occupied apartment before interior repaint",
  },
  {
    file: "assets/empty-apartment-after-ready-white-repaint.svg",
    alt: "Empty apartment after Ready White repaint",
  },
  {
    file: "assets/rental-turnover-room-fresh-white-walls.svg",
    alt: "Rental turnover room with fresh white walls",
  },
  {
    file: "assets/apartment-move-out-repaint-before-after.svg",
    alt: "Apartment move-out repaint before and after",
  },
];

function read(file) {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

function attr(html, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<[^>]+${escaped}[^>]+content=["']([^"']+)["']`, "i"));
  return match?.[1] || "";
}

function title(html) {
  return html.match(/<title>([^<]+)<\/title>/i)?.[1] || "";
}

function canonical(html) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || "";
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function includes(html, value, label) {
  if (!html.includes(value)) fail(`Missing ${label}: ${value}`);
}

for (const page of pages) {
  const html = read(page.file);
  const expectedUrl = `${ROOT_URL}${page.slug === "/" ? "/" : page.slug}`;
  const pageTitle = title(html);
  const description = attr(html, 'name="description"');
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const missingAltImages = [...html.matchAll(/<img\b[^>]*>/gi)].filter(([tag]) => !/\balt=["'][^"']+["']/.test(tag));

  if (pageTitle !== page.title) fail(`${page.file} title mismatch: ${pageTitle}`);
  if (description.length < 50 || description.length > 300) fail(`${page.file} description length ${description.length} is outside 50-300 characters`);
  if (page.description && description !== page.description) fail(`${page.file} description does not match required site description`);
  for (const snippet of page.descriptionIncludes || []) includes(description, snippet, `${page.file} description text`);
  if (canonical(html) !== expectedUrl) fail(`${page.file} canonical mismatch`);
  if (attr(html, 'property="og:title"') !== page.title) fail(`${page.file} og:title mismatch`);
  if (attr(html, 'property="og:description"') !== description) fail(`${page.file} og:description mismatch`);
  if (attr(html, 'property="og:image"') !== OG_IMAGE) fail(`${page.file} og:image mismatch`);
  if (attr(html, 'property="og:type"') !== "website") fail(`${page.file} og:type mismatch`);
  if (attr(html, 'property="og:url"') !== expectedUrl) fail(`${page.file} og:url mismatch`);
  if (h1Count !== 1) fail(`${page.file} must have exactly one H1; found ${h1Count}`);
  if (missingAltImages.length) fail(`${page.file} has image tags without alt text`);
  for (const link of page.requiredLinks) includes(html, `href="${link}"`, `${page.file} internal link`);
  for (const text of page.requiredText || []) includes(html, text, `${page.file} local SEO text`);
}

for (const image of requiredGalleryImages) {
  const size = fs.statSync(path.join(process.cwd(), image.file)).size;
  if (size > MAX_IMAGE_BYTES) fail(`${image.file} is over 500 KB`);
  const gallery = read("gallery.html");
  includes(gallery, `src="/${image.file}"`, "gallery image filename");
  includes(gallery, `alt="${image.alt}"`, "gallery image alt text");
}

const pageWeightFiles = [
  "index.html",
  "style.css",
  "script.js",
  ...requiredGalleryImages.map((image) => image.file),
  "assets/ready-white-before-after-property-refresh.svg",
];
const estimatedHomePageBytes = pageWeightFiles.reduce((sum, file) => sum + fs.statSync(path.join(process.cwd(), file)).size, 0);
if (estimatedHomePageBytes > MAX_PAGE_BYTES) fail(`Estimated page size is over 5 MB: ${estimatedHomePageBytes}`);

const sitemap = read("sitemap.xml");
for (const page of pages) includes(sitemap, `<loc>${ROOT_URL}${page.slug === "/" ? "/" : page.slug}</loc>`, "sitemap URL");
includes(read("robots.txt"), `Sitemap: ${ROOT_URL}/sitemap.xml`, "robots sitemap");

const notFound = read("404.html");
for (const link of ["/", "/services", "/get-started", "/vendors", "/contact"]) {
  includes(notFound, `href="${link}"`, "404 internal link");
}

includes(read("docs/seo-launch-checklist.md"), "Google Search Console", "SEO launch checklist");
includes(read("docs/seo-launch-checklist.md"), "Apartment Turnover Painting", "future blog category");

if (process.exitCode) process.exit(process.exitCode);
console.log(`Squarespace SEO audit passed. Estimated indexed homepage payload: ${estimatedHomePageBytes} bytes.`);
