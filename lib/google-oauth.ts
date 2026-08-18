import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

function redirectUri() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/api/auth/google/callback`;
}

export function buildAuthorizationUrl({ state, codeChallenge }: { state: string; codeChallenge: string }): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID ?? "");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<{ idToken: string } | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        code,
        redirect_uri: redirectUri(),
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (typeof data.id_token !== "string") return null;

    return { idToken: data.id_token };
  } catch {
    return null;
  }
}

export async function verifyIdToken(idToken: string): Promise<{
  sub: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
} | null> {
  try {
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: "https://accounts.google.com",
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    return {
      sub: String(payload.sub),
      email: typeof payload.email === "string" ? payload.email : null,
      emailVerified: payload.email_verified === true,
      name: typeof payload.name === "string" ? payload.name : null,
    };
  } catch {
    return null;
  }
}
