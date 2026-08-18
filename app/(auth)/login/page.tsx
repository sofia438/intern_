import LoginForm from "@/components/auth/LoginForm";

const errorMessages: Record<string, string> = {
  oauth_failed: "Something went wrong signing in with Google. Please try again.",
  oauth_gmail_only: "Please sign in with a @gmail.com Google account.",
  oauth_email_taken: "An account with this email already exists. Sign in with your password instead.",
  oauth_not_configured: "Google sign-in isn't configured yet.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] ?? "Something went wrong. Please try again." : null;

  return (
    <>
      {errorMessage && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</p>
      )}
      <LoginForm />
    </>
  );
}
