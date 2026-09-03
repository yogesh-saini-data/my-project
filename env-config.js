// Runtime environment config injected during GitHub Actions build
window.ENV_CONFIG = {
  APP_ENV: "local-dev",
  ACTION_SECRET: "local-dummy-secret",
  BUILD_TIME: new Date().toISOString()
};
