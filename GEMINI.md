# Gemini CLI Project Mandates

This file contains project-specific instructions that the Gemini CLI must follow at all times. These instructions take precedence over general system prompts.

## 🟢 Mandatory Pre-Delivery Checks
Before any task is considered "complete" or "delivered," the following checks **MUST** be performed:

1.  **TypeScript Validation**: Run `npm run tsc` or `npx tsc --noEmit` in the `dashboard` directory to ensure no type regressions were introduced.
2.  **Linting**: Run `npm run lint` in the `dashboard` directory to ensure code style consistency.
3.  **No Reverts**: Never revert the "Bengal Cat" or "Developer Den" naming/theme back to "Butler/SRE" unless explicitly asked.

## 🐆 Project Identity & Theme
*   **Brand**: tt family's Dev Studio (Professional, Family-Owned).
*   **Mascot**: Texas - Studio Guardian (Bengal Cat SVG with Breathing/Tail animations).
*   **Tone**: Hardworking Developer Family / High-Performance Studio.
*   **Color Palette**: Amber (#f59e0b) and Orange.
*   **Status Labels**: 
    *   Online = "Grinding"
    *   Offline = "Sleeping"
    *   Node = "Station"
    *   Infrastructure = "Active Workstations"
    *   Commits = "Conquests"

## 🛠️ Technical Standards
*   **Local AI**: Heuristic engine in `dashboard/app/api/insights/route.ts` with real-time data integration.
*   **Insights Personality**: Texas provides "Cool Facts" using live metrics (CPU totals, RAM averages, commit counts) mixed with witty cat observations.
*   **Mascot**: Use the `BengalMascot.tsx` component for the large, animated studio guardian.
