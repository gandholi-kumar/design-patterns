/**
 * Global Feature Flag for Base Public Release vs. Full-Fledged Cloud/AI Release.
 *
 * When `false` (Base Public Deployment):
 * - Hides Sign In button and user profile dropdown; enforces client-side browser storage (no cloud DB dependency).
 * - Sets Dark Mode as the default initial theme.
 * - Disables AI Architecture Copilot mode in Decision Engine (defaults to the GoF 3-question decision tree).
 * - Hides the "Backup & settings" option in the side navigation bar.
 * - Retains all other features (Catalog, Playground, Notes Workspace, Dilemmas, Scenarios, Ledger, Quiz).
 *
 * When `true` (Full-Fledged Release):
 * - Re-enables Auth/Sign-In, AI Copilot, Cloud Synchronization with PostgreSQL, and Backup & Settings.
 */
export const ENABLE_FULL_FEATURES = false;
