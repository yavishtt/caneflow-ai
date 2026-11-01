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

CI/CD is configured in `.github/workflows/ci-cd.yml` and documented in README.md. It has not run on GitHub because this folder has no Git repository or remote. Enable GitHub Pages with GitHub Actions after adding the project to a repository.

These results apply to the local frontend and its deterministic demo rules. External IoT, ML/LLM inference, live GIS/weather/SSO, real hardware commands and production security are outside this implementation.
