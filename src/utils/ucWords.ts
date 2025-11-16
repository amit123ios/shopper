// utils/ucwords.js
export function ucwords(str:string) {
  return str
    ? str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : null;
}

