# @kortoaus/barcode-parser

A lightweight TypeScript library for parsing and validating barcode data.

---

## 🚀 Installation

```sh
npm install @kortoaus/barcode-parser
```

## 📦 Usage

```typescript
import scanFunc, {
  validateEan13,
  genEan13CheckDigits,
} from "@kortoaus/barcode-parser";

const barcode = "9321234567890";

// Scan barcode with default timezone (Australia/Sydney)
const result = scanFunc(barcode);
console.log(result);

// Scan barcode with custom timezone
const resultWithTZ = scanFunc(barcode, "Asia/Seoul");
console.log(resultWithTZ);

// Validate EAN13 barcode
const isValid = validateEan13(barcode);
console.log(isValid); // true or false

// Generate EAN13 check digit from 12-digit input
const checkDigit = genEan13CheckDigits("932123456789");
console.log(checkDigit); // "0"
```

## 📝 API

### `scanFunc(barcode: string, tz?: string)`

Parses barcode information with optional timezone parameter (default: `Australia/Sydney`).

Returns an object:

```typescript
{
  type: BarcodeType;
  itemCode: string;
  barcode: string;
  weight: number;
  date: Date | null;
  dateNumber: number | null;
  serial: string | null;
  totalPrice: number | null;
}
```

### `validateEan13(input: string): boolean`

Validates the provided EAN13 barcode.

### `genEan13CheckDigits(input: string): string | null`

Generates the EAN13 check digit from a 12-digit numeric string.

---

## ⚙️ Supported Barcode Types

- `ean13`
- `ean13PE` (EAN13 with Price Embedded)
- `gtin`
- `239`
- `ect`
- `none` (unrecognized barcode)

---

## 🧑‍💻 Author

[kortoaus](https://github.com/kortoaus)

---

## 📄 License

[MIT](LICENSE)
