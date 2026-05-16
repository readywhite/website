# AI Evaluation and Calibration Harness

AI evaluation must measure whether the wall-estimate system preserves operational rules, not whether the model sounds confident.

## Current harness

Run:

```bash
npm run ai:eval
npm run calibration:report
```

`config/ai-eval-fixtures.json` checks normalized wall-estimate expectations such as manual-review behavior for missing paper references. `config/corrections.example.json` demonstrates calibration analytics from human corrections.

## Required future evaluation fields

- prompt version,
- model version,
- pricing rules version,
- image metadata,
- normalized output,
- operator correction,
- variance reason,
- vendor ID,
- callback required,
- QA outcome.

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** improves quote accuracy and reduces underpriced work.
- **Operational impact:** operators can see recurring calibration failures by wall type, market, or vendor.
- **Scalability impact:** creates a repeatable model/prompt evaluation process before expanding markets.
- **Risk reduction:** catches regressions before AI output silently harms pricing, dispatch, or QA.
