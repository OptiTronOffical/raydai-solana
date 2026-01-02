import { type NextRequest, NextResponse } from "next/server" 

const CIS_COUNTRIES = ["RU", "BY", "KZ", "KG", "TJ", "TM", "UZ", "AM", "AZ", "MD"] 

export async function GET(request: NextRequest) { 
  try { 
    const forwarded = request.headers.get("x-forwarded-for") 
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown" 

    if (ip === "unknown") { 
      return NextResponse.json({ blocked: false, ip: ip }) 
    } 

    const geoResponse = await fetch(`http://ip-api.com/json/${ip}`) 
    const geoData = await geoResponse.json() 

    const countryCode = geoData.countryCode 
    const blocked = CIS_COUNTRIES.includes(countryCode) 

    return NextResponse.json({ 
      blocked: blocked, 
      ip: ip, 
      country: geoData.country, 
      countryCode: countryCode, 
    }) 
  } catch (error) { 
    return NextResponse.json({ blocked: false }) 
  } 
} 

