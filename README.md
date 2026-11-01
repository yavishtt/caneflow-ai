# CaneFlow AI

React frontend for **Irrigation Advisory System for Sugarcane Crop using AI and Sensor-based Technology**. Built from the supplied CaneFlow Figma file and the SRS, UML, project plan, black-box testing, and CI/CD experiments in this folder.

- **Live website:** https://yavishtt.github.io/caneflow-ai/
- **Repository:** https://github.com/yavishtt/caneflow-ai
- **CI/CD runs:** https://github.com/yavishtt/caneflow-ai/actions

Experiment 8 deployment was completed on 1 November 2026. See [the experiment implementation and evidence](docs/EXPERIMENT-8.md).

## Run locally

Requires Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open the local address printed in the terminal (normally `http://127.0.0.1:5173`). Dependencies are already installed on this computer. Keep the terminal running during your demonstration.

```sh
npm test                # All 45 Experiment 7 cases and additional regression/UI checks
npm run test:coverage   # Coverage for the domain and workflow logic
npm run build          # Type-check and create dist/
npm run preview        # Serve the production build locally
```

The app is frontend-first and needs no API keys, database, or backend to run. Icons, field images, and fonts are local, so normal page rendering does not depend on Figma or a font CDN.

## What is implemented

- Figma-based landing page, farmer app, supervisor dashboard, agronomist console, admin dashboard, and AI-to-pump workflow map.
- Responsive layouts, accessible form labels, keyboard focus, dialogs, and notifications.
- Per-plot irrigation decisions, multilingual advisories (English, Kannada, Marathi, Hindi), rainfall adjustment, power-window scheduling, and explicit failure alerts.
- Expert validation and duration override with a required reason, shared farmer advisory, pump start/stop simulation, and audit entries.
- Assigned-plot filtering, access-denial auditing, supervisor inspection creation/assignment/completion, farmer feedback, report/evidence downloads.
- Persistent browser-local sample data; reset from Settings. Changing inputs clears the prior approval and stops that plot's simulated pump.
- Interactive Test lab with low/adequate/saturated moisture, rain, no power, stale sensor, noisy sensor and weather-failure presets; manual boundary inputs are supported.

Use the role selector to move between dashboards. It is a demo selector, not an authentication system.

## Five-minute lab walkthrough

1. Start on the landing page. Explain the four roles and the sensor → decision → expert → farmer flow.
2. Click **Review** in the operations preview. Inspect camera/NDVI references, soil readings, weather, and the proposed 42-minute schedule.
3. Enable **Manual override**, set duration to **60** minutes, enter a field-based reason, and click **Validate & send**.
4. Switch to **Farmer view**. The 60-minute recommendation appears. Switch among all four languages, then **Accept & start pump**. The pump state and acknowledgement update. The Controls tab can stop it.
5. Open **Test lab**, switch to agronomist if needed, and try **Rain expected**. Apply it to SC-14. Review the farmer view: the prior approval and pump state are cleared, and irrigation is skipped. Also try no power, 24-hour data loss, the 20 → 95 sensor jump, and a weather outage.
6. Switch to **Supervisor view**. Filter/zoom the illustrative plot map, create and assign an inspection, then complete it.
7. Switch to **Admin view**. Compare regional sample metrics and export a CSV report. Open the workflow map and audit trail to show recorded decisions.
8. Run `npm test` to show the 45 original test IDs passing. Open the GitHub Actions workflow to explain the CI/CD stages.

## Experiment 7 rules and assumptions

| Input | Validation | Decision |
| --- | --- | --- |
| Soil moisture | Finite number, 0–100%; null is missing | Below 30%: irrigation needed. 30–70%: adequate. Above 70%: high/saturated. |
| Forecast rainfall | Finite number, 0–200 mm / 24 h | At least 10 mm: skip irrigation, note rain. |
| Available power | Finite number, 0–24 h / day | Zero: defer needed irrigation and alert farmer. Positive: cap duration to available hours. |
| Reading age | Finite nonnegative number, under 24 h | At 24 h or later: communication failure; withhold recommendation and alert farmer/supervisor. |
| Language | English, Kannada, Marathi, Hindi | Unsupported strings are rejected with the supported-language list. |
| Weather status | Available | Outage withholds recommendation and raises an alert. |

