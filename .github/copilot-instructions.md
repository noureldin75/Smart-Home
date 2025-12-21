# Copilot Instructions — Smart-Home (resinex)

Short, actionable guide to help AI assistants be productive working on this Angular SPA.

1) Big picture
- Type: single-page Angular 17 application (project name `resinex`). Entry points: [src/main.ts](src/main.ts) and [src/app/app.config.ts](src/app/app.config.ts).
- Routing is centralized in [src/app/app.routes.ts](src/app/app.routes.ts) (note: route paths are capitalized, e.g. `Home`, `EnergyAnalytics`).
- Feature layout: each feature folder under `src/app/` (e.g. `EnergyAnalytics`, `HomeParts`, `Security`, `profile`) contains a component pair (`*.component.ts` + `*.component.html`). Services live in `src/app/Controllers` and `src/app/services`.

2) Build / run / test
- Start dev server: `npm start` (runs `ng serve` — serves dev configuration from `angular.json`).
- Build production: `npm run build`.
- Run tests: `npm test` (Karma + Jasmine configured in `angular.json`).

3) Key integration points & external deps
- HTTP & env: backend base URL is in [src/environment/environment.ts](src/environment/environment.ts) (`environment.baseUrl`, default: `http://localhost:8080`). Services use `HttpClient` (see [src/app/Controllers/apilight-service.service.ts](src/app/Controllers/apilight-service.service.ts)). Ensure backend CORS allows connections from the dev server (port 4200) to `http://localhost:8080`.
- Server-Sent Events: `AlertService` uses `EventSource` + `NgZone.run()` and `BehaviorSubject` for reactive state in [src/app/services/alert.service.ts](src/app/services/alert.service.ts). Preserve `NgZone.run()` wrapper when moving event callbacks into Angular context. Typical SSE events include `motion`, `alarmCleared`, `temperature` (value updates), `tempAlarm`, and `tempCleared`. Temperature alarms are handled separately from motion: use `temperatureAlert$` for temp state and call `/api/temperature/ack` with a JSON body `{ "command": "SAFE" }` to stop Arduino alarming.
- UI libraries: Angular Material theme is set in `angular.json` (prebuilt indigo-pink). Charts: `ng-apexcharts` / `apexcharts`. Alerts: `sweetalert2` is included in `package.json`.

4) Project-specific conventions (callouts)
- Naming: folders use PascalCase (e.g., `HomeParts`) and components are `X.component.ts` / `X.component.html`; spec files use `*.spec.ts` in the same folder.
- Routing: route keys are case-sensitive and capitalized; use the exact string when constructing router links.
- Services: singletons are providedIn:'root' and expose reactive Observables (BehaviorSubject) for UI subscription; prefer subscribing in `ngOnInit` and unsubscribing in `ngOnDestroy`.

5) Debugging tips
- Dev server default: `ng serve` (port 4200). Backend default: `http://localhost:8080` from environment file. If SSE or POST endpoints fail, verify the backend base URL in [src/environment/environment.ts](src/environment/environment.ts).
- SSE reconnection pattern is in `AlertService.connectToSSE()` — take care not to create duplicate EventSource connections (service calls `close()` before re-creating).

6) Useful code examples to reference
- Router providers: [src/app/app.config.ts](src/app/app.config.ts)
- SSE + NgZone pattern: [src/app/services/alert.service.ts](src/app/services/alert.service.ts)
- Backend calls & env usage: [src/app/Controllers/apilight-service.service.ts](src/app/Controllers/apilight-service.service.ts)

7) When editing
- Keep changes localized to a feature folder when possible. Follow existing file naming and component styles.
- Update `angular.json` only for global build settings (styles/scripts/assets) and be mindful of the prebuilt Material theme entry.

If any of these sections need more detail (examples, testing patterns, CI commands), tell me which area to expand.
