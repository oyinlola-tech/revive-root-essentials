# Security Policy

This document defines how security vulnerabilities should be reported for Revive Roots Essentials and how reports are handled.

Project Owner: Oluwayemi Oyinlola Michael  
Portfolio: https://oyinlola.site

## Scope

This policy applies to:

- Frontend application source in this repository.
- Backend API service, route/controller logic, and middleware.
- Authentication, authorization, and role access logic.
- Integrations configured via environment variables (payment, email, SMS).

## Supported Security Coverage

Security fixes are prioritized for actively maintained code in the default branch and current production deployments under commercial agreement.

Legacy or modified client forks may require a paid maintenance agreement before remediation support is provided.

## How to Report a Vulnerability

Report vulnerabilities privately. Do not open public issues containing exploit details.

Preferred reporting path:

- Use the contact channel available on the owner portfolio: `https://oyinlola.site`
- Subject line suggestion: `Security Report - Revive Roots Essentials`

Include:

- Summary of the issue
- Affected component(s)
- Reproduction steps
- Proof-of-concept payload or request sample
- Impact assessment (confidentiality/integrity/availability)
- Suggested remediation (optional)
- Your disclosure timeline expectations

## Response Targets

Best-effort targets for valid reports:

- Initial acknowledgment: within 72 hours
- Triage decision: within 7 business days
- Status updates: weekly until a resolution path is decided

Actual timelines depend on severity, exploitability, and active contract coverage.

## Severity Guidelines

Severity is assessed using practical business impact and technical exploitability:

- Critical: remote unauthorized access, account takeover at scale, RCE, payment abuse with high impact.
- High: privilege escalation, auth bypass, sensitive data exposure with realistic exploitation.
- Medium: constrained data leak, logic bypass with partial controls still in place.
- Low: best-practice weakness with limited direct exploit path.

## Safe Harbor Expectations

If you act in good faith, avoid privacy violations, avoid service disruption, and do not exfiltrate non-consensual data, your report will be treated as authorized security research for disclosure purposes.

Out-of-scope activities:

- Social engineering against staff or customers.
- Physical attacks.
- DDoS/load testing that degrades availability.
- Spam campaigns.
- Automated bulk scanning that destabilizes environments.

## Disclosure Process

- Reports are reviewed privately.
- A fix strategy is determined and implemented.
- Affected licensed deployments are notified with remediation instructions.
- Public disclosure timing is coordinated after mitigation where applicable.

## Security Hardening Baseline (Operational)

Recommended baseline for deployments:

- Enforce HTTPS and secure transport end-to-end.
- Lock down CORS to trusted frontend origins only.
- Use strong unique secrets for JWT and third-party integrations.
- Store secrets in secure managers, not plain repository files.
- Apply least privilege to DB and service credentials.
- Enable centralized logging, alerting, and audit trails for admin actions.
- Keep dependencies and runtime versions patched.
- Run regular backup and restore tests.

## Known Security-Sensitive Areas

Review and test these modules carefully during each release:

- Authentication controllers and token issuance.
- Role middleware and route protection.
- Payment and webhook integration points.
- File upload handling and static serving.
- Contact/newsletter input validation and anti-abuse controls.

## No Public Bug Bounty

There is currently no public bug bounty program and no guaranteed monetary reward for submissions, unless explicitly agreed in writing.

## Legal

This policy does not grant rights to use, copy, or redistribute the software. Commercial and licensing terms remain governed by repository licensing files and signed agreements.
