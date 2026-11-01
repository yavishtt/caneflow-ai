# Experiment 8 CI/CD pipeline and website deployment

## Aim

To implement a CI/CD pipeline for the CaneFlow AI mini project using GitHub Actions and deploy the React website using GitHub Pages.

## Submitted links

- **Live website:** https://yavishtt.github.io/caneflow-ai/
- **Source repository:** https://github.com/yavishtt/caneflow-ai
- **Successful pipeline:** https://github.com/yavishtt/caneflow-ai/actions/runs/41311828745
- **Workflow file:** https://github.com/yavishtt/caneflow-ai/blob/main/.github/workflows/ci-cd.yml

## Implementation

1. Created the public GitHub repository `yavishtt/caneflow-ai` and uploaded the React project. The original college submissions, dependencies and generated build folders are excluded from Git.
2. Added `.github/workflows/ci-cd.yml`. It starts automatically when code is pushed to `main`, when a pull request targets `main`, or when run manually.
3. The **Test and build** job installs Node.js 24 and project dependencies with `npm ci`, runs the tests with coverage, and builds the production website with `npm run build`.
4. The validated `dist` folder is uploaded as the `github-pages` deployment artifact.
5. In repository **Settings → Pages**, selected **GitHub Actions** as the publishing source.
6. The **Deploy verified build** job runs only after the first job passes and only for `main`. It publishes the artifact to GitHub Pages.
7. Opened the public website and checked the landing page, assets and dashboard navigation.

Pipeline: **Push → Install dependencies → Test → Build → Upload artifact → Deploy website**.

Pull requests run checks but do not deploy. Failed tests or a failed build block deployment. Subsequent pushes to `main` automatically update the website after the checks pass.

## Result

Deployment completed on **1 November 2026**. Both jobs in the first pipeline run succeeded. All **64 automated tests** passed, including the **45 Experiment 7 reference cases**, and the React production build completed successfully.

The website is accessible from the live link above without running a local development server.

## Screenshots for the lab submission

Capture or use the saved evidence for:

1. The GitHub repository showing the project files and `.github/workflows/ci-cd.yml`.
2. The successful Actions run showing green **Test and build** and **Deploy verified build** jobs.
3. The published website open at `https://yavishtt.github.io/caneflow-ai/`.

Local screenshot evidence is saved under `docs/screenshots/`. The exact successful run is linked above so its steps and logs can also be inspected directly.

## Conclusion

We implemented a CI/CD pipeline for the CaneFlow AI project using GitHub Actions and deployed the website on GitHub Pages. The pipeline automatically tests, builds and deploys the application when changes are pushed to the main branch, reducing manual deployment work and preventing failed builds from being published.
