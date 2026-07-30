# Product Requirements Document
## Content Humanizer



## 1. Executive Summary

Content Humanizer is a **B2B SaaS and API-as-a-Service platform** designed to transform AI-generated text into highly authentic, human-like content that consistently bypasses AI detection systems (Originality.ai, GPTZero, Turnitin). 

Unlike basic paraphrasers (e.g., humanizerai.com) that rely on superficial word-swapping, Content Humanizer utilizes a sophisticated **11-agent sequential pipeline** to perform deep content detoxification, structural disruption, and genuine voice synthesis. 

The platform operates on a robust, synchronous architecture processing content humanization directly in the request-response cycle while logging transaction metrics to a Firestore database, enabling scalable API delivery, granular token/credit tracking, and enterprise-grade observability.

---

## 2. Core Value Proposition & Differentiators

1. **The 11-Agent Detox Pipeline:** A multi-stage orchestration that dissects intent, eliminates AI structural patterns, injects burstiness, and rigorously scores the output against internal detection simulations.
2. **API-First Architecture:** A developer-ready REST API allowing seamless B2B integration via scoped API keys, returning humanized content and quality metrics directly in the synchronous HTTP response — so any third-party platform can embed humanization as a feature.
3. **Transparent Credit & Token Economics:** Users purchase credits (1 credit = 10 words base rate) with compute multipliers for premium modes. Admin dashboard tracks LLM token consumption per agent per job to ensure healthy margins.
4. **Comprehensive Quality Scoring:** Every output includes a structured JSON quality report: `input_ai_written_percent`, `human_likeness`, `ai_detection_resistance`, `readability`, `seo_retention`, `tone_consistency`, `grammar`, `overall`, and a natural-language `summary`.
5. **SLA-Backed Bypass Guarantee:** Jobs run on `maximum` reflection level are guaranteed to achieve ≥90 AI detection resistance or the user is charged 0 credits.

---

## 3. The 11-Agent Pipeline Architecture

The humanization process is executed sequentially by specialized agents. This logic maps directly to the backend implementation.

### Phase 1: Analysis & Strategy
- **Agent 1 (Intent Extraction):** Profiles the target audience, purpose, and tone fingerprint. Identifies what a human expert would add (voice gap analysis).
- **Agent 2 (AI Pattern Detection):** Flags exact statistical signatures detectors look for: perplexity uniformity, burstiness failures, and structural tells (e.g., transition word abuse). Calculates the baseline `input_ai_written_percent` score of the input content.
- **Agent 3 (Humanization Strategy):** Creates a specific battle plan targeting the detected vectors (perplexity disruption, burstiness injection, voice insertion).

### Phase 2: Core Transformation
- **Agent 4 (Linguistic Humanizer):** The core rewrite. Forces extreme sentence length variation, unexpected synonyms, and breaks grammatical rules intentionally to match human flow.
- **Agent 5 (Style Personalization):** Applies a cohesive authorial voice (e.g., standard, human, expert, storytelling, brand_voice) ensuring consistent tone without smoothing out natural imperfections.
- **Agent 6 (Authenticity):** The final shaping pass. Eliminates emotional flatness, predictable clause ordering, and over-attribution.
- **Agent 7 (SEO Preservation):** Verifies no primary keywords, facts, or search intents were lost during transformation. Re-weaves missing elements naturally.

### Phase 3: Reflection & Quality Assurance
- **Agent 8 (Reflection):** Acts as the internal AI detector. Scores burstiness, perplexity variation, and structural diversity. Estimates Originality.ai probability.
- **Agent 9 (Revision):** Applies Agent 8's feedback to aggressively fix remaining tells. *(Note: Agents 8 & 9 run in loops based on user-selected `reflection_level` [basic, advanced, maximum]).*
- **Agent 10 (Quality Scoring):** Produces the final JSON metric payload (e.g., `{"input_ai_written_percent": 85, "human_likeness": 95, "ai_detection_resistance": 92, ...}`).
- **Agent 11 (Orchestrator):** Finalizes the output payload and returns the synchronous HTTP response.

