let validatedKtpFile: File | null = null;
let validatedKtpName = '';

export function setValidatedKtp(file: File, name: string) {
  validatedKtpFile = file;
  validatedKtpName = name;
}

export function getValidatedKtp() {
  return { file: validatedKtpFile, name: validatedKtpName };
}

export function clearValidatedKtp() {
  validatedKtpFile = null;
  validatedKtpName = '';
}