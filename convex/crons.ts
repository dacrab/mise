import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily("cleanup old recipe views", { hourUTC: 3, minuteUTC: 0 }, internal.recipes.cleanupOldViews);
crons.interval("publish scheduled recipes", { minutes: 5 }, internal.recipes.publishScheduled);

export default crons;
