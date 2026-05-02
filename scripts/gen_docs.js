import { createMarkdownFromOpenApi } from "@scalar/openapi-to-markdown";
import fs from "node:fs/promises";

async function generateDocs() {
  try {
    // Read .env to find the backend URL
    const envContent = await fs.readFile(".env", "utf8");
    const match = envContent.match(/^backend=(.*)$/m);
    if (!match || !match[1]) {
      console.error("Could not find backend in .env");
      process.exit(1);
    }
    const backendUrl = match[1].trim();
    const openApiUrl = `${backendUrl}/v3/api-docs`;

    console.log(`Fetching OpenAPI data from ${openApiUrl}...`);
    const response = await fetch(openApiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI JSON: ${response.statusText}`);
    }
    const openApiData = await response.json();

    if (openApiData.paths) {
      for (const path in openApiData.paths) {
        for (const method in openApiData.paths[path]) {
          const operation = openApiData.paths[path][method];

          // 1. Remove 422 Validation Error from all paths
          if (openApiData.paths[path][method].responses) {
            delete openApiData.paths[path][method].responses["422"];
          }

          // 2. check if need security
          if (operation.security && operation.security.length > 0) {
            const authNotice =
              "\n\n> 🔒 **Auth Required** \n> Need take `Authorization: Bearer <token>` in Headers.";
            if (operation.description) {
              operation.description += authNotice;
            } else {
              operation.description = authNotice;
            }
          }
        }
      }
    }

    console.log("Generating Markdown...");
    const markdown = await createMarkdownFromOpenApi(openApiData);

    await fs.writeFile("src/api/API_docs.md", markdown, "utf8");
    console.log("Successfully generated API_docs.md");
  } catch (error) {
    console.error("Error generating docs:", error);
    process.exit(1);
  }
}

generateDocs();
