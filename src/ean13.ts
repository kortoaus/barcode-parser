export function genEan13CheckDigits(input: string): string | null {
  if (input.length !== 12 || !/^\d{12}$/.test(input)) {
    return null;
  }

  const digits = input.split("").map(Number);
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }

  const remainder = sum % 10;
  const checkDigit = remainder === 0 ? 0 : 10 - remainder;

  return checkDigit.toString();
}

export function validateEan13(input: string): boolean {
  if (input.length !== 13 || !/^\d{13}$/.test(input)) {
    return false;
  }

  const providedCheckDigit = Number(input[12]);
  const calculated = genEan13CheckDigits(input.slice(0, 12));

  return calculated !== null && Number(calculated) === providedCheckDigit;
}
