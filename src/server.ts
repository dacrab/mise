import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { initServerSentry } from "./sentry.server";

initServerSentry();

const fetch = createStartHandler(defaultStreamHandler);

export default { fetch };
