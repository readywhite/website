# Market Expansion Controls

Nationwide scale requires market-independent workflows with market-specific economics in deterministic configuration.

## Standardized nationally

- one-wall estimate units,
- paper-reference photo policy,
- GHL pipeline and tags,
- lifecycle stages,
- vendor scorecard fields,
- proof-of-work requirements,
- exception escalation rules,
- KPI reporting definitions.

## Configured by market

Market pricing differences belong in `config/pricing-rules.json` under `markets`:

```json
{
  "market": "san_francisco",
  "laborMultiplierBps": 18000,
  "materialMultiplierBps": 12000,
  "mobilizationMultiplierBps": 14000,
  "targetMarginBps": 4600
}
```

Use basis points and cents-only arithmetic so quotes remain reproducible and auditable.
