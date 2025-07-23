import { Hono } from "jsr:@hono/hono";
import { serveStatic } from "jsr:@hono/hono/deno";

const app = new Hono();

function registerFileRouter(ctx: Hono, path: string) {
  const files: string[] = [];
  for (const dirent of Deno.readDirSync(`public${path}/files`)) {
    if (dirent.isFile && dirent.name.match(/.*\.(png|gif|jpg|jpeg|webp)$/i))
      files.push(dirent.name);
  }

  ctx.get(path, (c) =>
    c.redirect(
      `${path}/files/${encodeURIComponent(
        files[Math.floor(Math.random() * files.length)]
      )}`
    )
  );
  ctx.get(`${path}/files`, (c) => c.html(`
<html><body>
<ul>
  ${files.toSorted().map(file => `<li><a href="${path}/files/${file}" target="_blank">${file}</a></li>`).join("\n  ")}
</ul>
</body></html>
`));
  ctx.get(
    `${path}/files/*`,
    serveStatic({
      root: "public",
    })
  );
}

app.get("/", serveStatic({ root: "./public" }));
registerFileRouter(app, "/cta");
registerFileRouter(app, "/meme");
registerFileRouter(app, "/bird");

Deno.serve({ port: Number(Deno.env.get("PORT")) || 6000 }, app.fetch);
