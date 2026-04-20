const required = [
  "VITE_PUBLIC_ENVIRONMENT",
  "VITE_PUBLIC_VERSION",
];

const missing = required.filter(
  (key) => !import.meta.env[key]
);

if (missing.length > 0) {
  throw new Error(
    `[config] Faltan variables de entorno requeridas: ${missing.join(", ")}`
  );
}

export const config = {
  environment: import.meta.env.VITE_PUBLIC_ENVIRONMENT || "local",
  version: import.meta.env.VITE_PUBLIC_VERSION || "dev-local",
  appName: import.meta.env.VITE_APP_NAME || "release-board",
  featureX: import.meta.env.VITE_FEATURE_X_ENABLED === "true",
};