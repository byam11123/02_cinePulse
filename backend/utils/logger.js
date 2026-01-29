import winston from "winston";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }),
];

// Only add file transport in non-serverless environments
if (!isProduction) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  );
}

const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: winston.format.json(),
  defaultMeta: { service: "cine-pulse" },
  transports,
});

export default logger;
