import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const host = "127.0.0.1";
const port = 8080;
const directory = fileURLToPath(new URL(".", import.meta.url));
const requiredFields = [
  "e_id",
  "e_secret",
  "auth_battery",
  "auth_battery_pass",
  "auth_battery_secret",
  "auth_project",
  "auth_project_pass",
  "auth_project_secret",
  "admin_panel",
];

function quote(value) {
  return JSON.stringify(String(value));
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/") {
      const html = await readFile(`${directory}/index.html`);
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(html);
      return;
    }

    if (request.method !== "POST" || request.url !== "/configure") {
      response.writeHead(404).end("Not found");
      return;
    }

    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
      size += chunk.length;
      if (size > 64 * 1024) throw new Error("Requête trop volumineuse");
      chunks.push(chunk);
    }

    const data = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (requiredFields.some((field) => !String(data[field] ?? "").trim())) {
      response.writeHead(400).end("Tous les champs sont obligatoires");
      return;
    }

    const env = `ENODE_URL="https://sandbox.api.enode.com"
ENODE_TOKEN_URL="https://oauth.sandbox.enode.io/oauth2/token"
ENODE_CLIENT_ID=${quote(data.e_id)}
ENODE_CLIENT_SECRET=${quote(data.e_secret)}

AUTH_BATTERY=${quote(data.auth_battery)}
AUTH_BATTERY_PASS=${quote(data.auth_battery_pass)}
JWT_SECRET=${quote(data.auth_battery_secret)}

AUTH_PROJECT=${quote(data.auth_project)}
AUTH_PROJECT_PASS=${quote(data.auth_project_pass)}
JWT_SECRET_PROJECT=${quote(data.auth_project_secret)}

ADMIN_PASSWORD=${quote(data.admin_panel)}
`;

    await writeFile(`${directory}/.env`, env, { mode: 0o600 });
    response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Configuration enregistrée", () => server.close());
  } catch (error) {
    response.writeHead(400).end(error.message);
  }
});

server.listen(port, host, () => {
  console.log(`Ouvrez http://${host}:${port} dans votre navigateur.`);
});
