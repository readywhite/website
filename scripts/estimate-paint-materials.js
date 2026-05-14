const fs = require("fs");
const path = require("path");

const PRICING_PATH = path.join(process.cwd(), "config", "material-pricing.json");

function parseArgs(argv) {
  return argv.reduce((options, arg) => {
    if (!arg.startsWith("--")) return options;

    const [rawKey, rawValue] = arg.slice(2).split("=");
    const key = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    options[key] = rawValue === undefined ? true : rawValue;
    return options;
  }, {});
}

function numberOption(options, name, fallback = 0) {
  const value = options[name];

  if (value === undefined || value === null || value === "") return fallback;

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }

  return parsed;
}

function loadPricing() {
  return JSON.parse(fs.readFileSync(PRICING_PATH, "utf8"));
}

function money(value) {
  return Math.round(value * 100) / 100;
}

function chooseContainers(gallonsRequired, product) {
  const oneGallonPrice = Number(product.pricePerGallon);
  const fiveGallonPrice = Number(product.fiveGallonPrice || oneGallonPrice * 5);
  const maxFiveGallonPails = Math.ceil(gallonsRequired / 5);
  let best = null;

  for (let fiveGallonPails = 0; fiveGallonPails <= maxFiveGallonPails; fiveGallonPails += 1) {
    const coveredByPails = fiveGallonPails * 5;
    const oneGallonCans = Math.max(0, gallonsRequired - coveredByPails);
    const purchasedGallons = coveredByPails + oneGallonCans;
    const totalCost = fiveGallonPails * fiveGallonPrice + oneGallonCans * oneGallonPrice;

    if (!best || totalCost < best.totalCost || (totalCost === best.totalCost && purchasedGallons < best.purchasedGallons)) {
      best = { fiveGallonPails, oneGallonCans, purchasedGallons, totalCost: money(totalCost) };
    }
  }

  return best;
}

function estimatePaintMaterials(options, pricing = loadPricing()) {
  const productKey = options.product || "property_solution_interior_flat";
  const product = pricing.products[productKey];

  if (!product) {
    throw new Error(`Unknown product "${productKey}". Valid products: ${Object.keys(pricing.products).join(", ")}`);
  }

  const length = numberOption(options, "length", 0);
  const width = numberOption(options, "width", 0);
  const height = numberOption(options, "height", 8);
  const directWallArea = numberOption(options, "wallArea", 0);
  const openingsSqFt = numberOption(options, "openings", 0);
  const directCeilingArea = numberOption(options, "ceilingArea", 0);
  const coats = numberOption(options, "coats", product.defaultCoats || 2);
  const wastePercent = numberOption(options, "waste", pricing.defaultWastePercent || 10);
  const includeCeiling = Boolean(options.includeCeiling || options.ceiling || directCeilingArea > 0);
  const coverageSqFtPerGallon = numberOption(options, "coverage", product.coverageSqFtPerGallon || 350);
  const pricePerGallon = numberOption(options, "pricePerGallon", product.pricePerGallon);
  const fiveGallonPrice = numberOption(options, "fiveGallonPrice", product.fiveGallonPrice || pricePerGallon * 5);

  if (!directWallArea && (!length || !width || !height)) {
    throw new Error("Provide either --wall-area or --length, --width, and --height");
  }

  const grossWallArea = directWallArea || 2 * (length + width) * height;
  const wallArea = Math.max(0, grossWallArea - openingsSqFt);
  const ceilingArea = includeCeiling ? (directCeilingArea || length * width) : 0;
  const paintableSqFt = wallArea + ceilingArea;
  const adjustedSqFt = paintableSqFt * coats * (1 + wastePercent / 100);
  const rawGallons = adjustedSqFt / coverageSqFtPerGallon;
  const gallonsRequired = Math.ceil(rawGallons);
  const productWithOverrides = { ...product, pricePerGallon, fiveGallonPrice };
  const containerPlan = chooseContainers(gallonsRequired, productWithOverrides);

  return {
    product: productKey,
    productLabel: product.label,
    pricingLastReviewed: pricing.pricingLastReviewed,
    currency: pricing.currency || "USD",
    inputs: {
      length,
      width,
      height,
      wallArea,
      ceilingArea,
      openingsSqFt,
      coats,
      wastePercent,
      coverageSqFtPerGallon,
      pricePerGallon: money(pricePerGallon),
      fiveGallonPrice: money(fiveGallonPrice),
    },
    outputs: {
      paintableSqFt: money(paintableSqFt),
      adjustedSqFt: money(adjustedSqFt),
      rawGallons: money(rawGallons),
      gallonsRequired,
      fiveGallonPails: containerPlan.fiveGallonPails,
      oneGallonCans: containerPlan.oneGallonCans,
      purchasedGallons: containerPlan.purchasedGallons,
      totalMaterialCost: containerPlan.totalCost,
    },
    operationalNotes: [
      "Use this as a material-cost template, not a final customer quote.",
      "Replace default pricing with current Ready White Sherwin-Williams account pricing before production use.",
      "Escalate severe prep, water damage, smoke/stain blocking, holes, and custom repairs into approved exception workflows.",
    ],
  };
}

function renderMarkdown(result) {
  return `# Paint Material Cost Estimate\n\n` +
    `- Product: ${result.productLabel}\n` +
    `- Pricing last reviewed: ${result.pricingLastReviewed}\n` +
    `- Paintable square footage: ${result.outputs.paintableSqFt}\n` +
    `- Adjusted square footage: ${result.outputs.adjustedSqFt}\n` +
    `- Coverage: ${result.inputs.coverageSqFtPerGallon} sq ft/gallon\n` +
    `- Coats: ${result.inputs.coats}\n` +
    `- Waste factor: ${result.inputs.wastePercent}%\n` +
    `- Raw gallons: ${result.outputs.rawGallons}\n` +
    `- Required gallons: ${result.outputs.gallonsRequired}\n` +
    `- Container plan: ${result.outputs.fiveGallonPails} five-gallon pail(s), ${result.outputs.oneGallonCans} one-gallon can(s)\n` +
    `- Total material cost: $${result.outputs.totalMaterialCost.toFixed(2)} ${result.currency}\n\n` +
    `## Operational notes\n\n${result.operationalNotes.map((note) => `- ${note}`).join("\n")}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = estimatePaintMaterials(options);

  if (options.format === "markdown" || options.markdown) {
    console.log(renderMarkdown(result));
    return;
  }

  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`Failed to estimate paint materials: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { estimatePaintMaterials, parseArgs, renderMarkdown };
