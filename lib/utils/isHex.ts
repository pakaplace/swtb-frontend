export default function isHex(val: string) {
  return Boolean(val.match(/^0x[0-9a-f]+$/i));
}
