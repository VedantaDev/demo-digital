export type NikValidationResult = {
  valid: boolean;
  message: string;
};

/**
 * Validates the structural rules that can be checked without a Dukcapil API.
 * A browser-only prototype cannot prove that a NIK exists in the population
 * registry; it can only reject values that are impossible by format/date.
 */
export function isValidNIK(nik: string): NikValidationResult {
  if (!/^\d{16}$/.test(nik)) {
    return {
      valid: false,
      message: 'NIK harus terdiri dari tepat 16 angka.',
    };
  }

  const province = Number(nik.slice(0, 2));
  const city = Number(nik.slice(2, 4));
  const district = Number(nik.slice(4, 6));
  const encodedDay = Number(nik.slice(6, 8));
  const month = Number(nik.slice(8, 10));
  const sequence = Number(nik.slice(12, 16));

  if (province === 0 || city === 0 || district === 0) {
    return {
      valid: false,
      message: 'Kode wilayah pada NIK tidak valid.',
    };
  }

  const day = encodedDay > 40 ? encodedDay - 40 : encodedDay;
  if (day < 1 || day > 31) {
    return {
      valid: false,
      message: 'Tanggal lahir pada NIK tidak valid.',
    };
  }

  if (month < 1 || month > 12) {
    return {
      valid: false,
      message: 'Bulan lahir pada NIK tidak valid.',
    };
  }

  if (sequence < 1) {
    return {
      valid: false,
      message: 'Nomor urut NIK tidak valid.',
    };
  }

  return {
    valid: true,
    message: 'Format NIK valid.',
  };
}