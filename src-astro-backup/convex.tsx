import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import type { FunctionComponent } from "react";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL);

// HOC to wrap components with Convex provider (for Astro islands)
export function withConvex<Props extends object>(Component: FunctionComponent<Props>) {
  return function WithConvex(props: Props) {
    return (
      <ConvexAuthProvider client={convex}>
        <Component {...props} />
      </ConvexAuthProvider>
    );
  };
}
