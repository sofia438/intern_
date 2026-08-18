"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { SearchJobFormSchema, type FormState } from "@/lib/definitions";
import { runSearchJob } from "@/lib/leadfinder/pipeline";

export async function startSearchJob(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const validatedFields = SearchJobFormSchema.safeParse({
    productName: formData.get("productName"),
    oemNumber: formData.get("oemNumber") || undefined,
    hsCode: formData.get("hsCode") || undefined,
    imageDescription: formData.get("imageDescription") || undefined,
    countries: formData.getAll("countries"),
    searchEngines: formData.getAll("searchEngines"),
    competitorBrands: formData.getAll("competitorBrands"),
    relatedIndustries: formData.getAll("relatedIndustries"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const activeJob = await prisma.searchJob.findFirst({
    where: { companyId: session.companyId, status: { in: ["PENDING", "RUNNING"] } },
  });

  if (activeJob) {
    return { message: "A search is already running for your company. Please wait for it to finish." };
  }

  const {
    productName,
    oemNumber,
    hsCode,
    imageDescription,
    countries,
    searchEngines,
    competitorBrands,
    relatedIndustries,
  } = validatedFields.data;

  const job = await prisma.searchJob.create({
    data: {
      companyId: session.companyId,
      userId: session.userId,
      productName,
      oemNumber,
      hsCode,
      imageDescription,
      countries,
      searchEngines,
      competitorBrands,
      relatedIndustries,
    },
  });

  after(() => runSearchJob(job.id));

  redirect(`/lead-finder/results/${job.id}`);
}
