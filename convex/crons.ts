import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("publish scheduled recipes", { minutes: 5 }, internal.recipes.publishScheduled);

export default crons;
