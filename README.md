<div align="center">
  <img src="public/shield-logo.png" alt="NCTIRS Logo" width="120" height="120" style="border-radius: 50%" />
  
  # National Cyber Threat Intelligence & Response System (NCTIRS)
  
  **A Sovereign AI-Driven Cyber Defense Matrix for the Republic of Kenya**
  
  [![Build Status](https://github.com/arapgechina24-lgtm/NCTIRS./actions/workflows/ci.yml/badge.svg)](https://github.com/arapgechina24-lgtm/NCTIRS./actions/workflows/ci.yml)
  [![Scorecard Supply-Chain Security](https://github.com/ossf/scorecard-action/actions/workflows/scorecard.yml/badge.svg)](https://github.com/ossf/scorecard-action/actions/workflows/scorecard.yml)
  [![CodeQL](https://github.com/arapgechina24-lgtm/NCTIRS./actions/workflows/codeql.yml/badge.svg)](https://github.com/arapgechina24-lgtm/NCTIRS./actions/workflows/codeql.yml)
  [![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
</div>

<br />

## 🛡️ Strategic Imperative
**NCTIRS** is an elite, sovereign cyber defense platform architected specifically for the protection of Kenya's Critical National Infrastructure (CNI). Unlike imported SIEM/SOAR solutions that exfiltrate sensitive national telemetry to foreign data centers, NCTIRS guarantees **100% data residency** while deploying localized AI models trained explicitly on regional threat vectors.

This project was developed for the **National Intelligence and Research University (NIRU) AI Hackathon**, aligning strictly with the National Cybersecurity Strategy (2022-2027), the Computer Misuse and Cybercrimes Act (2018), and the Data Protection Act (2019).

---

## 🚀 Core Architectural Capabilities

### 1. Artificial Intelligence Threat Analytics Engine (ATAE)
NCTIRS abandons slow, rule-based heuristics in favor of four real-time machine learning inference engines operating directly on the intelligence datalake:
- **Z-Score Anomaly Detection:** Identifies statistically significant deviations in network payloads and protocol behaviors across IFMIS, eCitizen, and KRA systems.
- **Federated Behavioral Analysis:** Maps complex temporal bursts, geographical clustering, and target-fixation to reconstruct multi-vector APT kill-chains.
- **Predictive Trend Forecasting:** Utilizes Exponential Smoothing and Linear Regression to forecast 7-day threat horizons.
- **Swahili-Aware NLP Engine:** Extracts IOCs (Indicators of Compromise), threat actor signatures, and urgency semantics from unstructured threat intelligence feeds.

### 2. Autonomous Response & Containment Module (ARCM)
The system executes **sub-200ms autonomous threat neutralization**, drastically reducing the latency between detection and containment:
- **Kinetic IP Blocking:** Dynamically generates `iptables` rules and initiates BGP blackhole routing at the ISP level to sever attacker connections.
- **Sovereign Network Isolation:** Auto-triggers air-gapping, VLAN quarantine, or micro-segmentation depending on the criticality of the targeted CNI asset.
- **Forensic Chain of Custody:** Triggers automatic memory dumps, rotates compromised credentials, and logs all containment actions to an immutable blockchain ledger (SHA-256).

### 3. Legal Compliance & NC4 Integration
For every containment action, NCTIRS auto-generates a standardized **NC4 (National KE-CIRT/CC) Compliance Report**, ensuring all automated defenses are court-admissible and strictly adhere to CMCA 2018 prosecutorial standards.

---

## 💻 Tech Stack & Engineering Rigor

NCTIRS is built for speed, scale, and uncompromising security.

- **Framework:** Next.js 15 (React 19) — Edge-optimized Server Components
- **Database:** libSQL / Turso — High-availability distributed SQLite at the Edge
- **ORM:** Prisma — Type-safe database access
- **Authentication:** NextAuth.js (v5) — Hardened session management
- **Machine Learning:** Custom TypeScript-native statistical inference models (zero Python overhead)
- **CI/CD:** GitHub Actions — 83 automated tests enforcing 100% pass rates on every commit
- **Styling:** Tailwind CSS v4 — High-performance, zero-runtime CSS with specialized `lg:grid-cols-3` responsive dashboards.

---

## 🛠️ Local Deployment Guide

Deploy NCTIRS locally to experience the live threat feed and autonomous SOAR execution.

### Prerequisites
- Node.js `v20.x` or higher
- Git

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/arapgechina24-lgtm/NCTIRS.git
   cd NCTIRS.
   ```

2. **Install Dependencies**
   ```bash
   npm ci
   ```

3. **Configure Environment**
   Duplicate `.env.example` and set up your Turso database connection:
   ```bash
   cp .env.example .env.local
   # Ensure DATABASE_URL and TURSO_AUTH_TOKEN are set.
   # If left empty, the system gracefully degrades to a local SQLite file (ci-test.db).
   ```

4. **Initialize Database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Launch the Command Center**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000`. 
   *Note: Hackathon Demo Mode allows 1-click access via `admin@nis.go.ke`.*

---

## 🧪 Testing & Verification
The platform relies on `vitest` and `@testing-library/react` for comprehensive unit and DOM testing.
```bash
# Run all 83 test suites
npm run test

# Run code linting
npm run lint
```

---

## 🔐 Security & Vulnerability Disclosure
NCTIRS implements a strict **Shield-Core** zero-trust architecture. This includes:
- Strict `Content-Security-Policy` and `Strict-Transport-Security` headers.
- Next.js edge-based rate limiting on all `/api/ml/` and `/api/soar/` endpoints.
- Read-only execution modes preventing SQL injection.

*If you discover a vulnerability, please do NOT file a public issue. Email `security@nctirs.go.ke` (simulated).*

---

## 📜 License
This project is licensed under the **Apache License 2.0**. See the `LICENSE` file for details.

---

<div align="center">
  <i>"Predict. Isolate. Defend."</i><br>
  <b>Developed for the NIRU AI Hackathon 2026</b>
</div>
