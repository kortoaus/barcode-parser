export type BarcodeType = "none" | "ean13" | "ean13PE" | "gtin" | "239" | "ect";

export interface ScannedResult {
  type: BarcodeType;
  itemCode: string;
  barcode: string;
  weight: number;
  date: Date | null;
  dateNumber: number | null;
  serial: string | null;
  totalPrice: number | null;
}

export function genEan13CheckDigits(input: string): string | null;

export function validateEan13(input: string): boolean;

export default function scanFunc(barcode: string, tz?: string): ScannedResult;
