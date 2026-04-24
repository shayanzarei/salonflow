import VerifyEmailPageClient from "@/components/auth/VerifyEmailPageClient";
import { getRoleHomePath } from "@/lib/auth/role-redirect";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(getRoleHomePath(session));
  }

  return <VerifyEmailPageClient />;
}
