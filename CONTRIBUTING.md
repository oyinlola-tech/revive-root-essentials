# Contributing Guide

Thanks for your interest in improving this project.

## Important License Note

This repository is under a Proprietary Commercial License.  
Before contributing, review [`LICENSE.md`](LICENSE.md).

Key points:

- no open-source license is granted
- contributions may only be accepted under explicit written authorization
- commercial rights require a signed agreement with the Licensor

## Before You Start

1. Open an issue describing the change.
2. Wait for maintainer approval before major implementation work.
3. Confirm your proposed work does not violate license restrictions.

## Development Setup

1. Install dependencies:
```bash
npm ci
cd backend && npm ci && cd ..
```
2. Create env files:
```bash
cp backend/.env.example backend/.env
cp frontend-env/.env.example frontend-env/.env
```
3. Run:
```bash
npm run dev
```

## Coding Expectations

- keep changes scoped and focused
- preserve security controls and validation logic
- avoid committing secrets or environment files
- update docs for behavior/config changes

## Pull Request Checklist

- [ ] code builds locally
- [ ] no secrets in code or commits
- [ ] docs updated where needed
- [ ] PR description explains risk and rollback plan
- [ ] tests/manual verification included

## Security-Sensitive Changes

For authentication, payment, and authorization changes:

- explain threat model impact
- include negative test cases
- highlight migration concerns

See [`SECURITY.md`](SECURITY.md) for disclosure policy.
