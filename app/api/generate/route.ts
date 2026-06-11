import OpenAI from "openai"

import { MASTER_RESUME_PROMPT } from "@/lib/master-resume-prompt"

export const runtime = "nodejs"

type GenerateRequest = {
  targetFields?: string[]
  targetPreferences?: Record<string, string>
  targetJob?: string
  targetCategory?: string
  targetSubfield?: string
  linkedinUrl?: string
  previousResume?: string
  workHistory?: string
  jobDescription?: string
}

function buildCandidatePrompt({
  targetFields,
  targetPreferences,
  targetJob,
  targetCategory,
  targetSubfield,
  linkedinUrl,
  previousResume,
  workHistory,
  jobDescription,
}: GenerateRequest) {
  return `
Create a tailored business graduate resume and cover letter package using the master rules.

Target career field:
${targetFields?.length ? targetFields.join(", ") : targetCategory || "Not provided"}

Target subfield:
${targetSubfield || "Not provided"}

Specific target job:
${targetJob || "Not provided"}

Target field preferences:
${
  targetPreferences && Object.keys(targetPreferences).length
    ? Object.entries(targetPreferences)
        .map(([field, preference]) => `${field}: ${preference}`)
        .join("\n")
    : "Not provided"
}

LinkedIn URL:
${linkedinUrl || "Not provided"}

Previous resume content:
${previousResume || "Not provided"}

Candidate work history and extra notes:
${workHistory || "Not provided"}

Target job description:
${jobDescription || "Not provided"}

Important constraints:
- If the LinkedIn URL cannot be accessed directly, use it only as profile context and rely on the provided resume and work history.
- Use the selected target fields, field preferences, and specific target job to decide experience ordering, project selection, domain skills, job-match language, and finance language.
- Do not invent employers, degrees, dates, contact details, or credentials that are not supported by the candidate inputs.
- Keep the resume one page in the provided LaTeX template.
- Do not use any em dashes in the final output.
`
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 500 }
    )
  }

  const body = (await request.json()) as GenerateRequest

  if (!body.jobDescription?.trim()) {
    return Response.json(
      { error: "A job description is required." },
      { status: 400 }
    )
  }

  if (!body.previousResume?.trim() && !body.workHistory?.trim()) {
    return Response.json(
      { error: "Add a previous resume or work history before generating." },
      { status: 400 }
    )
  }

  const client = new OpenAI({ apiKey })
  const model = process.env.OPENAI_MODEL || "gpt-5.5-high"

  try {
    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: MASTER_RESUME_PROMPT,
        },
        {
          role: "user",
          content: buildCandidatePrompt(body),
        },
      ],
      reasoning: {
        effort: "high",
      },
      max_output_tokens: 8000,
    })

    return Response.json({
      model,
      output: response.output_text,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "OpenAI generation failed unexpectedly."

    return Response.json({ error: message, model }, { status: 500 })
  }
}
