import { NextRequest, NextResponse } from 'next/server'
import wmoMap from '@/lib/config/weather-wmo-map.json'

// ... (imports)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get('city') || searchParams.get('q')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')
  const apiKey = process.env.WEATHER_API_KEY

  const mapWMO = (code: number | undefined) => {
    if (code === undefined || code === null) return { desc: 'unknown', icon: 'cloud' }
    const entry = (wmoMap as any).map.find((m: any) => Array.isArray(m.codes) && m.codes.includes(code))
    if (entry) return { desc: entry.desc, icon: entry.icon }
    const fallback = (wmoMap as any).map.find((m: any) => Array.isArray(m.codes) && m.codes.includes(999))
    return fallback ? { desc: fallback.desc, icon: fallback.icon } : { desc: 'cloudy', icon: 'cloud' }
  }

  const geocodeCity = async (name: string) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=en&format=json`
    const resp = await fetch(url, { next: { revalidate: 86400 } })
    const data = await resp.json()
    const first = data?.results?.[0]
    if (!first) throw new Error('City not found')
    // OpenMeteo geocoding returns 'country_code' (e.g., 'US')
    return {
      latitude: first.latitude,
      longitude: first.longitude,
      resolvedName: first.name,
      country: first.country_code || ''
    }
  }

  const useOpenMeteo = async () => {
    try {
      let latitude = lat ? Number(lat) : undefined
      let longitude = lon ? Number(lon) : undefined
      let resolvedName = ''
      let resolvedCountry = ''

      if (city && (!latitude || !longitude)) {
        const g = await geocodeCity(city)
        latitude = g.latitude
        longitude = g.longitude
        resolvedName = g.resolvedName
        resolvedCountry = g.country
      }

      if (!latitude || !longitude) {
        return NextResponse.json({ error: 'City or coordinates are required' }, { status: 400 })
      }

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relativehumidity_2m,windspeed_10m,weathercode&timezone=auto`
      const resp = await fetch(url, { next: { revalidate: 1800 } })
      const data = await resp.json()

      const m = mapWMO(data?.current?.weathercode)
      const tz = data?.timezone || 'Etc/UTC'
      const name = resolvedName || (String(tz).includes('/') ? String(tz).split('/')[1] : tz)

      return NextResponse.json({
        temp: data?.current?.temperature_2m,
        description: m.desc,
        humidity: data?.current?.relativehumidity_2m ?? 0,
        windSpeed: data?.current?.windspeed_10m,
        icon: m.icon,
        city: name,
        country: resolvedCountry
      })
    } catch (e: any) {
      console.error('OpenMeteo Error:', e)
      return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 })
    }
  }

  if (!apiKey) {
    return useOpenMeteo()
  }

  // --- OpenWeatherMap ---
  let owUrl = 'https://api.openweathermap.org/data/2.5/weather?'
  if (city) {
    owUrl += `q=${encodeURIComponent(city)}`
  } else if (lat && lon) {
    owUrl += `lat=${lat}&lon=${lon}`
  } else {
    // If no params, default to simplified IP-based logic or error?
    // For now error, but usually a "smart" fallback is good.
    return NextResponse.json({ error: 'City or coordinates are required' }, { status: 400 })
  }
  owUrl += `&units=metric&appid=${apiKey}`

  try {
    const response = await fetch(owUrl, { next: { revalidate: 1800 } })
    const data = await response.json()

    if (Number(data.cod) !== 200) {
      // Fallback to OpenMeteo if OWM fails (e.g. limit reached, key invalid)
      return useOpenMeteo()
    }

    const main = String(data.weather?.[0]?.main || '').toLowerCase()
    // Map OWM "main" to our internal simplified icon set
    const icon = (
      main.includes('clear') ? 'sun' :
        main.includes('cloud') ? 'cloud' :
          main.includes('rain') || main.includes('drizzle') ? 'rain' :
            main.includes('snow') ? 'snow' :
              main.includes('thunder') ? 'storm' :
                main.includes('mist') || main.includes('fog') || main.includes('haze') || main.includes('smoke') ? 'fog' :
                  'cloud'
    )

    return NextResponse.json({
      temp: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon,
      city: data.name,
      country: data.sys?.country || ''
    })
  } catch (error: any) {
    console.error('OWM Error:', error)
    return useOpenMeteo()
  }
}
