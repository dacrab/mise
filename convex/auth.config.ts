const CLERK_ISSUER = process.env["CLERK_JWT_ISSUER_DOMAIN"];
if (!CLERK_ISSUER) {
  throw new Error("CLERK_JWT_ISSUER_DOMAIN environment variable is required");
}

export default {
  providers: [
    {
      domain: CLERK_ISSUER,
      applicationID: "clerk",
    },
  ],
};
