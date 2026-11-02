/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as bookmarks from "../bookmarks.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_categories from "../lib/categories.js";
import type * as lib_media from "../lib/media.js";
import type * as lib_recipes from "../lib/recipes.js";
import type * as lib_validators from "../lib/validators.js";
import type * as rateLimit from "../rateLimit.js";
import type * as recipes from "../recipes.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  bookmarks: typeof bookmarks;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/categories": typeof lib_categories;
  "lib/media": typeof lib_media;
  "lib/recipes": typeof lib_recipes;
  "lib/validators": typeof lib_validators;
  rateLimit: typeof rateLimit;
  recipes: typeof recipes;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