---

## 4. System Architecture & Deployment Structure

The platform leverages a scalable GCP/Firebase infrastructure, separating rapid job state management from complex analytics.

### 4.1 High-Level Flow Diagram

```mermaid
graph TD
    %% Clients
    WebClient[Web Dashboard: React/Vite] --> CloudFunctions
    APIClient[External Platform via API Key] --> CloudFunctions
    
    %% API Layer
    CloudFunctions[Cloud Functions v2: Express Clusters <br> e.g. humanizerOps, apiGateway]
    
    %% Datastore (NoSQL)
    CloudFunctions -- Read/Write State --> Firestore[(Firestore NoSQL)]
    
    %% Synchronous Pipeline Execution
    CloudFunctions -- Invoke Pipeline --> AgentWorkers[Cloud Run / Functions: Agent Workers]
    AgentWorkers -- Call LLMs --> LLMGateway[Internal LLM Gateway <br> Gemini, Claude, GPT-4o]
    AgentWorkers -- Update Job State & Logs --> Firestore
    AgentWorkers -- Return Text & Metrics --> CloudFunctions
```

### 4.2 Component Breakdown
- **Frontend:** React / Vite / TypeScript served via Firebase Hosting.
- **API Gateway (Express Clusters):** Firebase Cloud Functions handling authentication (API keys or Firebase Auth), rate limiting, and credit validation.
- **Pipeline Execution:** Agent Workers execute the 11-agent pipeline synchronously inside the request-response lifecycle, avoiding asynchronous queuing delays.
- **Database (Firestore):** Stores all user profiles, active API keys, credit balances, job states, task execution logs, and LLM consumption performance records.

---

## 5. API-as-a-Service Design

The platform is designed to be embedded. The REST API exposes the full power of the pipeline.

### 5.1 API Key Management
- Generated via the Web Dashboard. Stored as SHA-256 hashes in Firestore.
- Configurable Scopes: `Read-Only` (Detect), `Full Access` (Humanize).
- Granular Rate Limiting implemented via Firestore atomic counters or Redis (e.g., 60 req/min).

### 5.2 System API Reference

All project APIs (including client/developer facing endpoints and admin command center endpoints) are listed below:

