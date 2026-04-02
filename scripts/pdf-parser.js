// Runs as a child process — isolated from Next.js/Turbopack, fresh state every call
const pdfjsLib = require("pdfjs-dist/build/pdf.js");
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  "pdfjs-dist/build/pdf.worker.js"
);

const chunks = [];
process.stdin.on("data", (chunk) => chunks.push(chunk));
process.stdin.on("end", async () => {
  try {
    const buffer = Buffer.concat(chunks);
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdfDoc = await loadingTask.promise;

    let text = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ") + "\n\n";
      page.cleanup();
    }

    await pdfDoc.destroy();
    process.stdout.write(text);
    process.exit(0);
  } catch (err) {
    process.stderr.write(err.message);
    process.exit(1);
  }
});
