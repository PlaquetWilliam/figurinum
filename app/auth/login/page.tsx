import { AuthForm } from "@/components/AuthForm";
import { login } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  return <AuthForm action={login} mode="login" callbackUrl={callbackUrl} />;
}