| HTTP Method & Endpoint | Name | Type / Scope | Description |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/humanize` | Synchronous Humanize | Client / Developer | Synchronous humanization. Accepts `text`, `mode` (expert, storytelling, etc.), and `reflection_level`. Processes the text through the 11-agent pipeline and returns the final humanized text and detailed quality metrics in the response. |
| `POST /api/v1/detect` | Fast AI Detection | Client / Developer | Fast, single-agent detection check. Returns baseline AI-written percentage score. |
| `GET /api/v1/account` | Account Overview | Client / Developer | Check remaining credits and API usage limits. |
| `GET /api/v1/admin/tasks` | List/Filter Tasks | Admin Portal | List, paginate, and search all humanization tasks. Filters by `userId`, `status`, `mode`, `reflection_level`, and date ranges. |
| `GET /api/v1/admin/tasks/{jobId}` | Get Task Logs | Admin Portal | Retrieve detailed step-by-step execution logs for a job, including latency and status per agent step. |
| `POST /api/v1/admin/tasks/{jobId}/cancel` | Cancel Task | Admin Portal | Cancel execution of an active task. |
| `POST /api/v1/admin/tasks/{jobId}/retry` | Retry Sync/Task | Admin Portal | Manually retry a failed database sync or task execution. |
| `GET /api/v1/admin/costs/gemini` | Gemini Cost Metrics | Admin Portal | Retrieve specific Gemini LLM token consumption metrics (input/output tokens, cost in USD, and latency statistics) broken down by model version (e.g., Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 2.0). |
| `GET /api/v1/admin/costs/summary` | Overall Cost Summary | Admin Portal | Retrieve overall LLM API cost reports and margin analyses across all models (Gemini, Claude, GPT-4o) over time. |

---

## 6. Credit Economics & Token Tracking

### 6.1 The User Perspective: Credits
- **Currency:** Users consume "Credits" (1 Credit = 10 words base rate).
- **Deduction & Refunds:** Credits are validated and locked upon request start. If the job succeeds, they are permanently deducted. If the job fails (LLM error or validation failure), they are instantly unlocked/refunded.
- **Modifiers (Multiplier Charging):**
  - **Reflection Levels:** Higher reflection loops consume more credits (`basic` = 1.0x, `advanced` = 1.5x, `maximum` = 2.0x).
  - **Custom Voice Vault Persona:** Running the pipeline with a custom Voice Vault persona charges a **2.0x multiplier** due to style-analysis and context parsing overheads.
  - *Combined Example:* A job submitted with a custom Voice Profile under `maximum` reflection level will cost a total of **4.0x standard credits** (2.0x Voice * 2.0x Reflection).

### 6.2 The Admin Perspective: Tokens & Margins
To ensure platform profitability, every agent call logs exact LLM token usage.
- The **internal unified LLM client** tracks `tokensIn`, `tokensOut`, and calculates `costUsd` per call.
- This data is logged directly in Firestore.
- **Admin Dashboard View:** Displays Real-time Gross Margin (Revenue from Credits Used vs. Actual LLM API Cost).

---

## 7. Platform Dashboards

### 7.1 Client Dashboard (Web App)
- **Playground:** Paste text, select mode, view progress, and see the side-by-side diff.
- **Analytics:** View historical average `ai_detection_resistance` and initial `input_ai_written_percent` scores.
- **API Management:** Generate keys, monitor rate limit hits.
- **Billing:** Stripe-integrated credit top-ups.

### 7.2 Admin Command Center
- **System Health:** Average pipeline latency, agent failure rates, API request throughput.
- **Task Management:** UI to search and filter jobs, inspect step-by-step agent execution logs, cancel active jobs, and trigger retries.
- **Financials:** Total tokens consumed per model (Gemini vs Claude vs GPT-4o), credit burn velocity, LLM API costs.
- **Quality Drift:** Monitor global average Quality Scores to ensure LLM model updates haven't degraded output quality.

---

## 8. User Flows & Journeys

### 8.1 Web App User Flow (Visual Content Creator / Editor)

```mermaid
graph TD
    Start([1. Land on Site]) --> Auth{2. Login / Sign Up}
    Auth -->|First Time| Onboard[3. Select Persona / Mode Preference]
    Auth -->|Returning| Dash[4. Workspace Dashboard]
    
    Onboard --> Dash
    Dash --> Action{5. Choose Task}    %% Flow A: Humanizing Text
    Action -->|Humanize Text| Editor[6. Open Playground Editor]
    Editor --> PasteText[7. Paste AI Content & Choose Mode]
    PasteText --> SubmitJob[8. Click 'Humanize' - Locks Credits]
    SubmitJob --> Loading[9. UI shows processing status spinner]
    Loading --> Complete[10. View Side-by-Side Diff & Quality Score]
    Complete --> CopyExport[11. Copy/Export Output & Deduct Credits]
    
    %% Flow B: Voice Vault Profile
    Action -->|Create Persona| VoiceVault[12. Go to Voice Vault]
    VoiceVault --> UploadRef[13. Paste writing sample / links]
    UploadRef --> AnalyzeVoice[14. Train Profile - Extract DNA]
    AnalyzeVoice --> SaveVoice[15. Save Custom Persona for future use]
    SaveVoice --> Editor
    
    %% Flow C: Purchase Credits
    Action -->|Need Credits| Pricing[16. View Billing & Pricing]
    Pricing --> Checkout[17. Checkout via Stripe]
    Checkout --> UpdateCredits[18. Instantly update balance]
    UpdateCredits --> Dash
