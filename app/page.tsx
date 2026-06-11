"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import type { Provider, User } from "@supabase/supabase-js"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronLeft,
  Clipboard,
  Code,
  Database,
  ExternalLink,
  FileText,
  HandCoins,
  Landmark,
  Link,
  LoaderCircle,
  LockKeyhole,
  Mail,
  PieChart,
  Plus,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  UserCircle,
  type LucideIcon,
} from "lucide-react"

import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type {
  JobListing,
  TargetPreferences,
  WorkHistoryDraft,
} from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type Step = "landing" | "fields" | "preferences" | "job-select" | "auth" | "builder"

type CareerField = {
  name: string
  label: string
  description: string
  icon: LucideIcon
  subfields: string[]
}

type GenerateResponse = {
  model?: string
  output?: string
  error?: string
}

const CAREER_FIELDS: CareerField[] = [
  {
    name: "Investment Banking",
    label: "Deals",
    description: "Advisory, capital markets, and coverage roles.",
    icon: Landmark,
    subfields: ["M&A", "ECM", "DCM", "Restructuring"],
  },
  {
    name: "Strategy Consulting",
    label: "Advisory",
    description: "Strategy, diligence, operations, and digital work.",
    icon: BriefcaseBusiness,
    subfields: ["Strategy", "CDD", "Ops", "Digital"],
  },
  {
    name: "Private Equity",
    label: "Investing",
    description: "Buyouts, growth equity, credit, and real assets.",
    icon: HandCoins,
    subfields: ["Buyout", "Growth", "Credit", "Infra"],
  },
  {
    name: "Hedge Funds",
    label: "Markets",
    description: "Equity, macro, quantitative, and credit investing.",
    icon: TrendingUp,
    subfields: ["L/S Equity", "Macro", "Quant", "Credit"],
  },
  {
    name: "Sales & Trading",
    label: "Trading",
    description: "Client sales, rates, credit, FX, and structuring.",
    icon: PieChart,
    subfields: ["Equity Sales", "Rates", "Credit", "FX"],
  },
  {
    name: "Transaction Advisory",
    label: "Services",
    description: "Diligence, valuation, integration, tax, and IPO support.",
    icon: BadgeDollarSign,
    subfields: ["FDD", "Valuations", "Tax", "IPO"],
  },
]

const FIELD_PREFERENCES: Record<string, string[]> = {
  "Investment Banking": [
    "Bulge Bracket",
    "Elite Boutique",
    "Middle Market",
    "Regional Boutique",
  ],
  "Strategy Consulting": ["MBB", "Other Consultancies"],
}

const TARGET_JOBS: Record<string, string[]> = {
  "Investment Banking": [
    "Investment Banking Analyst",
    "M&A Analyst",
    "Capital Markets Analyst",
    "Restructuring Analyst",
  ],
  "Strategy Consulting": [
    "Strategy Analyst",
    "Business Analyst",
    "Management Consultant",
    "Implementation Consultant",
  ],
  "Private Equity": [
    "Private Equity Analyst",
    "Growth Equity Analyst",
    "Private Credit Analyst",
    "Investment Analyst",
  ],
  "Hedge Funds": [
    "Investment Research Analyst",
    "Equity Research Analyst",
    "Quant Research Analyst",
    "Credit Research Analyst",
  ],
  "Sales & Trading": [
    "Sales & Trading Analyst",
    "Rates Trading Analyst",
    "Credit Trading Analyst",
    "Structuring Analyst",
  ],
  "Transaction Advisory": [
    "Transaction Advisory Analyst",
    "Financial Due Diligence Analyst",
    "Valuations Analyst",
    "Deal Advisory Analyst",
  ],
}

function getRequiredPreferenceFields(selectedFields: string[]) {
  return selectedFields.filter((field) => FIELD_PREFERENCES[field])
}

function createEmptyWorkHistory(): WorkHistoryDraft {
  return {
    company: "",
    role_title: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
    achievements: "",
  }
}

function splitOutput(output: string) {
  const latexMatch = output.match(
    /LATEX_RESUME\s*([\s\S]*?)\s*COVER_LETTER\s*([\s\S]*)/i
  )

  if (!latexMatch) {
    return { latex: output, coverLetter: "" }
  }

  return {
    latex: latexMatch[1]?.trim() || "",
    coverLetter: latexMatch[2]?.trim() || "",
  }
}

function stringifyWorkHistory(entries: WorkHistoryDraft[]) {
  return entries
    .filter((entry) => entry.company.trim() || entry.role_title.trim())
    .map((entry) =>
      [
        `Company: ${entry.company || "Not provided"}`,
        `Role: ${entry.role_title || "Not provided"}`,
        `Location: ${entry.location || "Not provided"}`,
        `Dates: ${entry.start_date || "Not provided"} to ${
          entry.end_date || "Present"
        }`,
        `Description: ${entry.description || "Not provided"}`,
        `Achievements: ${entry.achievements || "Not provided"}`,
      ].join("\n")
    )
    .join("\n\n")
}

