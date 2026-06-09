import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

const META_TOKEN = process.env.META_ACCESS_TOKEN
const IG_ID = '17841400315502599'

async function igInsights(metrics: string[], period: string, since: string, until: string) {
  if (!META_TOKEN) return null
  const url = `https://graph.facebook.com/v22.0/${IG_ID}/insights?metric=${metrics.join(',')}&period=${period}&since=${since}&until=${until}&access_token=${META_TOKEN}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) return null
  const json = await res.json()
  return json.data || []
}

async function igProfile() {
  if (!META_TOKEN) return null
  const url = `https://graph.facebook.com/v22.0/${IG_ID}?fields=followers_count,follows_count,media_count,biography,website,name,username,profile_picture_url&access_token=${META_TOKEN}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) return null
  return res.json()
}

function sumValues(data: any[], name: string): number {
  const item = data?.find((d: any) => d.name === name)
  if (!item) return 0
  return item.values?.reduce((acc: number, v: any) => acc + (v.value || 0), 0) || 0
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  if (!META_TOKEN) {
    return NextResponse.json({ error: 'META_ACCESS_TOKEN não configurado', needs_token: true })
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

  // Convert to unix timestamps
  const sinceTs = Math.floor(new Date(since).getTime() / 1000)
  const untilTs = Math.floor(new Date(until + 'T23:59:59').getTime() / 1000)

  const [currentData, profileData] = await Promise.all([
    igInsights(
      ['impressions', 'reach', 'profile_views', 'website_clicks', 'follower_count'],
      'day',
      String(sinceTs),
      String(untilTs)
    ),
    igProfile(),
  ])

  const impressions = sumValues(currentData, 'impressions')
  const reach = sumValues(currentData, 'reach')
  const profileViews = sumValues(currentData, 'profile_views')
  const websiteClicks = sumValues(currentData, 'website_clicks')

  return NextResponse.json({
    period: { since, until },
    impressions,
    reach,
    profileViews,
    websiteClicks,
    followers: profileData?.followers_count || 0,
    mediaCount: profileData?.media_count || 0,
    username: profileData?.username || 'realequipamentos',
    profilePicture: profileData?.profile_picture_url || null,
  })
}