```

#### Detailed Step Walkthrough:
1. **Authentication:** The user logs in via Google OAuth or Email/Password (Firebase Auth). New users receive 500 free credits to test.
2. **Dashboard Overview:** Displays current credit balance, quick-action shortcuts (Playground, Voice Vault, API settings), and a summary chart of their average Quality Score over recent runs.
3. **Voice Vault Persona Setup:** 
   - User goes to "Voice Vault" to set up a personalized tone.
   - They paste in 1,000 words of their own writing.
   - The platform runs a one-off analysis job using the Intent Extraction agent, saving the generated style fingerprint as a reusable Voice Profile.
4. **Playground Humanization:**
   - User opens the Playground text editor.
   - They paste their AI-generated article, select their Custom Voice Profile, and pick a reflection level.
   - Clicking "Humanize" initiates a synchronous request. The UI displays a processing indicator while the 11-agent pipeline runs.
   - Once completed, the HTTP response returns the results. The UI displays the side-by-side diff and the quality metrics (including the initial AI-written score). The user can copy or export the text.

---

### 8.2 Developer & API User Flow

```mermaid
graph TD
    StartDev([1. Go to API Dashboard]) --> ScopeKey[2. Generate Scoped API Key]
    ScopeKey --> ReadDocs[3. View Interactive Mintlify Documentation]
    ReadDocs --> APIRequest[4. POST /v1/humanize with API Key]
    APIRequest --> APIResponse[5. Receive Synchronous 200 OK Response]
    APIResponse --> ClientFinal[6. Client extracts Text + Quality metrics]
```

#### Detailed Step Walkthrough:
1. **API Provisioning:**
   - The developer navigates to the "Developers" tab on the dashboard.
   - They click "Generate Key", choose the scopes (`Read`, `Write`, or both), and optionally set a monthly credit spending cap.
   - The API key is revealed once, and they copy it.
2. **Execution & Integration:**
   - The developer's platform makes an HTTP POST request to `/api/v1/humanize` passing the payload.
   - The gateway validates key, confirms credits, and calls the 11-agent pipeline synchronously.
   - The server processes the request and returns a `200 OK` response containing the completed results (the humanized text and quality metrics) directly within the request-response lifecycle.

---

## 9. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite, TypeScript, TailwindCSS, Zustand |
| **Backend API** | Node.js (Firebase Cloud Functions v2) |
| **Agent Workers** | Python (Cloud Run Jobs or Functions) executing `agents.py` |
| **NoSQL DB** | Cloud Firestore |
| **LLM Gateway** | Internal Python router (`backend/utils/llm_client.py`) using official SDKs: `google-generativeai`, `openai`, `anthropic` |
| **Payments** | Stripe |

---

## 10. Phased Roadmap

### Phase 1: MVP Core (Weeks 1-6)
- Stabilize the 11-agent Python pipeline.
- Implement synchronous pipeline orchestration in request-response cycle.
- Deploy Web Dashboard (Playground, Job History).
- Basic Stripe credit purchasing.

### Phase 2: API & Analytics (Weeks 7-10)
- Launch Public REST API + API Key management.
- Deploy optimized Firestore indexes for admin search and query performance.
- Launch Admin Command Center and Admin Portal APIs (Task & Cost Management).

### Phase 3: Scale & Enterprise (Weeks 11-14)
- Introduce Team Workspaces (Shared API keys and credit pools).
- Launch "Voice Vault" (Custom agent prompts based on user-provided writing samples).
- Implement strict SLA logic (Auto-refunds for low quality scores).

---

## 11. Detailed Data Models & API Payload Specifications

### 11.1 Database Schema (Cloud Firestore NoSQL Collections)

Content Humanizer uses Google Cloud Firestore for secure, real-time data storage. Below is the document model design for the primary collections:

#### Collection: `users`
Documents in this collection store user profile statistics, configuration preferences, and current credit balances.
- **Document ID:** `userId` (string, Firebase Auth UID)
- **Fields:**
  - `email`: `string`
  - `credits`: `number` (integer, remaining credits)
  - `role`: `string` (e.g., `user` or `admin`)
  - `createdAt`: `timestamp`

#### Collection: `jobs`
Documents in this collection record each humanization request details, pipeline outcomes, and step performance statistics.
- **Document ID:** `jobId` (string, uniquely generated)
- **Fields:**
  - `userId`: `string` (Firebase Auth UID)
  - `apiKeyId`: `string` (ID of the key used, optional)
  - `mode`: `string` (e.g. `standard`, `human`, `expert`, `storytelling`, `brand_voice`)
  - `reflectionLevel`: `string` (e.g. `basic`, `advanced`, `maximum`)
  - `wordsIn`: `number` (integer count of source text words)
  - `wordsOut`: `number` (integer count of rewritten text words)
  - `inputAiWrittenPercent`: `number` (0-100 baseline score calculated by Agent 2)
  - `humanLikeness`: `number` (0-100 score)
  - `aiResistance`: `number` (0-100 score)
  - `qualityOverall`: `number` (0-100 composite score)
  - `creditsUsed`: `number` (credits deducted for this execution)
  - `tokensConsumed`: `number` (total LLM tokens consumed)
  - `llmCostUsd`: `number` (cost in USD of LLM usage)
  - `processingMs`: `number` (execution latency in milliseconds)
  - `status`: `string` (e.g. `processing`, `completed`, `failed`, `needs_review`)
  - `createdAt`: `timestamp`
  - `agentLogs`: `array` of Maps, where each Map represents an agent execution record:
    - `agentNumber`: `number` (1 to 11)
    - `agentName`: `string`
    - `llmModel`: `string` (e.g. `gemini-1.5-flash`, `gpt-4o`)
    - `tokensIn`: `number` (input tokens)
    - `tokensOut`: `number` (output tokens)
    - `latencyMs`: `number` (execution time in milliseconds)
    - `costUsd`: `number` (calculated USD cost)
    - `status`: `string` (e.g. `completed`, `failed`)
    - `createdAt`: `timestamp`

#### Collection: `creditTransactions`
Documents in this collection serve as a financial ledger for auditing user purchases and deductions.
- **Document ID:** `transactionId` (string, uniquely generated)
- **Fields:**
  - `userId`: `string` (Firebase Auth UID)
  - `type`: `string` (e.g. `purchase`, `deduction`, `refund`, `adjustment`)
  - `amount`: `number` (integer, positive or negative credits)
  - `jobId`: `string` (associated job execution, optional)
  - `stripeInvoiceId`: `string` (optional, for purchases)
  - `createdAt`: `timestamp`

### 11.2 REST API Payloads

#### `POST /api/v1/humanize` (Synchronous Humanization Job)

- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer hk_live_xxxxxxxxxxxxxxxxxxxxxxxx`

