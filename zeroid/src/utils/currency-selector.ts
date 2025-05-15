import { CurrencyOption } from "../interfaces";

export const currencyOptions: CurrencyOption[] = [
  { value: "CNY", label: "¥ (CNY / RMB)", symbol: "¥" },
  { value: "USD", label: "$ (USD)", symbol: "$" },
  { value: "EUR", label: "€ (EUR)", symbol: "€" },
  { value: "GBP", label: "£ (GBP)", symbol: "£" },
  { value: "JPY", label: "¥ (JPY)", symbol: "¥" },
  { value: "AUD", label: "$ (AUD)", symbol: "$" },
  { value: "CAD", label: "$ (CAD)", symbol: "$" },
  { value: "CHF", label: "Fr (CHF)", symbol: "Fr" },
  { value: "BTC", label: "₿ (BTC)", symbol: "₿" },
  { value: "ETH", label: "Ξ (ETH)", symbol: "Ξ" },
];

export const getCurrencySymbol = (currencyCode: string) => {
  const currency = currencyOptions.find(
    (option) => option.value === currencyCode
  );
  return currency ? currency.symbol : currencyCode; // Fallback to the code if no symbol is found
};
