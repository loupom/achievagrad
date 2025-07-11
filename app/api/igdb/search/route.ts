// app/api/igdb/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

let token: string | null = null
let tokenExpiration = 0

async function getAccessToken() {
  const client_id = process.env.TWITCH_CLIENT_ID!
  const client_secret = process.env.TWITCH_CLIENT_SECRET!

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,
    {
      method: 'POST',
    }
  )

  const data = await res.json()
  token = data.access_token
  tokenExpiration = Date.now() + data.expires_in * 1000
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const query = body.query

    console.log('🕵️ Requête reçue :', query)

  if (!token || Date.now() > tokenExpiration) {
    await getAccessToken()
  }

  const response = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: {
      'Client-ID': process.env.TWITCH_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body: `
      search "${query}";
      fields name,cover.image_id,first_release_date,genres.name;
      limit 10;
    `,
  })

  const data = await response.json()
  return NextResponse.json(data)
}