- **Request Body:**
```json
{
  "text": "In today's rapidly changing world, artificial intelligence is transforming how businesses operate. Furthermore, it is important to note that efficiency increases.",
  "mode": "expert",
  "reflection_level": "advanced"
}
```

- **Response (`200 OK`):**
```json
{
  "job_id": "job_01h2j3k4l5m6n7p8q9r0s1t2u3",
  "status": "completed",
  "text": "Look, AI is completely flipping how businesses run. But here's the thing: the real gain is sheer speed, not just minor optimization.",
  "words_in": 21,
  "words_out": 22,
  "processing_ms": 18450,
  "credits_deducted": 3,
  "quality_metrics": {
    "input_ai_written_percent": 85,
    "human_likeness": 94,
    "ai_detection_resistance": 96,
    "readability": 90,
    "seo_retention": 95,
    "tone_consistency": 88,
    "grammar": 92,
    "overall": 92,
    "summary": "High burstiness achieved. Removed standard AI introductory and transitional phrases successfully."
  }
}
```

---

## 12. Security, Privacy & Data Compliance

Given that users will process proprietary business content, editorial articles, and sensitive documentation, Content Humanizer implements a strict security posture.

### 11.1 Text Data Isolation (Zero-Retention Policy)
- **Transit:** All content processed through the API or Web App is encrypted in transit using TLS 1.3.
- **Storage:** Text content is temporarily stored in private Google Cloud Storage (GCS) buckets with a strict lifecycle rule of **7 days TTL (Time-to-Live)** for debugging and caching purposes. After 7 days, the raw text is permanently purged.
- **Anonymization:** For logs and Firestore metrics, only content metadata (word count, token counts, scores) is retained. Raw text is never stored in Firestore documents.

