import { redirect } from "next/navigation";

import ProfileSetupWizard from "@/components/dashboard/ProfileSetupWizard";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export default async function ProfileSetupPage() {
  const session = await verifySession();

  const [company, user] = await Promise.all([
    prisma.company.findUnique({ where: { id: session.companyId } }),
    prisma.user.findUnique({ where: { id: session.userId } }),
  ]);
  if (!company || !user) redirect("/login");
  if (company.profileCompletedAt) redirect("/dashboard");

  const [products, referenceWebsites] = await Promise.all([
    prisma.product.findMany({ where: { companyId: session.companyId }, orderBy: { createdAt: "asc" } }),
    prisma.referenceWebsite.findMany({ where: { companyId: session.companyId }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <ProfileSetupWizard
      email={user.email}
      fullName={user.name}
      companyName={company.name}
      website={company.website ?? ""}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        englishName: p.englishName,
        hsCode: p.hsCode,
        hasImage: p.image !== null,
      }))}
      referenceWebsites={referenceWebsites.map((w) => ({ id: w.id, url: w.url }))}
    />
  );
}
