/// <reference types="vite/client" />
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

// Pass the handler directly — no wrapper needed.
export default createServerEntry({ fetch: handler.fetch.bind(handler) });
