import MainSiteResetPasswordPage from "@/components/marketing/MainSiteResetPasswordPage";
import { getRoleHomePath } from "@/lib/auth/role-redirect";
import { authOptions } from "@/lib/auth-options";
import { isMainSiteHost } from "@/lib/main-site";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ResetPasswordPage() {
  const hdr = await headers();
  const host = hdr.get("x-forwarded-host") ?? hdr.get("host");
  if (!isMainSiteHost(host)) {
    redirect("/");
  }
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(getRoleHomePath(session));
  }

  return <MainSiteResetPasswordPage />;
}
