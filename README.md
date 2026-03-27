# TT-Pulse: Multi-Node Monitoring Ecosystem

TT-Pulse is a professional-grade monitoring solution designed for home-lab environments. It utilizes a decoupled, push-based architecture to provide real-time system metrics and AI-driven health analysis.

## 🏗️ System Architecture

The ecosystem is structured as a **Monorepo** for optimal maintainability:

- **`/agent`**: A lightweight Node.js service running on each node. It pushes system metrics (CPU, RAM) and Git activity to the cloud.
- **`/dashboard`**: A high-performance Next.js 15 application utilizing Tailwind CSS v4 and Supabase Realtime for live visualization.

### Key Technical Decisions

1.  **Push-Based Ingestion**: Unlike traditional pull-based systems (which require complex firewall configurations), TT-Pulse agents push data to Supabase. This makes it firewall-friendly and instantly scalable.
2.  **UPSERT Logic**: To maintain a lightweight database footprint, each node updates its own specific row using a `node_name` unique constraint. This prevents database bloat regardless of node count.
3.  **Real-Time Data Pipeline**: The dashboard utilizes Supabase's PostgreSQL CDC (Change Data Capture) to update the UI instantly without page refreshes.
4.  **Quota-Smart AI Butler**: Integrated with Gemini 2.5 Flash. It includes a multi-layer caching strategy (Supabase + localStorage) to optimize API usage and ensure sub-second response times.

## 🔒 Security Standards

- **Row Level Security (RLS)**: Database policies are configured to allow anonymous ingestion from agents while maintaining read-only access for the public dashboard.
- **Credential Protection**: Strictly utilizes environment variables (`.env`) for all sensitive API keys and database URLs.
- **Modular Config**: The agent is designed to be 'plug-and-play' with zero hardcoded values.

## 🚀 Deployment

1.  **Database**: Execute `/dashboard/supabase/full_reset.sql` in your Supabase SQL Editor.
2.  **Agent**: Deploy via `/agent/deploy_agent.sh` on any Linux/Arch machine.
3.  **Dashboard**: Vercel-ready Next.js application.

---

_An experimental distributed monitoring system showcasing multi-node telemetry and AI-integrated insights_
