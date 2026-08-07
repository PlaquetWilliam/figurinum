import { AuthForm } from "@/components/AuthForm";
import { signup } from "@/app/actions/auth";

export default function RegisterPage() {
  return <AuthForm action={signup} mode="register" />;
}
