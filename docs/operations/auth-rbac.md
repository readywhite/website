# Admin Authentication and RBAC

Ready White admin endpoints must not become public operational controls. Use bearer tokens in Railway environment variables until a full identity provider is justified.

## Roles

| Role | Env token | Access |
| --- | --- | --- |
| `admin` | `ADMIN_API_TOKEN` | all admin, ops, vendor ops, read-only controls |
| `ops` | `OPS_API_TOKEN` | correction, queue, QA, and read-only controls |
| `vendor_ops` | `VENDOR_OPS_API_TOKEN` | vendor operations and read-only controls |
| `read_only` | `OPS_READ_API_TOKEN` | operational dashboard/visibility only |

Local development without configured tokens can use admin endpoints for validation. Production must configure tokens and send `Authorization: Bearer <token>`.

## ROI / operational impact / scalability / risk reduction

- **ROI impact:** prevents accidental public access to operational data and correction workflows.
- **Operational impact:** separates read-only dashboard users from operators who can change calibration data.
- **Scalability impact:** establishes a simple role boundary that can later move to full identity/RBAC.
- **Risk reduction:** reduces chance that dashboard, correction, and queue endpoints become uncontrolled attack surfaces.

## Fail-closed token policy

Admin and ops endpoints fail closed when role tokens are not configured. Local development no longer bypasses RBAC automatically because Railway/Vercel preview misconfiguration can otherwise expose corrections, actuals, dashboards, and stored photo artifacts. Set one of `ADMIN_API_TOKEN`, `OPS_API_TOKEN`, `VENDOR_OPS_API_TOKEN`, or `OPS_READ_API_TOKEN` before calling protected endpoints.
