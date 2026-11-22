/** Public presentation settings. Existing paid bookings keep their original price. */
export const meetingConfig = {
  priceRub: 10000,
  durationLabel: '25–30 минут',
  durationMinutes: 30,
  timeZone: 'Europe/Moscow',
  supportEmail: 'oncoexperts@protonmail.com',
  legalVersion: '2026-11-23',
} as const;

export function formatPrice(price: number = meetingConfig.priceRub) {
  return new Intl.NumberFormat('ru-RU', {style:'currency',currency:'RUB',maximumFractionDigits:0}).format(price);
}
