import { assertAdminPageAccess } from "@/lib/admin/auth";

/** Server-side admin gate for all `/[locale]/admin/*` pages. */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await assertAdminPageAccess();
  return children;
}
