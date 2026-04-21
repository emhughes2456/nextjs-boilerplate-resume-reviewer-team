// Runs as a child process — isolated from Next.js/Turbopack, fresh state every call
const pdfParse = require("pdf-parse");

const chunks = [];
process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", async () => {
  try {
    const buffer = Buffer.concat(chunks);
    const { text } = await pdfParse(buffer);
    process.stdout.write(text);
    process.exit(0);
  } catch (err) {
    process.stderr.write(err.message);
    process.exit(1);
  }
});