export default function Page() {
  const supabaseReady = isSupabaseConfigured()
  const supabase = useMemo(
    () => (supabaseReady ? createClient() : null),
    [supabaseReady]
  )
  const [step, setStep] = useState<Step>("landing")
  const [user, setUser] = useState<User | null>(null)
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [targetPreferences, setTargetPreferences] = useState<TargetPreferences>(
    {}
  )
  const [selectedTargetJob, setSelectedTargetJob] = useState("")
  const [fullName, setFullName] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [previousResume, setPreviousResume] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState("")
  const [workHistoryEntries, setWorkHistoryEntries] = useState<
    WorkHistoryDraft[]
  >([createEmptyWorkHistory()])
  const [jobDescription, setJobDescription] = useState("")
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [output, setOutput] = useState("")
  const [error, setError] = useState("")
  const [authMessage, setAuthMessage] = useState("")
  const [authEmail, setAuthEmail] = useState("")
  const [authPassword, setAuthPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [isAuthLoading, setIsAuthLoading] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const result = useMemo(() => splitOutput(output), [output])
  const workHistory = useMemo(
    () => stringifyWorkHistory(workHistoryEntries),
    [workHistoryEntries]
  )

  useEffect(() => {
    if (!supabase) {
      return
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setAuthMessage("")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!supabase || !user) {
      return
    }

    supabase
      .from("user_profiles")
      .select(
        "full_name, linkedin_url, target_fields, target_preferences, target_job"
      )
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          return
        }

        setFullName(data.full_name || "")
        setLinkedinUrl(data.linkedin_url || "")
        setSelectedTargetJob(data.target_job || "")
        if (
          data.target_preferences &&
          typeof data.target_preferences === "object" &&
          !Array.isArray(data.target_preferences)
        ) {
          setTargetPreferences(data.target_preferences as TargetPreferences)
        }
        if (Array.isArray(data.target_fields) && data.target_fields.length) {
          setSelectedFields(data.target_fields)
        }
      })

    supabase
      .from("user_work_history")
      .select(
        "company, role_title, location, start_date, end_date, description, achievements"
      )
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data?.length) {
          setWorkHistoryEntries(
            data.map((entry) => ({
              company: entry.company || "",
              role_title: entry.role_title || "",
              location: entry.location || "",
              start_date: entry.start_date || "",
              end_date: entry.end_date || "",
              description: entry.description || "",
              achievements: entry.achievements || "",
            }))
          )
        }
      })
  }, [supabase, user])

  useEffect(() => {
    if (!supabase || selectedFields.length === 0) {
      return
    }

    const client = supabase

    async function loadListings() {
      const { data: categories } = await client
        .from("job_categories")
        .select("id, name")
        .in("name", selectedFields)

      const categoryIds = categories?.map((category) => category.id) || []

      if (!categoryIds.length) {
        setJobListings([])
        return
      }

      const { data } = await client
        .from("job_listings")
        .select("*")
        .in("category_id", categoryIds)
        .eq("is_active", true)
        .order("posted_at", { ascending: false, nullsFirst: false })
        .limit(12)

      setJobListings((data || []) as JobListing[])
    }

    loadListings()
  }, [supabase, selectedFields])

  function toggleField(field: string) {
    setSelectedFields((current) => {
      if (!current.includes(field)) {
        return [...current, field]
      }

      setTargetPreferences((preferences) => {
        const next = { ...preferences }
        delete next[field]
        return next
      })

      return current.filter((item) => item !== field)
    })
  }

  function choosePreference(field: string, preference: string) {
    setTargetPreferences((current) => ({
      ...current,
      [field]: preference,
    }))
  }

  function findJob() {
    setStep("builder")
  }

  function continueFromFields() {
    setStep(
      getRequiredPreferenceFields(selectedFields).length
        ? "preferences"
        : "job-select"
    )
  }

  function continueFromTargetJob() {
    setStep(user ? "builder" : "auth")
  }

  async function signInWithProvider(provider: Provider) {
    if (!supabase) {
      setAuthMessage("Add Supabase environment variables before signing in.")
      return
    }

    setIsAuthLoading(true)
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    })

    if (authError) {
      setAuthMessage(authError.message)
    }
    setIsAuthLoading(false)
  }

  async function submitEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase) {
      setAuthMessage("Add Supabase environment variables before signing in.")
      return
    }

    setIsAuthLoading(true)
    setAuthMessage("")

    const result = isSignUp
      ? await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { emailRedirectTo: window.location.origin },
        })
      : await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        })

    if (result.error) {
      setAuthMessage(result.error.message)
    } else if (isSignUp) {
      setAuthMessage("Check your email to confirm your account.")
    }

    setIsAuthLoading(false)
  }

  async function signOut() {
    await supabase?.auth.signOut()
    setUser(null)
    setStep("landing")
  }

  async function saveProfileAndContinue() {
    if (!supabase || !user) {
      setAuthMessage("Sign in before saving your profile.")
      return
    }

    setIsProfileSaving(true)
    setAuthMessage("")

    const { error: profileError } = await supabase.from("user_profiles").upsert({
      user_id: user.id,
      full_name: fullName,
      linkedin_url: linkedinUrl,
      target_fields: selectedFields,
      target_preferences: targetPreferences,
      target_job: selectedTargetJob,
    })

    if (profileError) {
      setAuthMessage(profileError.message)
      setIsProfileSaving(false)
      return
    }

    if (resumeFile) {
      const safeName = resumeFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")
      const filePath = `${user.id}/${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, resumeFile)

      if (uploadError) {
        setAuthMessage(uploadError.message)
        setIsProfileSaving(false)
        return
      }

      await supabase.from("user_resumes").insert({
        user_id: user.id,
        file_name: resumeFile.name,
        file_path: filePath,
        file_type: resumeFile.type,
        file_size: resumeFile.size,
      })

      setResumeFileName(resumeFile.name)
    }

    await supabase.from("user_work_history").delete().eq("user_id", user.id)

    const rows = workHistoryEntries
      .filter((entry) => entry.company.trim() || entry.role_title.trim())
      .map((entry, index) => ({
        user_id: user.id,
        company: entry.company,
        role_title: entry.role_title,
        location: entry.location,
        start_date: entry.start_date,
        end_date: entry.end_date,
        description: entry.description,
        achievements: entry.achievements,
        sort_order: index,
      }))

    if (rows.length) {
      const { error: workError } = await supabase
        .from("user_work_history")
        .insert(rows)

      if (workError) {
        setAuthMessage(workError.message)
        setIsProfileSaving(false)
        return
      }
    }

    setIsProfileSaving(false)
    setStep("fields")
  }

  function updateWorkHistory(
    index: number,
    key: keyof WorkHistoryDraft,
    value: string
  ) {
    setWorkHistoryEntries((entries) =>
      entries.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, [key]: value } : entry
      )
    )
  }

  function addWorkHistory() {
    setWorkHistoryEntries((entries) => [...entries, createEmptyWorkHistory()])
  }

  function removeWorkHistory(index: number) {
    setWorkHistoryEntries((entries) =>
      entries.length === 1
        ? [createEmptyWorkHistory()]
        : entries.filter((_entry, entryIndex) => entryIndex !== index)
    )
  }

  async function generateResume(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setOutput("")
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetFields: selectedFields,
          targetCategory: selectedFields.join(", "),
          targetPreferences,
          targetJob: selectedTargetJob,
          linkedinUrl,
          previousResume,
          workHistory,
          jobDescription,
        }),
      })

      const data = (await response.json()) as GenerateResponse

      if (!response.ok) {
        throw new Error(data.error || "Generation failed.")
      }

      setOutput(data.output || "")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Generation failed.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071120] text-white">
      <Background />
      <Nav
        userEmail={user?.email || ""}
        onHome={() => setStep("landing")}
        onSignOut={signOut}
      />

      <AnimatePresence mode="wait">
        {step === "landing" ? (
          <LandingScreen key="landing" onFindJob={findJob} />
        ) : null}

        {step === "auth" ? (
          <AuthWall
            key="auth"
            user={user}
            supabaseReady={supabaseReady}
            fullName={fullName}
            linkedinUrl={linkedinUrl}
            resumeFileName={resumeFileName}
            workHistoryEntries={workHistoryEntries}
            authEmail={authEmail}
            authPassword={authPassword}
            authMessage={authMessage}
            isSignUp={isSignUp}
            isAuthLoading={isAuthLoading}
            isProfileSaving={isProfileSaving}
            onBack={() => setStep("job-select")}
            onProviderSignIn={signInWithProvider}
            onEmailAuth={submitEmailAuth}
            onToggleAuthMode={() => setIsSignUp((value) => !value)}
            setAuthEmail={setAuthEmail}
            setAuthPassword={setAuthPassword}
            setFullName={setFullName}
            setLinkedinUrl={setLinkedinUrl}
            setResumeFile={setResumeFile}
            updateWorkHistory={updateWorkHistory}
            addWorkHistory={addWorkHistory}
            removeWorkHistory={removeWorkHistory}
            onContinue={saveProfileAndContinue}
          />
        ) : null}

        {step === "fields" ? (
          <FieldPicker
            key="fields"
            selectedFields={selectedFields}
            onToggle={toggleField}
            onBack={() => setStep("auth")}
            onContinue={continueFromFields}
          />
        ) : null}

        {step === "preferences" ? (
          <PreferenceScreen
            key="preferences"
            selectedFields={selectedFields}
            targetPreferences={targetPreferences}
            onSelect={choosePreference}
            onBack={() => setStep("fields")}
            onContinue={() => setStep("job-select")}
          />
        ) : null}

        {step === "job-select" ? (
          <TargetJobScreen
            key="job-select"
            selectedFields={selectedFields}
            targetPreferences={targetPreferences}
            selectedTargetJob={selectedTargetJob}
            onSelect={setSelectedTargetJob}
            onBack={() =>
              setStep(
                getRequiredPreferenceFields(selectedFields).length
                  ? "preferences"
                  : "fields"
              )
            }
            onContinue={continueFromTargetJob}
          />
        ) : null}

        {step === "builder" ? (
          <BuilderScreen
            key="builder"
            selectedFields={selectedFields}
            targetPreferences={targetPreferences}
            selectedTargetJob={selectedTargetJob}
            linkedinUrl={linkedinUrl}
            previousResume={previousResume}
            workHistory={workHistory}
            jobDescription={jobDescription}
            jobListings={jobListings}
            output={output}
            result={result}
            error={error}
            isGenerating={isGenerating}
            onBack={() =>
              setStep(
                user ? "job-select" : "auth"
              )
            }
            onGenerate={generateResume}
            setLinkedinUrl={setLinkedinUrl}
            setPreviousResume={setPreviousResume}
            setJobDescription={setJobDescription}
          />
        ) : null}
      </AnimatePresence>
    </main>
  )
}

function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(255,255,255,0.12),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(212,175,55,0.12),transparent_29%),linear-gradient(180deg,rgba(7,17,32,0.84),#071120_76%)]" />
    </div>
  )
}

function Nav({
  userEmail,
  onHome,
  onSignOut,
}: {
  userEmail: string
  onHome: () => void
  onSignOut: () => void
}) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 md:px-10">
      <button
        type="button"
        onClick={onHome}
        className="text-left text-xl font-black tracking-[0.24em]"
      >
        <span className="text-white">HY</span>
        <span className="text-[#d4af37]">FY</span>
      </button>
      <div className="hidden items-center gap-7 text-[0.7rem] font-semibold tracking-[0.16em] text-slate-400 uppercase md:flex">
        <span>Listings</span>
        <span>Resume Tailoring</span>
        <span>Profile Match</span>
        {userEmail ? (
          <button
            type="button"
            onClick={onSignOut}
            className="rounded-full border border-white/10 px-3 py-1.5 text-white transition hover:border-white/30"
          >
            Sign Out
          </button>
        ) : null}
      </div>
    </nav>
  )
}

function LandingScreen({ onFindJob }: { onFindJob: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.45 }}
      className="relative z-10 min-h-screen"
    >
      <HeroGeometric
        badge="HYFY"
        title1="Elevate Your"
        title2="Digital Vision"
        description="Crafting exceptional digital experiences through innovative design and cutting-edge technology."
        ctaLabel="Find Job"
        onCtaClick={onFindJob}
      />
    </motion.section>
  )
}

function AuthWall({
  user,
  supabaseReady,
  fullName,
  linkedinUrl,
  resumeFileName,
  workHistoryEntries,
  authEmail,
  authPassword,
  authMessage,
  isSignUp,
  isAuthLoading,
  isProfileSaving,
  onBack,
  onProviderSignIn,
  onEmailAuth,
  onToggleAuthMode,
  setAuthEmail,
  setAuthPassword,
  setFullName,
  setLinkedinUrl,
  setResumeFile,
  updateWorkHistory,
  addWorkHistory,
  removeWorkHistory,
  onContinue,
}: {
  user: User | null
  supabaseReady: boolean
  fullName: string
  linkedinUrl: string
  resumeFileName: string
  workHistoryEntries: WorkHistoryDraft[]
  authEmail: string
  authPassword: string
  authMessage: string
  isSignUp: boolean
  isAuthLoading: boolean
  isProfileSaving: boolean
  onBack: () => void
  onProviderSignIn: (provider: Provider) => void
  onEmailAuth: (event: React.FormEvent<HTMLFormElement>) => void
  onToggleAuthMode: () => void
  setAuthEmail: (value: string) => void
  setAuthPassword: (value: string) => void
  setFullName: (value: string) => void
  setLinkedinUrl: (value: string) => void
  setResumeFile: (value: File | null) => void
  updateWorkHistory: (
    index: number,
    key: keyof WorkHistoryDraft,
    value: string
  ) => void
  addWorkHistory: () => void
  removeWorkHistory: (index: number) => void
  onContinue: () => void
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.42 }}
      className="relative z-10 min-h-screen px-5 pt-28 pb-12 md:px-10"
    >
      <StepHeader
        eyebrow="Sign in wall"
        title="Create your HYFY profile"
        body="Sign in before searching jobs. HYFY uses your LinkedIn, resume, and structured work history to match listings and tailor applications."
        onBack={onBack}
      />

      <div className="mx-auto mt-10 grid max-w-7xl gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <section className="rounded-lg border border-white/10 bg-black/30 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-6">
          <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-black">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-[#d4af37] uppercase">
                Account
              </p>
              <h2 className="text-2xl font-black text-white">
                {user ? "Signed in" : "Sign in to continue"}
              </h2>
            </div>
          </div>

          {!supabaseReady ? (
            <div className="rounded-md border border-[#d4af37]/30 bg-[#d4af37]/10 p-4 text-sm leading-6 text-[#f3dc84]">
              Supabase is not configured yet. Add
              `NEXT_PUBLIC_SUPABASE_URL` and
              `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`, then
              restart the dev server.
            </div>
          ) : null}

          {user ? (
            <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center gap-3">
                <UserCircle className="h-8 w-8 text-white" />
                <div>
                  <p className="font-bold text-white">{user.email}</p>
                  <p className="text-sm text-slate-400">
                    Complete your profile to search listings.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!supabaseReady || isAuthLoading}
                  onClick={() => onProviderSignIn("google")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-[#071120] transition hover:bg-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  Google
                </button>
                <button
                  type="button"
                  disabled={!supabaseReady || isAuthLoading}
                  onClick={() => onProviderSignIn("github")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Code className="h-4 w-4" />
                  GitHub
                </button>
              </div>

              <form onSubmit={onEmailAuth} className="grid gap-3">
                <input
                  value={authEmail}
                  onChange={(event) => setAuthEmail(event.target.value)}
                  type="email"
                  placeholder="Email"
                  className="h-12 rounded-md border border-white/10 bg-black/35 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/45"
                />
                <input
                  value={authPassword}
                  onChange={(event) => setAuthPassword(event.target.value)}
                  type="password"
                  placeholder="Password"
                  className="h-12 rounded-md border border-white/10 bg-black/35 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/45"
                />
                <button
                  type="submit"
                  disabled={!supabaseReady || isAuthLoading}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-black text-[#071120] transition hover:bg-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isAuthLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {isSignUp ? "Create Account" : "Log In"}
                </button>
              </form>

              <button
                type="button"
                onClick={onToggleAuthMode}
                className="text-left text-sm font-semibold text-slate-400 transition hover:text-white"
              >
                {isSignUp
                  ? "Already have an account? Log in"
                  : "Need an account? Sign up"}
              </button>
            </div>
          )}

          {authMessage ? (
            <p className="mt-4 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
              {authMessage}
            </p>
          ) : null}
        </section>

        <section
          className={cn(
            "rounded-lg border border-white/10 bg-black/30 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-6",
            !user && "opacity-50"
          )}
        >
          <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-black">
              <Database className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black tracking-[0.16em] text-[#d4af37] uppercase">
                Candidate data
              </p>
              <h2 className="text-2xl font-black text-white">
                Profile, resume, work history
              </h2>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Full Name"
                value={fullName}
                onChange={setFullName}
                disabled={!user}
                placeholder="Jane Candidate"
              />
              <TextInput
                label="LinkedIn URL"
                value={linkedinUrl}
                onChange={setLinkedinUrl}
                disabled={!user}
                placeholder="https://linkedin.com/in/name"
              />
            </div>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                <Upload className="h-4 w-4 text-white" />
                Resume Upload
              </span>
              <input
                disabled={!user}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf"
                onChange={(event) =>
                  setResumeFile(event.target.files?.[0] || null)
                }
                className="rounded-md border border-white/10 bg-black/35 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-black file:text-[#071120] disabled:cursor-not-allowed"
              />
              {resumeFileName ? (
                <span className="text-xs text-slate-400">
                  Saved resume: {resumeFileName}
                </span>
              ) : null}
            </label>

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  Work History
                </p>
                <button
                  type="button"
                  disabled={!user}
                  onClick={addWorkHistory}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 px-3 text-xs font-black text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>

              {workHistoryEntries.map((entry, index) => (
                <WorkHistoryCard
                  key={index}
                  index={index}
                  entry={entry}
                  disabled={!user}
                  onChange={updateWorkHistory}
                  onRemove={() => removeWorkHistory(index)}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={!user || isProfileSaving}
              onClick={onContinue}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black tracking-[0.14em] text-[#071120] uppercase transition hover:bg-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProfileSaving ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Continue to Fields
            </button>
          </div>
        </section>
      </div>
    </motion.section>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="h-12 rounded-md border border-white/10 bg-black/35 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-white/45 disabled:cursor-not-allowed"
      />
    </label>
  )
}

function WorkHistoryCard({
  index,
  entry,
  disabled,
  onChange,
  onRemove,
}: {
  index: number
  entry: WorkHistoryDraft
  disabled?: boolean
  onChange: (index: number, key: keyof WorkHistoryDraft, value: string) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-black text-white">Experience {index + 1}</p>
        <button
          type="button"
          disabled={disabled}
          onClick={onRemove}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/10 text-slate-400 transition hover:text-white disabled:cursor-not-allowed"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <TextInput
          label="Company"
          value={entry.company}
          onChange={(value) => onChange(index, "company", value)}
          placeholder="Company"
          disabled={disabled}
        />
        <TextInput
          label="Role"
          value={entry.role_title}
          onChange={(value) => onChange(index, "role_title", value)}
          placeholder="Analyst Intern"
          disabled={disabled}
        />
        <TextInput
          label="Location"
          value={entry.location}
          onChange={(value) => onChange(index, "location", value)}
          placeholder="Toronto, ON"
          disabled={disabled}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Start"
            value={entry.start_date}
            onChange={(value) => onChange(index, "start_date", value)}
            placeholder="May 2025"
            disabled={disabled}
          />
          <TextInput
            label="End"
            value={entry.end_date}
            onChange={(value) => onChange(index, "end_date", value)}
            placeholder="Aug 2025"
            disabled={disabled}
          />
        </div>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field
          id={`description-${index}`}
          label="Description"
          icon={<FileText className="h-4 w-4 text-white" />}
          value={entry.description}
          onChange={(value) => onChange(index, "description", value)}
          placeholder="What did you do?"
          rows={4}
          disabled={disabled}
        />
        <Field
          id={`achievements-${index}`}
          label="Achievements"
          icon={<Sparkles className="h-4 w-4 text-white" />}
          value={entry.achievements}
          onChange={(value) => onChange(index, "achievements", value)}
          placeholder="Metrics, tools, wins, or scope."
          rows={4}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

function FieldPicker({
  selectedFields,
  onToggle,
  onBack,
  onContinue,
}: {
  selectedFields: string[]
  onToggle: (field: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.42 }}
      className="relative z-10 min-h-screen px-5 pt-28 pb-28 md:px-10"
    >
      <StepHeader
        eyebrow="Find a job"
        title="Pick the fields you are interested in"
        body="Choose one or more lanes. HYFY will use these interests to shape job matching, project emphasis, skill language, and tailored resume direction."
        onBack={onBack}
      />

      <div className="mx-auto mt-10 grid max-w-6xl gap-3 md:grid-cols-2 xl:grid-cols-3">
        {CAREER_FIELDS.map((field, index) => (
          <FieldCard
            key={field.name}
            field={field}
            active={selectedFields.includes(field.name)}
            delay={index * 0.035}
            onToggle={() => onToggle(field.name)}
          />
        ))}
      </div>

      <StickyActions
        backLabel="Profile"
        onBack={onBack}
        disabled={selectedFields.length === 0}
        note={
          selectedFields.length
            ? `${selectedFields.length} field${
                selectedFields.length === 1 ? "" : "s"
              } selected`
            : "Select at least one field"
        }
        onContinue={onContinue}
      />
    </motion.section>
  )
}

function FieldCard({
  field,
  active,
  delay,
  onToggle,
}: {
  field: CareerField
  active: boolean
  delay: number
  onToggle: () => void
}) {
  const Icon = field.icon

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      onClick={onToggle}
      className={cn(
        "group grid min-h-48 grid-cols-[3.75rem_1fr] gap-4 rounded-lg border p-5 text-left transition",
        active
          ? "border-white bg-white text-[#071120]"
          : "border-white/10 bg-white/[0.035] text-white hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]"
      )}
    >
      <span
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-md border transition",
          active
            ? "border-black/10 bg-black text-white"
            : "border-white/15 bg-white text-black group-hover:bg-[#d4af37]"
        )}
      >
        <Icon className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <span>
        <span
          className={cn(
            "mb-2 flex items-center justify-between gap-3 text-xs font-black tracking-[0.16em] uppercase",
            active ? "text-[#6f5a12]" : "text-[#d4af37]"
          )}
        >
          {field.label}
          {active ? <Check className="h-4 w-4" /> : null}
        </span>
        <span className="block text-2xl font-black">{field.name}</span>
        <span
          className={cn(
            "mt-3 block text-sm leading-6",
            active ? "text-slate-700" : "text-slate-400"
          )}
        >
          {field.description}
        </span>
        <span className="mt-4 flex flex-wrap gap-2">
          {field.subfields.map((subfield) => (
            <span
              key={subfield}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-bold",
                active
                  ? "border-black/10 bg-black/[0.04] text-slate-700"
                  : "border-[#244067] bg-[#08172a] text-slate-400"
              )}
            >
              {subfield}
            </span>
          ))}
        </span>
      </span>
    </motion.button>
  )
}

function PreferenceScreen({
  selectedFields,
  targetPreferences,
  onSelect,
  onBack,
  onContinue,
}: {
  selectedFields: string[]
  targetPreferences: TargetPreferences
  onSelect: (field: string, preference: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  const requiredFields = getRequiredPreferenceFields(selectedFields)
  const isComplete = requiredFields.every((field) => targetPreferences[field])

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.42 }}
      className="relative z-10 min-h-screen px-5 pt-28 pb-28 md:px-10"
    >
      <StepHeader
        eyebrow="Target preference"
        title="Narrow the recruiting lane"
        body="Answer the extra questions for the selected fields so HYFY can match listings and resume language more precisely."
        onBack={onBack}
      />

      <div className="mx-auto mt-10 grid max-w-5xl gap-4">
        {requiredFields.map((field) => (
          <PreferenceGroup
            key={field}
            field={field}
            options={FIELD_PREFERENCES[field]}
            value={targetPreferences[field] || ""}
            onSelect={(preference) => onSelect(field, preference)}
          />
        ))}
      </div>

      <StickyActions
        backLabel="Fields"
        onBack={onBack}
        disabled={!isComplete}
        note={isComplete ? "Preferences selected" : "Answer each question"}
        onContinue={onContinue}
      />
    </motion.section>
  )
}

function PreferenceGroup({
  field,
  options,
  value,
  onSelect,
}: {
  field: string
  options: string[]
  value: string
  onSelect: (preference: string) => void
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-black/30 p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[#d4af37] uppercase">
            {field}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
            Which track are you targeting?
          </h2>
        </div>
        {value ? (
          <span className="inline-flex h-8 items-center gap-2 rounded-full bg-white px-3 text-xs font-black text-[#071120]">
            <Check className="h-3.5 w-3.5" />
            Selected
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "grid gap-3",
          options.length === 2 ? "md:grid-cols-2" : "md:grid-cols-4"
        )}
      >
        {options.map((option, index) => {
          const active = value === option

          return (
            <motion.button
              key={option}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.28 }}
              onClick={() => onSelect(option)}
              className={cn(
                "min-h-28 rounded-lg border p-5 text-left transition",
                active
                  ? "border-white bg-white text-[#071120]"
                  : "border-white/10 bg-white/[0.035] text-white hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]"
              )}
            >
              <span
                className={cn(
                  "mb-4 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-black",
                  active
                    ? "border-black bg-black text-white"
                    : "border-white/15 bg-white text-black"
                )}
              >
                {index + 1}
              </span>
              <span className="block text-lg font-black leading-tight">
                {option}
              </span>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}

function TargetJobScreen({
  selectedFields,
  targetPreferences,
  selectedTargetJob,
  onSelect,
  onBack,
  onContinue,
}: {
  selectedFields: string[]
  targetPreferences: TargetPreferences
  selectedTargetJob: string
  onSelect: (job: string) => void
  onBack: () => void
  onContinue: () => void
}) {
  const jobs = selectedFields.flatMap((field) =>
    (TARGET_JOBS[field] || []).map((job) => ({ field, job }))
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.42 }}
      className="relative z-10 min-h-screen px-5 pt-28 pb-28 md:px-10"
    >
      <StepHeader
        eyebrow="Target role"
        title="Choose the specific job you want"
        body="Pick one role inside your niche before signing in. HYFY will use this to shape listings, resume keywords, and cover letter positioning."
        onBack={onBack}
      />

      <div className="mx-auto mt-10 grid max-w-6xl gap-3 md:grid-cols-2 xl:grid-cols-3">
        {jobs.map(({ field, job }, index) => {
          const active = selectedTargetJob === job

          return (
            <motion.button
              key={`${field}-${job}`}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.025, duration: 0.32 }}
              onClick={() => onSelect(job)}
              className={cn(
                "min-h-40 rounded-lg border p-5 text-left transition",
                active
                  ? "border-white bg-white text-[#071120]"
                  : "border-white/10 bg-white/[0.035] text-white hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]"
              )}
            >
              <span
                className={cn(
                  "mb-4 inline-flex h-9 items-center rounded-full border px-3 text-xs font-black tracking-[0.12em] uppercase",
                  active
                    ? "border-black/10 bg-black text-white"
                    : "border-white/15 bg-white text-black"
                )}
              >
                {field}
              </span>
              <span className="block text-2xl font-black leading-tight">
                {job}
              </span>
              {targetPreferences[field] ? (
                <span
                  className={cn(
                    "mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-bold",
                    active
                      ? "border-black/10 bg-black/[0.04] text-slate-700"
                      : "border-[#244067] bg-[#08172a] text-slate-400"
                  )}
                >
                  {targetPreferences[field]}
                </span>
              ) : null}
            </motion.button>
          )
        })}
      </div>

      <StickyActions
        backLabel="Back"
        onBack={onBack}
        disabled={!selectedTargetJob}
        note={selectedTargetJob || "Select a target job"}
        onContinue={onContinue}
      />
    </motion.section>
  )
}

function BuilderScreen({
  selectedFields,
  targetPreferences,
  selectedTargetJob,
  linkedinUrl,
  previousResume,
  workHistory,
  jobDescription,
  jobListings,
  output,
  result,
  error,
  isGenerating,
  onBack,
  onGenerate,
  setLinkedinUrl,
  setPreviousResume,
  setJobDescription,
}: {
  selectedFields: string[]
  targetPreferences: TargetPreferences
  selectedTargetJob: string
  linkedinUrl: string
  previousResume: string
  workHistory: string
  jobDescription: string
  jobListings: JobListing[]
  output: string
  result: { latex: string; coverLetter: string }
  error: string
  isGenerating: boolean
  onBack: () => void
  onGenerate: (event: React.FormEvent<HTMLFormElement>) => void
  setLinkedinUrl: (value: string) => void
  setPreviousResume: (value: string) => void
  setJobDescription: (value: string) => void
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.42 }}
      className="relative z-10 min-h-screen px-5 pt-28 pb-12 md:px-10"
    >
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <form
          onSubmit={onGenerate}
          className="rounded-lg border border-white/10 bg-black/30 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6"
        >
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-2 text-xs font-black tracking-[0.14em] text-slate-400 uppercase transition hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          <TargetSummary
            selectedFields={selectedFields}
            targetPreferences={targetPreferences}
            selectedTargetJob={selectedTargetJob}
          />

          <JobListingsPanel
            jobListings={jobListings}
            onUseListing={(listing) => {
              setJobDescription(
                [
                  `${listing.title} at ${listing.company}`,
                  listing.location ? `Location: ${listing.location}` : "",
                  listing.employment_type
                    ? `Type: ${listing.employment_type}`
                    : "",
                  "",
                  listing.description,
                  listing.requirements
                    ? `\nRequirements:\n${listing.requirements}`
                    : "",
                ]
                  .filter(Boolean)
                  .join("\n")
              )
            }}
          />

          <div className="grid gap-4">
            <label htmlFor="linkedin" className="grid gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
                <Link className="h-4 w-4 text-white" />
                LinkedIn URL
              </span>
              <input
                id="linkedin"
                value={linkedinUrl}
                onChange={(event) => setLinkedinUrl(event.target.value)}
                placeholder="https://linkedin.com/in/name"
                className="h-12 rounded-md border border-white/10 bg-black/35 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-white/45 focus:bg-black/50"
              />
            </label>

            <Field
              id="previousResume"
              label="Previous Resume Text"
              icon={<FileText className="h-4 w-4 text-white" />}
              value={previousResume}
              onChange={setPreviousResume}
              placeholder="Paste resume text if you want to supplement the uploaded file."
              rows={6}
            />

            <Field
              id="workHistory"
              label="Saved Work History"
              icon={<Building2 className="h-4 w-4 text-white" />}
              value={workHistory}
              onChange={() => undefined}
              placeholder="Saved structured work history appears here."
              rows={6}
              disabled
            />

            <Field
              id="jobDescription"
              label="Job Description"
              icon={<Sparkles className="h-4 w-4 text-white" />}
              value={jobDescription}
              onChange={setJobDescription}
              placeholder="Paste a job listing or click Use Listing from a HYFY match."
              rows={8}
              required
            />

            {error ? (
              <div className="rounded-md border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-black tracking-[0.14em] text-[#071120] uppercase transition hover:bg-[#d4af37] disabled:cursor-wait disabled:opacity-60"
            >
              {isGenerating ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? "Generating" : "Create Tailored Resume"}
            </button>
          </div>
        </form>

        <div className="grid gap-4">
          <ResultPanel
            title="LaTeX Resume"
            copyLabel="Copy LaTeX"
            value={result.latex}
            fallback="Generated LaTeX will appear here after the API returns."
            code
          />
          <ResultPanel
            title="Cover Letter"
            copyLabel="Copy Letter"
            value={result.coverLetter}
            fallback="The three cover letter paragraphs will appear here."
          />
          {output && !result.coverLetter ? (
            <p className="text-xs text-slate-500">
              Output did not include the expected COVER_LETTER marker, so the
              full response is shown in the LaTeX panel.
            </p>
          ) : null}
        </div>
      </div>
    </motion.section>
  )
}

function TargetSummary({
  selectedFields,
  targetPreferences,
  selectedTargetJob,
}: {
  selectedFields: string[]
  targetPreferences: TargetPreferences
  selectedTargetJob: string
}) {
  return (
    <div className="mb-5 rounded-md border border-[#244067] bg-[#08172a] px-4 py-3">
      <p className="text-xs font-black tracking-[0.16em] text-[#d4af37] uppercase">
        HYFY target fields
      </p>
      <p className="mt-2 text-xl font-black text-white">{selectedTargetJob}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {selectedFields.map((field) => (
          <span
            key={field}
            className="rounded-full border border-white/10 bg-white px-3 py-1.5 text-xs font-black text-[#071120]"
          >
            {field}
          </span>
        ))}
      </div>
      {Object.keys(targetPreferences).length ? (
        <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
          {Object.entries(targetPreferences).map(([field, preference]) => (
            <p key={field} className="text-sm text-slate-300">
              <span className="font-bold text-white">{field}:</span>{" "}
              {preference}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function JobListingsPanel({
  jobListings,
  onUseListing,
}: {
  jobListings: JobListing[]
  onUseListing: (listing: JobListing) => void
}) {
  return (
    <section className="mb-5 rounded-md border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.16em] text-[#d4af37] uppercase">
            Matched listings
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Loaded from Supabase by selected category.
          </p>
        </div>
        <Database className="h-5 w-5 text-slate-400" />
      </div>
      <div className="grid max-h-72 gap-3 overflow-auto pr-1">
        {jobListings.length ? (
          jobListings.map((listing) => (
            <article
              key={listing.id}
              className="rounded-md border border-white/10 bg-black/30 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-white">{listing.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {listing.company}
                    {listing.location ? `, ${listing.location}` : ""}
                  </p>
                </div>
                {listing.source_url ? (
                  <a
                    href={listing.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 transition hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </div>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                {listing.description}
              </p>
              <button
                type="button"
                onClick={() => onUseListing(listing)}
                className="mt-3 inline-flex h-9 items-center rounded-md bg-white px-3 text-xs font-black text-[#071120] transition hover:bg-[#d4af37]"
              >
                Use Listing
              </button>
            </article>
          ))
        ) : (
          <p className="rounded-md border border-white/10 bg-black/30 p-4 text-sm leading-6 text-slate-400">
            No listings found yet. Add rows to `job_listings` in Supabase for
            the selected categories.
          </p>
        )}
      </div>
    </section>
  )
}

function Field({
  id,
  label,
  icon,
  value,
  onChange,
  placeholder,
  rows = 5,
  required = false,
  disabled = false,
}: {
  id: string
  label: string
  icon: React.ReactNode
  value: string
  onChange: (value: string) => void
  placeholder: string
  rows?: number
  required?: boolean
  disabled?: boolean
}) {
  return (
    <label htmlFor={id} className="grid gap-2">
      <span className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
        {icon}
        {label}
        {required ? <span className="text-[#d4af37]">*</span> : null}
      </span>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className="min-h-28 resize-y rounded-md border border-white/10 bg-black/35 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-white/45 focus:bg-black/50 disabled:cursor-not-allowed disabled:text-slate-500"
      />
    </label>
  )
}

function ResultPanel({
  title,
  copyLabel,
  value,
  fallback,
  code = false,
}: {
  title: string
  copyLabel: string
  value: string
  fallback: string
  code?: boolean
}) {
  return (
    <article className="rounded-lg border border-white/10 bg-black/30">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
        <h2 className="text-sm font-black tracking-[0.18em] text-slate-300 uppercase">
          {title}
        </h2>
        <CopyButton value={value} label={copyLabel} />
      </div>
      <div
        className={cn(
          "min-h-72 overflow-auto p-4 text-sm leading-6 whitespace-pre-wrap text-slate-300",
          code && "font-mono text-xs"
        )}
      >
        {value || fallback}
      </div>
    </article>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!value}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 text-sm font-medium text-white transition hover:border-white/35 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Clipboard className="h-4 w-4" />
      {copied ? "Copied" : label}
    </button>
  )
}

function StepHeader({
  eyebrow,
  title,
  body,
  onBack,
}: {
  eyebrow: string
  title: string
  body: string
  onBack: () => void
}) {
  return (
    <div className="mx-auto max-w-4xl text-center">
      <button
        type="button"
        onClick={onBack}
        className="mb-7 inline-flex items-center gap-2 text-xs font-black tracking-[0.14em] text-slate-400 uppercase transition hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>
      <p className="text-sm font-black tracking-[0.18em] text-[#d4af37] uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-4xl leading-tight font-black tracking-tight text-balance md:text-6xl">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
        {body}
      </p>
    </div>
  )
}

function StickyActions({
  backLabel,
  note,
  disabled,
  onBack,
  onContinue,
}: {
  backLabel: string
  note: string
  disabled: boolean
  onBack: () => void
  onContinue: () => void
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 bg-gradient-to-t from-[#071120] via-[#071120]/95 to-transparent px-5 pt-14 pb-6">
      <div className="pointer-events-auto mx-auto flex max-w-xl items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2.5 text-xs font-black tracking-[0.12em] text-slate-400 uppercase transition hover:border-white/25 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </button>
        <p className="text-center text-sm text-slate-400">{note}</p>
        <button
          type="button"
          onClick={onContinue}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-black tracking-[0.12em] uppercase transition",
            disabled
              ? "cursor-not-allowed bg-slate-800 text-slate-500"
              : "bg-white text-[#071120] hover:-translate-y-0.5 hover:bg-[#d4af37]"
          )}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