### 11.2 PII Redaction Filter (Pre-Pipeline)
- Before the text reaches Agent 1 (Intent Extraction), a lightweight PII scrubbing rule runs to detect and flag or mask high-risk personal identifiers (Social Security Numbers, Credit Card details, personal emails).

### 11.3 API Key Protection
- API keys are generated as cryptographically secure random tokens (`hk_live_[32-bytes]`).
- Keys are hashed using SHA-256 before storage in Firestore. Plaintext keys are shown to the user exactly once during creation and cannot be retrieved again.

---

## 13. Operational SLA & Failure Recovery Matrix

Processing text through an 11-agent chain is computationally intensive. The architecture uses synchronous retry loops and standard HTTP status returns to handle failures.

| Scenario | Trigger / Threshold | Recovery / Mitigation Strategy |
|---|---|---|
| **LLM Gateway Timeout** | API call to gateway takes > 15 seconds | Retries up to 3 times per agent step with exponential backoff managed synchronously by the execution pipeline. |
| **Agent Execution Crash** | Python worker terminates unexpectedly | The API gateway catches the error, aborts the request, returns a `500 Internal Server Error` to the client, and unlocks/refunds credits immediately. |

---

## 14. Quality Thresholds & Evaluation Standards

To maintain industry-leading bypass rates, the platform enforces strict QA evaluation metrics.

- **Bypass Guarantee SLA:** For jobs utilizing `maximum` reflection level, the final `ai_detection_resistance` score must be **$\ge 90$**. If the pipeline completes and the score is below 90, the platform automatically triggers an alternative optimization model. If it still fails, the system marks the job as `completed_low_score`, notifies the user, and charges 0 credits.
- **Meaning Coherence Threshold:** Semantic similarity using sentence embeddings must register $\ge 0.85$ comparison against the source text. If meaning drift is detected, the Validator Agent automatically triggers a rewrite of the affected paragraph.

---

*End of PRD. Document approved for development phase implementation.*

---

## 15. Out of Scope (Phase 1 & 2)

The following items are explicitly **not** in scope for the initial release. They may be revisited in later phases.

| Out of Scope Item | Reason / Future Phase |
|---|---|
| Audio / Speech-to-text voice cloning | Unrelated product surface; high complexity. Phase 4+. |
| Multi-language humanization (non-English) | Requires per-language agent prompt tuning. Phase 3+. |
| Native mobile app (iOS / Android) | Web app suffices for MVP. Phase 3+. |
| Real-time collaborative editing (like Google Docs) | Significant WebSocket infrastructure overhead. Phase 4+. |
| Plagiarism detection | Out of platform mandate; a separate tool category. |
| Training custom LLMs | Cost-prohibitive; not needed given prompt-based approach. |

---

## 16. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | LLM provider API price increase (OpenAI, Anthropic) | Medium | High | Multi-provider routing. Route cheaper jobs to Gemini Flash to absorb cost shocks. |
| R2 | AI detector algorithms evolve, reducing bypass rates | High | High | Maintain Agent 8 (Reflection) prompt versioning. Monitor Quality Drift in Admin Dashboard. |
| R3 | Abuse — users submit illegal/PII-heavy content | Medium | High | Pre-pipeline PII Redaction Filter (Section 12.2). ToS with clear usage policy. |
| R4 | Response latency degradation under high concurrent load | Medium | Medium | Set max concurrency limits per container. Implement per-user request throttling at API Gateway. |
| R5 | Stripe payment failure causing credit sync mismatch | Low | High | Credit deduction is always after job success. All credit changes logged to `credit_transactions` ledger. |

---

## 17. Acceptance Criteria (Phase 1 MVP)

The MVP is considered **shippable** when all of the following criteria are met:

