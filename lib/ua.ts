export function parseUserAgent(ua: string | null): {
  browser: string | null;
  operatingSystem: string | null;
  deviceType: string | null;
} {
  if (!ua) return { browser: null, operatingSystem: null, deviceType: null };

  let browser: string | null = null;
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/")) browser = "Safari";

  let operatingSystem: string | null = null;
  if (ua.includes("Windows NT")) operatingSystem = "Windows";
  else if (ua.includes("Android")) operatingSystem = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) operatingSystem = "iOS";
  else if (ua.includes("Mac OS X")) operatingSystem = "macOS";
  else if (ua.includes("Linux")) operatingSystem = "Linux";

  let deviceType: string | null = null;
  if (ua.includes("iPad") || (ua.includes("Android") && !ua.includes("Mobile"))) {
    deviceType = "Tablet";
  } else if (ua.includes("iPhone") || ua.includes("Windows Phone") || (ua.includes("Android") && ua.includes("Mobile"))) {
    deviceType = "Mobile";
  } else if (browser || operatingSystem) {
    deviceType = "Desktop";
  }

  return { browser, operatingSystem, deviceType };
}
