let cachedRate: number | null = null;
let lastFetch: number = 0;
const ONE_HOUR = 60 * 60 * 1000;

export async function getUSDToINRRate(): Promise<number> {
  const now = Date.now();
  if (cachedRate && (now - lastFetch < ONE_HOUR)) {
    return cachedRate;
  }

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=INR');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    cachedRate = data.rates.INR;
    lastFetch = now;
    return cachedRate as number;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return cachedRate || 83.5; // Fallback
  }
}
