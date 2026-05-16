function summarizeCorrections(corrections = []) {
  const rows = Array.isArray(corrections) ? corrections : [];
  const summary = {
    correctionCount: rows.length,
    sqftVarianceTotal: 0,
    damageUpgrades: 0,
    damageDowngrades: 0,
    callbackCount: 0,
  };
  const rank = { basic: 1, standard: 2, heavy: 3 };

  for (const row of rows) {
    const original = row.original_values || row.originalValues || {};
    const corrected = row.corrected_values || row.correctedValues || {};
    const oldSqft = Number(original.sqft || original.estimated_sqft || 0);
    const newSqft = Number(corrected.sqft || corrected.corrected_sqft || 0);
    summary.sqftVarianceTotal += newSqft - oldSqft;
    const oldDamage = original.damage_tier || original.estimate_damage;
    const newDamage = corrected.damage_tier || corrected.corrected_damage;
    if (rank[newDamage] > rank[oldDamage]) summary.damageUpgrades += 1;
    if (rank[newDamage] < rank[oldDamage]) summary.damageDowngrades += 1;
    if (Boolean(corrected.callback_required || row.callback_required)) summary.callbackCount += 1;
  }

  summary.avgSqftVariance = rows.length ? Number((summary.sqftVarianceTotal / rows.length).toFixed(2)) : 0;
  return summary;
}

module.exports = { summarizeCorrections };
