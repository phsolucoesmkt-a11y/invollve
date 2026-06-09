import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const META_TOKEN = process.env.META_ACCESS_TOKEN
const IG_ID = '17841400315502599'

async function igInsights(since: string, until: string) {
  if (!META_TOKEN) return { error: 'no_token' }
  const sinceTs = Math.floor(new Date(since).getTime() / 1000)
  const untilTs = Math.floor(new Date(until + 'T23:59:59').getTime() / 1000)
  const metrics = 'views,reach,profile_views,website_clicks,total_interactions'
  const url = `https://graph.facebook.com/v22.0/${IG_ID}/insights?metric=${metrics}&metric_type=total_value&period=day&since=${sinceTs}&until=${untilTs}&access_token=${META_TOKEN}`
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) return { error: json }
  return json.data || []
}

async function igProfile() {
  if (!META_TOKEN) return null
  const url = `https://graph.facebook.com/v22.0/${IG_ID}?fields=followers_count,media_count,username,profile_picture_url&access_token=${META_TOKEN}`
  const res = await fetch(url, { cache: 'no-store' })
  const json = await res.json()
  if (!res.ok) return { error: json }
  return json
}

function getValue(data: any[], name: string): number {
  const item = data?.find((d: any) => d.name === name)
  return item?.total_value?.value || 0
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!META_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN não configurado', needs_token: true, debug: 'token_missing' })
  }

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')

  let since: string, until: string
  if (month) {
    const [y, m] = month.split('-')
    const lastDay = new Date(Number(y), Number(m), 0).getDate()
    since = `${month}-01`
    until = `${month}-${String(lastDay).padStart(2, '0')}`
  } else {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate()
    since = `${y}-${m}-01`
    until = `${y}-${m}-${lastDay}`
  }

  const [insightsData, profileData] = await Promise.all([
    igInsights(since, until),
    igProfile(),
  ])

  const views = getValue(insightsData, 'views')
  const reach = getValue(insightsData, 'reach')
  const profileViews = getValue(insightsData, 'profile_views')
  const websiteClicks = getValue(insightsData, 'website_clicks')
  const totalInteractions = getValue(insightsData, 'total_interactions')

  return NextResponse.json({
    period: { since, until },
    views,
    reach,
    profileViews,
    websiteClicks,
    totalInteractions,
    followers: profileData?.followers_count || 0,
    mediaCount: profileData?.media_count || 0,
    username: profileData?.username || 'realequipamentos',
    _debug: { insightsError: Array.isArray(insightsData) ? null : insightsData, profileError: profileData?.error || null },
  })
}
