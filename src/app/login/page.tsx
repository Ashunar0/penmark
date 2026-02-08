import { login } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form className="flex w-full max-w-sm flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Login</h1>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded border px-3 py-2"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="rounded border px-3 py-2"
        />

        <button
          formAction={login}
          className="rounded bg-foreground px-4 py-2 text-background"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
