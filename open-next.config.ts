import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Pages are prerendered; Maps requests use no-store and need no persistent cache.
export default defineCloudflareConfig();
