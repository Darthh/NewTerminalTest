/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: process.env.LUNA_APP_NAME || "luna-terminal",
      home: "aws",
      removal: "retain",
      protect: input.stage === "production",
      providers: { aws: { region: process.env.AWS_REGION || "us-east-1" } },
    };
  },
  async run() {
    if (process.env.LUNA_DATA === "true") {
      throw new Error(
        "Account infrastructure is not implemented in this preview. Add reviewed account adapters and infrastructure before enabling LUNA_DATA.",
      );
    }
    const web = new sst.aws.Nextjs("LunaWeb", {
      path: "..",
      openNextVersion: "4.1.8",
      domain: process.env.LUNA_DOMAIN || undefined,
      server: {
        memory: "2048 MB",
        timeout: "120 seconds",
        runtime: "nodejs22.x",
      },
      environment: {
        APP_ORIGIN: process.env.APP_ORIGIN || "",
        LUNA_ANONYMOUS_HOURLY_LIMIT:
          process.env.LUNA_ANONYMOUS_HOURLY_LIMIT || "15",
      },
      invalidation: { wait: true },
    });
    return {
      url: web.url,
      mode: "illustrative-preview",
      accountInfrastructure: false,
    };
  },
});
