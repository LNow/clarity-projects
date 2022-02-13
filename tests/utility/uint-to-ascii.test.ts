import { Account, Chain, Clarinet, Contract, types } from "../deps.ts";

Clarinet.test({
  name: "[UINT-TO-ASCII] uint-to-ascii() correctly converts uint to ascii",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;
    const testCases = [
      BigInt("0"),
      BigInt("1"),
      BigInt("2"),
      BigInt("3"),
      BigInt("4"),
      BigInt("5"),
      BigInt("6"),
      BigInt("7"),
      BigInt("8"),
      BigInt("9"),
      BigInt("44"),
      BigInt("434"),
      BigInt("4314"),
      BigInt("43714"),
      BigInt("433714"),
      BigInt("4333714"),
      BigInt("43337114"),
      BigInt("433378114"),
      BigInt("4333678114"),
      BigInt("42333678114"),
      BigInt("423233678114"),
      BigInt("4232336178114"),
      BigInt("42323336178114"),
      BigInt("423623336178114"),
      BigInt("4236234336178114"),
      BigInt("42362343361768114"),
      BigInt("423623433671768114"),
      BigInt("4236234334671768114"),
      BigInt("402366234334671768114"),
      BigInt("4023662343334671768114"),
      BigInt("40236623433346731768114"),
      BigInt("402366234333460731768114"),
      BigInt("4023662343334607317681145"),
      BigInt("40236623463334607317681145"),
      BigInt("402366234633374607317681145"),
      BigInt("4023662934633374607317681145"),
      BigInt("40283662934633374607317681145"),
      BigInt("340283662934633374607317681145"),
      BigInt("3402823662934633374607317681145"),
      BigInt("34028236692934633374607317681145"),
      BigInt("340282366920934633374607317681145"),
      BigInt("3402823669209384633374607317681145"),
      BigInt("34028236692093846343374607317681145"),
      BigInt("340282366920938463433746074317681145"),
      BigInt("3402823669209384634337460743176821145"),
      BigInt("34028236692093846343374607431768211455"),
      BigInt("34028236692093846346374607431768211455"),
      BigInt("340282366920938463463374607431768211455"),
    ];

    for (const t of testCases) {
      let response = chain.callReadOnlyFn("uint-to-ascii", "uint-to-ascii", [types.uint(t)], deployer.address);
      response.result.expectAscii(t.toString())
    }
  },
});