- [ ] **Pipeline:** All 11 agents execute sequentially end-to-end for `standard`, `human`, and `expert` modes without errors for inputs up to 2,000 words.
- [ ] **Reflection Loops:** `basic`, `advanced`, and `maximum` reflection levels produce measurably different `ai_detection_resistance` scores (minimum 5-point improvement per loop).
- [ ] **Quality Scoring:** Agent 10 outputs a valid JSON report with all 8 required fields (including `input_ai_written_percent`) on every successful run.
- [ ] **Credit Locking:** Credits are validated and locked on request start, and either deducted (success) or unlocked (failure) synchronously during the response lifecycle.
- [ ] **Job State Sync:** Firestore job status is updated to completed or failed synchronously during the request-response lifecycle.
- [ ] **Playground UI:** Side-by-side diff view and processing status spinner render correctly on Chrome, Safari, and Firefox.
- [ ] **Stripe Billing:** Credit top-up flow completes successfully in test mode with no errors. Credits are added to user balance within 10 seconds of payment confirmation.
- [ ] **Security:** API keys are stored as SHA-256 hashes. Plaintext key is unretrievable after initial display.
- [ ] **Admin Dashboard:** Admin Portal APIs for Task & Cost Management return correct logs, latency stats, and Gemini LLM token costs.

---

## 18. Recommendations: What to Add Next

The following features are not in the current scope but are **strongly recommended** to maximize platform differentiation and revenue:

| # | Recommendation | Business Value | Effort |
|---|---|---|---|
| 1 | **Chrome Extension** — Humanize text directly inside Google Docs or any web text editor. | Massive UX improvement; drives viral adoption among content creators. | Medium |
| 2 | **WordPress / Webflow Plugin** — One-click humanization from within the CMS editor. | Directly targets the agency and blogger segment. | Medium |
| 3 | **Bulk Job API** — Submit a batch of up to 50 documents in one request. | Critical for enterprise customers and large SEO agencies. | Low |
| 4 | **Team Workspaces** — Shared credit pool, shared Voice Profiles, role-based access (Owner, Editor, API Dev). | Unlocks team-level pricing and enterprise contracts. | Medium |
| 5 | **Detector Score Widget** — Embeddable widget (like a badge) showing real-time AI detection score for a piece of content. | Can become a B2B SaaS tool sold separately. | Low |
| 6 | **Content History & Versioning** — Store previous runs and diffs for the same document. | Increases daily active usage and time-on-platform. | Low |
| 7 | **Multi-language Support** — Extend the 11-agent pipeline with language-specific prompt variants for Spanish, French, German. | 3x addressable market expansion. | High |
| 8 | **Slack / Zapier Integration** — Send text via Slack command, receive humanized output in a channel. | Reduces friction for non-technical users in agency workflows. | Low |

---

## 19. Glossary

| Term | Definition |
|---|---|
| **Agent** | A specialized LLM call in the 11-step pipeline, each with a dedicated system prompt and a specific transformation task. |
| **Burstiness** | A statistical measure of sentence length variation. Low burstiness (uniform lengths) is a primary AI detection signal. |
| **Perplexity** | A measure of how "surprising" each next word is. Low perplexity (predictable word choices) indicates AI authorship. |
| **Credit** | The platform's billing currency. 1 Credit = 10 base words processed. |
| **Compute Unit (CU)** | Internal unit mapping credits to actual LLM compute cost for margin tracking. |
| **Reflection Level** | Controls how many Reflection + Revision (Agent 8 & 9) loops run. Options: `basic` (1x), `advanced` (2x), `maximum` (3x). |
| **Voice Vault** | The platform feature that stores a user's personalized writing style fingerprint for use as a pipeline persona. |
| **Bypass SLA** | The service-level guarantee that `maximum` reflection jobs will achieve ≥90 `ai_detection_resistance` or receive a full credit refund. |
| **GCS TTL** | Google Cloud Storage Time-To-Live. Raw text content is auto-deleted from GCS after 7 days. |

---

*Content Humanizer PRD v4.0 — Approved for Engineering Handoff. All sections reviewed and finalized.*
