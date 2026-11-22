import { formatPrice, meetingConfig } from "@/lib/meeting-config";

type MeetingPriceProps = {
  variant?: "card" | "summary" | "inline" | "compact";
  unit?: string;
};

export function MeetingPrice({ variant = "card", unit }: MeetingPriceProps) {
  const hasDiscount = meetingConfig.referencePriceRub > meetingConfig.priceRub;
  const discountPercent = Math.floor((1 - meetingConfig.priceRub / meetingConfig.referencePriceRub) * 100);
  const priceDescription = hasDiscount
    ? `Базовая стоимость ${formatPrice(meetingConfig.referencePriceRub)}. Специальная цена ${formatPrice()}. Скидка ${discountPercent}%.`
    : `Стоимость ${formatPrice()}.`;

  return <span className={`meeting-price meeting-price--${variant}`}>
    <span className="visually-hidden">{priceDescription}{unit ? ` ${unit}.` : ""}</span>
    {hasDiscount && <span className="meeting-price__reference" aria-hidden="true">
      <s>{formatPrice(meetingConfig.referencePriceRub)}</s>
      <span className="meeting-price__discount">−{discountPercent}%</span>
    </span>}
    <span className="meeting-price__current" aria-hidden="true">
      <strong>{formatPrice()}</strong>
      {unit && <span className="meeting-price__unit">{unit}</span>}
    </span>
  </span>;
}
