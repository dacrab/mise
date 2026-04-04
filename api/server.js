// Vercel Node.js Serverless Function
// TanStack Start's SSR handler uses AsyncLocalStorage (node:async_hooks),
// so it must run on Node.js runtime, not Edge.
import handler from "../dist/server/server.js";

export default async function (req, res) {
  // Convert Node.js IncomingMessage to a Web API Request
  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const url = new URL(req.url, `${protocol}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, value);
    }
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody
    ? new ReadableStream({
        start(controller) {
          req.on("data", (chunk) => controller.enqueue(chunk));
          req.on("end", () => controller.close());
          req.on("error", (err) => controller.error(err));
        },
      })
    : undefined;

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
    // @ts-ignore — duplex required when body is a ReadableStream in Node 18+
    duplex: hasBody ? "half" : undefined,
  });

  const response = await handler.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }

  res.end();
}
