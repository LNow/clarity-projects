export { Chain, Clarinet, Tx, types } from "https://deno.land/x/clarinet@v0.25.0/index.ts";

export type { Account, Contract } from "https://deno.land/x/clarinet@v0.25.0/index.ts";

export { assertEquals } from "https://deno.land/std@0.125.0/testing/asserts.ts";

import { encode as hexEncode, decode as hexDecode } from "https://deno.land/std@0.125.0/encoding/hex.ts";

export function stringToHex(input: string) {
  return hexDecode(new TextEncoder().encode(input))
}

export function decToHex(input: number) {
  let v = input.toString(16);
  v = v.length > 1 ? v : `0${v}`;

  return stringToHex(v)
}