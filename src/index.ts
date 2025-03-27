import Decimal from "decimal.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { validateEan13 } from "./ean13";
import type { BarcodeType, ScannedResult } from "./index.d";

dayjs.extend(utc);
dayjs.extend(timezone);

// 상수로 바코드 위치 관리
const POS = {
  EAN13_PE: { ITEM: [1, 6], PRICE: [6, 11] },
  GTIN: {
    ITEM: [2, 16],
    SERIAL: 36,
    DATE_NORMAL: [28, 34],
    DATE_REVERSED: [18, 24],
    WEIGHT_NORMAL: [20, 26],
    WEIGHT_REVERSED: [28, 34],
    WEIGHT_FACTOR_NORMAL: 19,
    WEIGHT_FACTOR_REVERSED: 27,
  },
  TYPE_239: { ITEM: [0, 6], WEIGHT: [6, 10], DATE: [10, 16], SERIAL: 16 },
  TYPE_ECT: { ITEM: [0, 8], DATE: [8, 14], WEIGHT: [14, 20], SERIAL: 20 },
};

// 날짜 포맷 변환 함수
const dateChunk = (input: string): string | null => {
  const chunks = input.match(/.{1,2}/g);
  return input.length === 6 && chunks?.length === 3 ? chunks.join("-") : null;
};

// 가격 내장형 EAN13 체크
const isPriceEmbeddedEan13 = (input: string): boolean =>
  input.startsWith("2") && validateEan13(input);

// 바코드 유형 체크
const checkBarcodeType = (barcode: string): BarcodeType => {
  if (barcode.length === 13 && /^\d+$/.test(barcode)) {
    return isPriceEmbeddedEan13(barcode) ? "ean13PE" : "ean13";
  }
  if (barcode.length === 22 && /^\d+$/.test(barcode)) return "239";
  if (barcode.length > 22 && /^\d+$/.test(barcode)) {
    const prefix = barcode.slice(0, 2);
    const aiCode = barcode.slice(16, 18);
    if (
      (prefix === "01" || prefix === "04") &&
      (aiCode === "31" || aiCode === "13")
    )
      return "gtin";
    return "ect";
  }
  return "none";
};

// 개별 바코드 유형 파서 함수 분리
const parseBarcode = (
  barcode: string,
  type: BarcodeType,
  tz: string
): Partial<ScannedResult> => {
  switch (type) {
    case "ean13":
      return {};

    case "ean13PE":
      return {
        itemCode: barcode.slice(...POS.EAN13_PE.ITEM),
        totalPrice: Number(barcode.slice(...POS.EAN13_PE.PRICE)),
      };

    case "gtin": {
      const reversed = barcode.slice(16, 18) === "13";
      const weightFactor = Number(
        barcode[
          reversed
            ? POS.GTIN.WEIGHT_FACTOR_REVERSED
            : POS.GTIN.WEIGHT_FACTOR_NORMAL
        ]
      );
      const weightPos = reversed
        ? POS.GTIN.WEIGHT_REVERSED
        : POS.GTIN.WEIGHT_NORMAL;
      const datePos = reversed ? POS.GTIN.DATE_REVERSED : POS.GTIN.DATE_NORMAL;

      const dateStr = dateChunk(barcode.slice(...datePos));
      const date = dateStr
        ? dayjs.tz(`20${dateStr}`, "YYYY-MM-DD", tz).startOf("day").toDate()
        : null;

      return {
        itemCode: barcode.slice(...POS.GTIN.ITEM),
        serial: barcode.slice(POS.GTIN.SERIAL),
        weight: Number(
          new Decimal(barcode.slice(...weightPos))
            .div(Decimal.pow(10, weightFactor))
            .toFixed(2)
        ),
        date,
      };
    }

    case "239": {
      const dateStr = dateChunk(barcode.slice(...POS.TYPE_239.DATE));
      const date = dateStr
        ? dayjs.tz(`20${dateStr}`, "YYYY-MM-DD", tz).startOf("day").toDate()
        : null;
      return {
        itemCode: String(Number(barcode.slice(...POS.TYPE_239.ITEM))),
        weight: Number(
          new Decimal(barcode.slice(...POS.TYPE_239.WEIGHT)).div(100).toFixed(2)
        ),
        date,
        serial: barcode.slice(POS.TYPE_239.SERIAL),
      };
    }

    case "ect": {
      const dateStr = dateChunk(barcode.slice(...POS.TYPE_ECT.DATE));
      const date = dateStr
        ? dayjs.tz(`20${dateStr}`, "YYYY-MM-DD", tz).startOf("day").toDate()
        : null;
      return {
        itemCode: barcode.slice(...POS.TYPE_ECT.ITEM),
        weight: Number(
          new Decimal(barcode.slice(...POS.TYPE_ECT.WEIGHT)).div(10).toFixed(2)
        ),
        date,
        serial: barcode.slice(POS.TYPE_ECT.SERIAL),
      };
    }

    default:
      return {};
  }
};

// 메인 함수
const scanFunc = (
  barcode: string,
  tz: string = "Australia/Sydney"
): ScannedResult => {
  const type = checkBarcodeType(barcode);
  const parsedData = parseBarcode(barcode, type, tz);

  const date = parsedData.date || null;

  return {
    type,
    itemCode: parsedData.itemCode || barcode,
    barcode,
    weight: parsedData.weight || 1,
    date,
    dateNumber: date ? date.getTime() : null,
    serial: parsedData.serial || null,
    totalPrice: parsedData.totalPrice || null,
  };
};

export default scanFunc;
