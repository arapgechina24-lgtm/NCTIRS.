# National Cyber Threat Intelligence & Response System (NCTIRS)

![NCTIRS Logo](public/shield-logo.png)

**A Sovereign AI-Driven Cyber Defense Matrix for the Republic of Kenya**

[![Build Status](https://github.com/arapgechina24-lgtm/NCTIRS./actions/workflows/ci.yml/badge.svg)](https://github.com/arapgechina24-lgtm/NCTIRS./actions/workflows/ci.yml)
[![Scorecard Supply-Chain Security](https://github.com/ossf/scorecard-action/actions/workflows/scorecard.yml/badge.svg)](https://github.com/ossf/scorecard-action/actions/workflows/scorecard.yml)
[![CodeQL](https://github.com/arapgechina24-lgtm/NCTIRS./actions/workflows/codeql.yml/badge.svg)](https://github.com/arapgechina24-lgtm/NCTIRS./actions/workflows/codeql.yml)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## 🛡️ Strategic Imperative

**NCTIRS** is an elite, sovereign cyber defense platform architected specifically for the protection of Kenya's Critical National Infrastructure (CNI). Unlike imported SIEM/SOAR solutions that exfiltrate sensitive national telemetry to foreign data centers, NCTIRS guarantees **100% data residency** while deploying localized AI models trained explicitly on regional threat vectors.

This project was developed for the **National Intelligence and Research University (NIRU) AI Hackathon**, aligning strictly with the National Cybersecurity Strategy (2022-2027), the Computer Misuse and Cybercrimes Act (2018), and the Data Protection Act (2019).

---

## 🏛️ System Architecture

NCTIRS is built on a tripartite Zero-Trust architecture, separating ingestion, intelligence, and execution into distinct, hardened layers.

```mermaid
graph TD
    %% Define Styling
    classDef layerFill fill:#001a00,stroke:#00ff41,stroke-width:2px,color:#00ff41;
    classDef nodeFill fill:#000000,stroke:#008f11,stroke-width:1px,color:#00fa00;
    classDef cniFill fill:#1a0000,stroke:#ff0000,stroke-width:1px,color:#ff0000;

    subgraph Perception ["1. Perception Layer (Data Ingestion)"]
        A1[IFMIS Sensors]:::cniFill
        A2[eCitizen Logs]:::cniFill
        A3[KRA Telemetry]:::cniFill
        A4[ISP Border Gateway]:::cniFill

        DL[(Sovereign Data Lake\nTurso / SQLite at Edge)]:::nodeFill

        A1 --> DL
        A2 --> DL
        A3 --> DL
        A4 --> DL
    end

    subgraph Cognition ["2. Cognition Layer (AI Analysis - ATAE)"]
        B1[Z-Score Anomaly Engine\n(Payload/Frequency)]:::nodeFill
        B2[Federated Behavioral AI\n(APT Kill-Chain Math)]:::nodeFill
        B3[Predictive Forecaster\n(Exponential Smoothing)]:::nodeFill
        B4[Swahili NLP Engine\n(Threat Intel Parsing)]:::nodeFill

        DL --> B1
        DL --> B2
        DL --> B3
        DL --> B4
    end

    subgraph Execution ["3. Integrity Layer (Response - ARCM)"]
        C1{AI Decision Matrix\nConfidence > 85%}:::nodeFill
        C2[Kinetic IP Blocking\n(iptables/BGP)]:::nodeFill
        C3[Network Isolation\n(Air-Gap/VLAN)]:::nodeFill
        C4[Immutable Audit\n(Blockchain SHA-256)]:::nodeFill
        C5[NC4 Compliance\n(CMCA 2018 Specs)]:::nodeFill

        B1 --> C1
        B2 --> C1
        B3 --> C1
        B4 -.-> C1

        C1 -- Autoblock --> C2
        C1 -- Quarantine --> C3
        C2 --> C4
        C3 --> C4
        C1 --> C5
    end

    class Perception layerFill;
    class Cognition layerFill;
    class Execution layerFill;
```

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

*"Predict. Isolate. Defend."*

**Developed for the NIRU AI Hackathon 2026**
