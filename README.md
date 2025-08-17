<picture>
  <source media="(prefers-color-scheme: dark)" srcset="/.github/cover.png">
  <source media="(prefers-color-scheme: light)" srcset="/.github/cover_light.png">
    <img alt="bscm website" src="/.github/cover_light.png">
</picture>

## 🖥️ About

This repository contains the source code for the dashboard, where creators and community members can publish, manage content and more.

It’s designed to be fast, responsive, and easy to use, with a focus on providing a great experience for both players and creators.

> [!WARNING]
> This is a **_work in progress_**! We’re actively developing features and improving the experience. Check back often for updates.

## 🚀 Features

- **Publish and manage content**  
  Tools for creators to easily publish and update charts.
- **Lightweight, responsive UI**  
  Clean, mobile-friendly design focused on user experience.
- **Community-driven**  
   Built by players, for players, with a focus on community needs.

> [!TIP]
> Check out the [wiki](https://github.com/bscommunity/website/wiki) for more details on features, design decisions, and future plans.

## 📦 Project Structure

- `src/` — Main source code (Angular)
    - `app/` — Components, services, routes, and models
        - `components/` — Reusable UI components
        - `services/` — API and utility services
        - `routes/` — Application routes and navigation
        - `models/` — Data models and interfaces
    - `assets/` — Images, icons, and static resources
    - `environments/` — Environment configs
    - `styles/` — Global styles and tokens
    - `types/` — Types for external integrations
- `public/` — Public files (favicon, cover, etc)
- `scripts/` — Utility scripts
- `angular.json`, `tsconfig.json` — Project configs

## 🛠️ Running Locally

1. Install dependencies:
    ```bash
    pnpm install
    ```
2. Start the development server:
    ```bash
    pnpm dev
    ```
3. Open [http://localhost:4200](http://localhost:4200) in your browser.

> Requires [pnpm](https://pnpm.io/) installed.

### Environment Variables

Before running the project locally, you need to configure the environment variables. Use the `.env.example` file as a template to create a `.env` file in the project root:

```bash
cp .env.example .env
```

Fill in the required values in the `.env` file according to your setup.

The `scripts/env.js` script will read these variables and automatically generate the `src/environments/environment.ts` file used by the Angular application. This script runs automatically during the build/start process, but you can also run it manually with:

```bash
node scripts/env.js
```

Make sure all required variables are set to avoid build or runtime errors.

## 🤝 Contributing

Contributions are welcome!

- Found a bug? Open an [issue](https://github.com/bscommunity/bscm/issues)
- Have a feature idea? Suggest or submit a PR
- Into design? We still don’t have an official logo, so send us your ideas!

## 📄 License

This project follows the bscm organization license. See the main repository for details.
