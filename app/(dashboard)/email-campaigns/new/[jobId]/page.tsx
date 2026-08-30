import { notFound } from "next/navigation";

import NewCampaignForm from "@/components/dashboard/NewCampaignForm";
import { verifySession, getUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getDictionaryForUser } from "@/lib/i18n/dictionaries";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const session = await verifySession();
  const user = await getUser();
  const t = getDictionaryForUser(user?.language);
  const { jobId } = await params;

  const job = await prisma.searchJob.findUnique({
    where: { id: jobId },
    include: { results: { orderBy: { confidenceScore: "desc" } } },
  });

  if (!job || job.companyId !== session.companyId || job.searchType !== "WEBSITE" || job.status !== "COMPLETED") {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">{t.newCampaignPage.title}</h1>
        <p className="mt-2 text-xl text-neutral-600">{job.productName}</p>
      </div>

      <NewCampaignForm job={job} results={job.results} />
    </main>
  );
}
