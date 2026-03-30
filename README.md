<p align="center">
  <img src="dashboard/public/pulse-logo.png" width="250" alt="TT-Pulse Logo">
</p>

# TT-Pulse: SRE-Inspired Infrastructure Monitoring

**TT-Pulse** is a high-performance monitoring ecosystem designed for local infrastructure, bridging the gap between raw system telemetry and developer productivity. Built with a "Security-First" mindset, it provides real-time observability into distributed nodes while ensuring absolute data privacy.

---

## ⚡ The Concept
TT-Pulse transforms standard server monitoring into a proactive SRE (Site Reliability Engineering) tool. It treats home-lab nodes as "Active Workstations" and correlates system health with development velocity. 

- **Grinding vs. Sleeping**: Real-time status tracking using high-precision heartbeats.
- **Conquest Correlation**: Tracks GitHub activity alongside CPU/RAM trends to identify how development sprints impact system load.

## 🐾 The Intelligence: "Texas" AI
The ecosystem features **Texas**, a Bengal-inspired AI persona that acts as the studio guardian. 
- **Proactive Insights**: Correlates telemetry data with Git commits to
 provide witty, actionable observations.
- **Resilience Engineering**: Powered by a custom **SRE Fallback Engine**. While architected to support **Gemini 1.5 Flash**, the system currently utilizes a high-performance heuristic engine in `dashboard/app/api/insights/route.ts` to maintain 100% uptime during API rate limits or outages.

## 🏗️ Full-Stack Architecture
- **Frontend**: Next.js 16 (utilizing Turbopack for lightning-fast HMR) and Tailwind CSS 4.
- **Visualization**: Tremor for low-latency, time-series data rendering.
- **Backend**: Supabase with Real-time CDC (Change Data Capture) for instant UI updates.
- **Edge Agent**: Lightweight Node.js collectors running on Arch Linux, communicating via a secure Supabase backbone.

## 🛡️ Security & Data Integrity
Data privacy is not an afterthought; it is baked into the core architecture:
- **The Data Washer**: A specialized sanitization layer in the agent (`ops.js`) that strips sensitive information. It automatically removes absolute file paths (e.g., `/home/user/`) and process arguments before they ever leave the local machine.
- **Defense-in-Depth**: Implements **Row Level Security (RLS)** at the database layer, ensuring that telemetry data is strictly isolated and accessible only to authorized sessions.

## 📈 Resilience Engineering
The dashboard is designed for high availability. In the event of an upstream LLM outage, the **SRE Fallback Engine** takes over, ensuring the "Texas" persona remains active and providing insights based on local deterministic patterns.

---
*Developed for TT Family's Dev Studio — Professional Development, Family Owned.*
