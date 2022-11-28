import {
  QRErrorCorrectLevelType,
  QRModeType,
  QRMaskPatternType,
  QRCodeLimitLengthType,
  ErrorCorrectLevelType,
} from "./Model";

/**
 * If string has only spaces.
 *
 * @param {string} text
 * @returns {boolean}
 */
export function isOnlySpaces(text: string): boolean {
  return /^\s*$/.test(text);
}

/**
 * If given text is invalid of string definition.
 *
 * @param {string | null} text
 * @returns {boolean}
 */
export function isInvalidString(text: string | null): boolean {
  if (typeof text !== "string") {
    return true;
  }
  return isOnlySpaces(text);
}

/**
 * QR modes.
 */
export const QRMode: QRModeType = {
  MODE_NUMBER: 1 << 0,
  MODE_ALPHA_NUM: 1 << 1,
  MODE_8BIT_BYTE: 1 << 2,
  MODE_KANJI: 1 << 3,
};

/**
 * QR error correctiong levels.
 */
export const QRErrorCorrectLevel: QRErrorCorrectLevelType = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

/**
 * QR mask patterns.
 */
export const QRMaskPattern: QRMaskPatternType = {
  PATTERN000: 0,
  PATTERN001: 1,
  PATTERN010: 2,
  PATTERN011: 3,
  PATTERN100: 4,
  PATTERN101: 5,
  PATTERN110: 6,
  PATTERN111: 7,
};

/**
 * Checking current browser is canvas supported or not!
 *
 * @returns boolean
 */
export const isSupportCanvas = (): boolean => {
  return typeof CanvasRenderingContext2D !== "undefined";
};

/**
 * If current device is android and what is the version of this device.
 *
 * @returns { android: boolean; version: number }
 */
export const getAndroid = (): { android: boolean; version: number } => {
  let android = false;
  let version = 12;
  let userAgent = navigator.userAgent;

  if (/android/i.test(userAgent)) {
    android = true;
    let aMat = userAgent.match(/android ([0-9]\.[0-9])/i);

    if (aMat && aMat[1]) {
      version = parseFloat(aMat[1]);
    }
  }

  return {
    android,
    version,
  };
};

/**
 * Get the length of UTF8 encoded string.
 *
 * @param {string} text
 * @returns {number}
 */
export const getUTF8Length = (text: string): number => {
  let replacedText = encodeURI(text).replace(/\%[0-9a-fA-F]{2}/g, "a");
  return replacedText.length + (replacedText.length !== Number(text) ? 3 : 0);
};

/**
 * QR code limited array lengths;
 */
export const QRCodeLimitLength: QRCodeLimitLengthType = [
  [17, 14, 11, 7],
  [32, 26, 20, 14],
  [53, 42, 32, 24],
  [78, 62, 46, 34],
  [106, 84, 60, 44],
  [134, 106, 74, 58],
  [154, 122, 86, 64],
  [192, 152, 108, 84],
  [230, 180, 130, 98],
  [271, 213, 151, 119],
  [321, 251, 177, 137],
  [367, 287, 203, 155],
  [425, 331, 241, 177],
  [458, 362, 258, 194],
  [520, 412, 292, 220],
  [586, 450, 322, 250],
  [644, 504, 364, 280],
  [718, 560, 394, 310],
  [792, 624, 442, 338],
  [858, 666, 482, 382],
  [929, 711, 509, 403],
  [1003, 779, 565, 439],
  [1091, 857, 611, 461],
  [1171, 911, 661, 511],
  [1273, 997, 715, 535],
  [1367, 1059, 751, 593],
  [1465, 1125, 805, 625],
  [1528, 1190, 868, 658],
  [1628, 1264, 908, 698],
  [1732, 1370, 982, 742],
  [1840, 1452, 1030, 790],
  [1952, 1538, 1112, 842],
  [2068, 1628, 1168, 898],
  [2188, 1722, 1228, 958],
  [2303, 1809, 1283, 983],
  [2431, 1911, 1351, 1051],
  [2563, 1989, 1423, 1093],
  [2699, 2099, 1499, 1139],
  [2809, 2213, 1579, 1219],
  [2953, 2331, 1663, 1273],
];

/**
 * Get the type by string length
 *
 * @param {string} text
 * @param {ErrorCorrectLevelType} errorCorrectLevel
 * @returns {Number}
 */
export const getTypeNumber = (
  text: string,
  errorCorrectLevel: ErrorCorrectLevelType
): number => {
  let type = 1;
  let length = getUTF8Length(text);

  for (let i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
    let limit = 0;
    switch (errorCorrectLevel) {
      case QRErrorCorrectLevel.L:
        limit = QRCodeLimitLength[i][0];
        break;
      case QRErrorCorrectLevel.M:
        limit = QRCodeLimitLength[i][1];
        break;
      case QRErrorCorrectLevel.Q:
        limit = QRCodeLimitLength[i][2];
        break;
      case QRErrorCorrectLevel.H:
        limit = QRCodeLimitLength[i][3];
        break;
    }
    if (length <= limit) {
      break;
    } else {
      type++;
    }
  }

  if (type > QRCodeLimitLength.length) {
    throw new Error("Too long data");
  }

  return type;
};
