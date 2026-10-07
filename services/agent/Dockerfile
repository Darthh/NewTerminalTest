# Build with --platform linux/arm64 for the AgentCore container contract.
# This scaffold is unauthenticated and must not be exposed as a public service.
FROM node:22-alpine
WORKDIR /app
COPY lib ./lib
COPY services/agent/server.mjs ./services/agent/server.mjs
USER node
EXPOSE 8080
CMD ["node", "services/agent/server.mjs"]
