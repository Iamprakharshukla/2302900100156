const axios = require("axios");

const LOG_API = "http://4.224.186.213/evaluation-service/logs";

const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJwcmFraGFyc2h1a2xhMjk3QGdtYWlsLmNvbSIsImV4cCI6MTc4MDQ2NjYxOCwiaWF0IjoxNzgwNDY1NzE4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMjMwYTg2OTAtYjQ5ZS00OWZiLTljZGMtOTU2OTI1YjMzYTAzIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoicHJha2hhciBzaHVrbGEiLCJzdWIiOiI1MTViYzMzNy05MTdiLTQ3NWQtYWFkYS1iYTYzMmU2OTdjOTcifSwiZW1haWwiOiJwcmFraGFyc2h1a2xhMjk3QGdtYWlsLmNvbSIsIm5hbWUiOiJwcmFraGFyIHNodWtsYSIsInJvbGxObyI6IjIzMDI5MDAxMDAxNTYiLCJhY2Nlc3NDb2RlIjoic2RXV2djIiwiY2xpZW50SUQiOiI1MTViYzMzNy05MTdiLTQ3NWQtYWFkYS1iYTYzMmU2OTdjOTciLCJjbGllbnRTZWNyZXQiOiJCYUdSVFFIZFZORXhhdnRRIn0.PpVX97HO09mvDKDxcAxtc9CP6t8nFBlz7jSGGpRz8oo";

const VALID_STACKS = ["backend", "frontend"];

const VALID_LEVELS = [
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
];

const VALID_PACKAGES = [
  // Backend
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",

  // Frontend
  "api",
  "component",
  "hook",
  "page",
  "state",
  "style",

  // Common
  "auth",
  "config",
  "middleware",
  "utils",
];

async function Log(stack, level, pkg, message) {
  try {
    if (!VALID_STACKS.includes(stack)) {
      throw new Error(`Invalid stack: ${stack}`);
    }

    if (!VALID_LEVELS.includes(level)) {
      throw new Error(`Invalid level: ${level}`);
    }

    if (!VALID_PACKAGES.includes(pkg)) {
      throw new Error(`Invalid package: ${pkg}`);
    }

    if (!message || typeof message !== "string") {
      throw new Error("Message must be a non-empty string");
    }

    const response = await axios.post(
      LOG_API,
      {
        stack,
        level,
        package: pkg,
        message,
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    return response.data;
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data ||
        error.message,
    };
  }
}

module.exports = Log;