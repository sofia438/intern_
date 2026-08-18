"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { MapsSearchJobFormSchema, type FormState } from "@/lib/definitions";
import { runMapsSearchJob } from "@/lib/leadfinder/mapsPipeline";

export async function startMapsSearchJob(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const validatedFields = MapsSearchJobFormSchema.safeParse({
    countries: formData.getAll("countries"),
    keyword: formData.get("keyword") || undefined,
    industry: formData.get("industry") || undefined,
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

  const { countries, keyword, industry } = validatedFields.data;

  const cityCountries = formData.getAll("cityCountry").map(String);
  const cityValues = formData.getAll("cityValue").map(String);
  const cityByCountry: Record<string, string> = {};
  cityCountries.forEach((code, i) => {
    if (cityValues[i]) cityByCountry[code] = cityValues[i];
  });

  const job = await prisma.searchJob.create({
    data: {
      companyId: session.companyId,
      userId: session.userId,
      searchType: "MAPS",
      productName: keyword || industry || "Businesses",
      countries,
      cityByCountry,
      industry,
    },
  });

  after(() => runMapsSearchJob(job.id));

  redirect(`/lead-finder/results/${job.id}`);
}
