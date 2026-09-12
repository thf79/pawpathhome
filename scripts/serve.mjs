import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json"
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    if (!path.extname(pathname)) pathname += ".html";
    const target = path.resolve(rootDir, `.${pathname}`);
    if (!target.startsWith(rootDir + path.sep)) throw new Error("Invalid path");

    const info = await stat(target);
    const file = info.isDirectory() ? path.join(target, "index.html") : target;
    const body = await readFile(file);
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
    response.end(body);
  } catch {
    try {
      const body = await readFile(path.join(rootDir, "404.html"));
      response.writeHead(404, { "Content-Type": mime[".html"] });
      response.end(body);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
    }
  }
});

server.listen(port, () => {
  console.log(`PawPath Home preview: http://localhost:${port}`);
});
