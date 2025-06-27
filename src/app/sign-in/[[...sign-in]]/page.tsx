import { SignIn } from "@clerk/nextjs";
import AuthLayout from "@/components/auth/auth-layout";

export default function Page() {
  return (
    <AuthLayout>
      <SignIn />
    </AuthLayout>
  );
}
