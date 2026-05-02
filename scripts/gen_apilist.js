import fs from "node:fs";
import readline from "node:readline";

async function generateApiList() {
  const inputPath = "src/api/API_docs.md";
  const outputPath = "src/api/API_list.txt";

  try {
    const fileStream = fs.createReadStream(inputPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    const outputStream = fs.createWriteStream(outputPath);

    const paths = new Set();
    for await (const line of rl) {
      const match = line.match(/Path:.*?\`(.*?)\`/);
      if (match) {
        paths.add(match[1]);
      }
    }

    for (const path of paths) {
      outputStream.write(path + "\n");
    }

    outputStream.end();
    console.log(`Successfully generated ${outputPath} from ${inputPath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error(
        `Error: ${inputPath} not found. Please run scripts/gen_docs.js first.`,
      );
    } else {
      console.error("Error generating API list:", error);
    }
    process.exit(1);
  }
}

generateApiList();
