# Optional AWS web deployment

No AWS resources have been provisioned and no deployed URL exists. The optional configuration only packages the current local-preview web app. It does not enable live financial data, hosted models, authentication, account persistence, cloud uploads or private research.

## Pinned tooling

The optional `infra/package.json` and lockfile pin **SST 4.17.1** and **OpenNext 4.1.8**. Registry versions and the official configuration references were checked during implementation. The app uses Next.js 16; the AWS adapter build itself has not been run, so compatibility and the produced resources still require a deployment build check.

The web definition uses 2 GB Lambda memory, a 120-second timeout and Node.js 22. The root `open-next.config.ts` selects `aws-lambda-streaming`. These values follow the [SST Nextjs reference](https://sst.dev/docs/component/aws/nextjs/) and [OpenNext streaming configuration](https://opennext.js.org/aws/migration). Measure streaming and timeout behavior through CloudFront after deployment; the application's local stream test does not verify it.

## Deployment procedure when authorized

Use an existing authorized AWS account/profile with the required permissions. Preserve the configured app identity and stage if continuing an existing environment. Do not create or join an AWS Organization. Do not put credentials in project files.

```powershell
# From the project root; these commands install tooling, then provision AWS resources.
npm ci
npm ci --prefix infra
$env:AWS_PROFILE = 'YOUR_EXISTING_PROFILE'
$env:AWS_REGION = 'us-east-1'
$env:LUNA_APP_NAME = 'luna-terminal'
$env:LUNA_DATA = 'false'
Set-Location infra
npm run deploy -- --stage preview
```

Set `LUNA_DOMAIN` only for a domain you control. Set `APP_ORIGIN` to the final application origin if browser and server origins differ. The preview config returns the URL and an explicit illustrative-preview status. Review the generated resource plan and costs before applying it. Keep authenticated responses out of shared caches once authentication is implemented; current chat/API routes already use no-store headers.

After deployment, run the API smoke check against the returned URL, inspect real browser interaction, verify incremental chat bytes arrive through CloudFront and inspect logs for failures. Quote data remains fictional unless an actual provider adapter replaces it. The process-local quota is not sufficient for multiple Lambda instances; add a shared atomic limiter before operating a public research service.

## Agent HTTP scaffold

The scaffold can be tested locally:

```powershell
node services/agent/server.mjs
```

It listens on `0.0.0.0:8080`, implements `GET /ping` and `POST /invocations`, and returns JSON for the same validated research request. This matches the entry-path portion of the [AgentCore HTTP contract](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-http-protocol-contract.html). AWS documents ARM64 for containers. The container file is a scaffold; no image build, runtime resource, IAM invocation, hosted model, session lifecycle or production streaming has been verified. Never expose this unauthenticated scaffold as a public service.

## Remaining prerequisites

To deliver the complete hosted product, supply an authorized deployment account/stage, build and verify the OpenNext artifacts, connect and test financial providers, implement server-validated authentication and account repositories, then implement the owner-scoped research stack and provider model manifest. Verify real save/reload across devices, extraction/retrieval, rate limits and report snapshot persistence before describing those integrations as active.
