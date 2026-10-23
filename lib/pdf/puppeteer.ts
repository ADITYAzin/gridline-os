import puppeteer, { Browser } from 'puppeteer-core'

export async function getBrowser(): Promise<Browser> {
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

  if (isServerless) {
    const chromium = (await import('@sparticuz/chromium')).default
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  // Local or VPS environment with system-installed Chrome/Chromium
  const chromePath =
    process.env.CHROME_BIN ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    '/usr/bin/google-chrome' ||
    '/usr/bin/chromium-browser' ||
    '/usr/bin/chromium'

  return puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  })
}