High soil moisture always retains the saturation warning. Significant rain is noted for both dry and adequately moist plots. Invalid data is rejected before any decision. Fractional moisture above 70 is classified as high, closing the integer-only 70/71 boundary gap.

The documents leave duration, stress/loss calculations, noise threshold, and exact power-window timestamps unspecified. These explicit **demo assumptions** are used:

- Required duration = `max(1, round((30 − soil moisture) × 3))` minutes for dry plots without significant rain. The scheduled portion fits within `powerHours × 60`; any remainder is flagged.
- Application depth = duration × `18 / 42` mm. Stress = `max(0, round((30 − moisture) × 3))`%; six-hour delay loss = stress × `0.1733`, rounded to one decimal. These are illustrative values, not validated agronomic or ML predictions.
- A moisture jump greater than 50 percentage points from the last reading is flagged as noisy. Missing, invalid and noisy data are withheld rather than used for irrigation.
- The example window begins at 19:30 IST. Power hours are a capacity constraint, not a real electricity timetable. No actual pump timer or hardware command runs.
- Default SC-14 moisture is **16%** to yield the design's **42-minute / 18 mm** recommendation under the test rules. The Figma mockup includes other 24.8% / 31% examples; this app uses internally consistent rule inputs.

## Tests and traceability

See [docs/TEST-TRACEABILITY.md](docs/TEST-TRACEABILITY.md). The original cases retain their IDs in `src/test/experiment7.test.ts`: 10 ECP + 20 BVA + 8 DT + 7 EG = **45**. Additional tests cover shared UI behavior, persistence, unapproved controls, stale approvals, role restrictions and malformed inputs.

## Experiment 8: CI/CD

The supplied experiment asks for automated integration checks, delivery of a validated build, and deployment after successful checks. `.github/workflows/ci-cd.yml` implements:

1. Push to `main`, pull request to `main`, or manual run starts the pipeline.
2. Install exact versions from `package-lock.json` using `npm ci`.
3. Run the full automated suite with coverage.
4. Type-check and build the React app. Any failure blocks later stages.
5. Upload the `dist` artifact for delivery.
6. Deploy to GitHub Pages on `main` only, after the verify job passes. Pull requests never deploy.

The project is deployed from the public `yavishtt/caneflow-ai` repository. **Settings → Pages → Source** is configured as **GitHub Actions**. Every push to `main` runs the workflow and publishes the validated build. For manual production approval (continuous delivery), configure required reviewers on the `github-pages` environment. Without that gate, successful `main` builds deploy continuously.

For future updates, edit the project, then commit the intended source files and push:

```sh
git add src public index.html package.json package-lock.json
git commit -m "Update CaneFlow website"
git push
```

Check the Actions tab for the green run before refreshing the live website. Original college PDF/DOCX submissions and extracted reference notes are excluded from version control.

The project uses a relative asset base and hash routing, so repository subpaths and refreshed dashboard links work with GitHub Pages. Configuration follows [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) and [Vite deployment guidance](https://vite.dev/guide/static-deploy.html#github-pages).

## Architecture and production boundaries

`src/domain/advisory.ts` contains deterministic decision and language logic. `src/domain/store.ts` holds access checks, decisions, overrides, pump rules and local persistence. React pages use the same domain functions that the tests exercise.

This is a lab prototype. The weather connections, sensor history, imagery dates, factory analytics and model health are sample data. The assistant repeats the current rule-based recommendation; it is not a live LLM. Notifications and audit entries are in-app only. Browser storage preserves local state, but there is no server synchronization, SMS service, trained AI inference, STEPS SSO, real GIS service, or live IoT/pump control. Offline access supports data already loaded in an open app; a cold offline reload is not promised.

Frontend role checks demonstrate the SRS workflows and pass the local access-control cases. They do **not** secure a production multi-user system. Real deployment requires server authentication, authorization on every record/API, encrypted transport, consent and privacy governance, immutable audit records, trusted sensor timestamps and expert-validated agronomic models.

Original PDF references remain unchanged. `reference-notes/` contains extracted text used during implementation.
## Updates
Added project documentation.
