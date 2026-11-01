# Validation record

Validated locally on 22 October 2026.

| Check | Result |
| --- | --- |
| Experiment 7 reference cases | 45 / 45 passed |
| Additional domain/workflow checks | 11 / 11 passed |
| React interaction checks | 8 / 8 passed |
| Total automated tests | **64 / 64 passed** |
| TypeScript + production build | Passed |
| Domain coverage | 100% lines, 100% functions, 99.22% branches, 97.91% statements |
| Installed dependency audit | 0 known vulnerabilities reported after updating testing tools |
| Local preview HTTP check | 200 |
| Original Figma asset download | 165 files present and nonempty |

Commands: `npm run test:coverage`, `npm run build`, `npm audit`.

Browser checks confirmed the landing page, agronomist review, approval delivery to the farmer, acceptance and simulated pump acknowledgement, Kannada advisory, supervisor map/tasks, and admin overview. Images were loaded without broken sources; checked desktop and mobile layouts had no document-level horizontal overflow.

At the time of the original local validation, CI/CD was configured but had not run on GitHub.

## Deployment validation on 1 November 2026

- Published repository: https://github.com/yavishtt/caneflow-ai
- Successful first CI/CD run: https://github.com/yavishtt/caneflow-ai/actions/runs/41311828745
- Commit: `dd4306efb3cdcad276b7fbbed86ef4027edfd5eb`
- **Test and build** job: successful, including dependency installation, coverage tests, production build and artifact upload.
- **Deploy verified build** job: successful, including Pages configuration and deployment.
- Live URL: https://yavishtt.github.io/caneflow-ai/
- Local tests re-run: **64 passed**. Production build passed.
- Live landing page and dashboard navigation verified in the browser; no missing image assets on the landing page.
- Original PDF/DOCX submissions and extracted reference notes are excluded from Git.

These results apply to the local frontend and its deterministic demo rules. External IoT, ML/LLM inference, live GIS/weather/SSO, real hardware commands and production security are outside this implementation.
