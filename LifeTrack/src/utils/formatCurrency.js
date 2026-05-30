const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatINR(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return inrFormatter.format(num);
}

export default formatINR;
