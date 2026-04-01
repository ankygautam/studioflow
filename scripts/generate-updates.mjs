import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const outputPath = path.resolve(process.cwd(), 'src/lib/generated/updates.ts')

const fallbackUpdates = []

const categoryMatchers = [
  { category: 'UI polish', keywords: ['ui', 'shell', 'layout', 'banner', 'favicon', 'page', 'dropdown'] },
  { category: 'Booking flow', keywords: ['booking', 'calendar', 'appointment', 'client', 'payment'] },
  { category: 'Navigation', keywords: ['route', 'guide', 'guidance', 'explore', 'link'] },
  { category: 'Reliability', keywords: ['fix', 'regression', 'context', 'revenue', 'metric'] },
]

function getCategory(subject) {
  const normalized = subject.toLowerCase()
  return (
    categoryMatchers.find(({ keywords }) => keywords.some((keyword) => normalized.includes(keyword)))?.category ??
    'Product update'
  )
}

function getSummary(subject) {
  const normalized = subject.toLowerCase()

  if (normalized.includes('fix')) {
    return 'Improved product behavior and removed friction in an existing workflow.'
  }

  if (normalized.includes('calendar')) {
    return 'Expanded the scheduling experience so date-based workflows are clearer and more useful.'
  }

  if (normalized.includes('booking')) {
    return 'Smoothed the booking flow to reduce extra steps during day-to-day studio operations.'
  }

  if (normalized.includes('client')) {
    return 'Made it easier to move through client-related tasks without leaving the current workflow.'
  }

  if (normalized.includes('shell') || normalized.includes('dashboard') || normalized.includes('ui')) {
    return 'Refined the product shell and dashboard presentation to feel cleaner and more product-ready.'
  }

  if (normalized.includes('link') || normalized.includes('guide') || normalized.includes('page')) {
    return 'Improved navigation and public-facing guidance so the project is easier to explore.'
  }

  return 'Added another round of product polish and workflow improvements.'
}

function loadRecentCommits() {
  try {
    const raw = execSync("git log -n 18 --date=short --pretty=format:'%H%x09%h%x09%ad%x09%s'", {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()

    if (!raw) {
      return fallbackUpdates
    }

    return raw.split('\n').map((line) => {
      const [hash, shortHash, date, subject] = line.split('\t')
      return {
        category: getCategory(subject),
        date,
        hash,
        shortHash,
        subject,
        summary: getSummary(subject),
      }
    })
  } catch {
    return fallbackUpdates
  }
}

const updates = loadRecentCommits()
const generatedAt = new Date().toISOString()

const fileContents = `export type ProjectUpdate = {
  category: string
  date: string
  hash: string
  shortHash: string
  subject: string
  summary: string
}

export const generatedAt = ${JSON.stringify(generatedAt)}

export const projectUpdates: ProjectUpdate[] = ${JSON.stringify(updates, null, 2)} as ProjectUpdate[]
`

mkdirSync(path.dirname(outputPath), { recursive: true })
writeFileSync(outputPath, fileContents)
