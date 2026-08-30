"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { runContactFinderJob } from "@/lib/leadfinder/contactPipeline";

export async function startContactFinder(formData: FormData): Promise<void> {
  const session = await verifySession();
  const jobId = formData.get("jobId");
  if (typeof jobId !== "string" || !jobId) return;

  const job = await prisma.searchJob.findUnique({ where: { id: jobId } });
  if (!job || job.companyId !== session.companyId) return;
  if (job.searchType !== "WEBSITE" || job.status !== "COMPLETED") return;
  if (job.contactFinderStatus === "PENDING" || job.contactFinderStatus === "RUNNING") return;

  await prisma.searchJob.update({ where: { id: jobId }, data: { contactFinderStatus: "PENDING" } });

  after(() => runContactFinderJob(jobId));

  revalidatePath(`/lead-finder/results/${jobId}`);
  redirect(`/lead-finder/results/${jobId}`);
}
