export type JobCategory = {
  id: string
  name: string
  slug: string
  description: string | null
}

export type JobListing = {
  id: string
  category_id: string
  title: string
  company: string
  location: string | null
  employment_type: string | null
  seniority: string | null
  source_url: string | null
  description: string
  requirements: string | null
  compensation: string | null
  is_active: boolean
  posted_at: string | null
  created_at: string
  updated_at: string
}

export type WorkHistoryDraft = {
  company: string
  role_title: string
  location: string
  start_date: string
  end_date: string
  description: string
  achievements: string
}

export type TargetPreferences = Record<string, string>
