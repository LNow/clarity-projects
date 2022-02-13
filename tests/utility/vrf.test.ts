import { Account, Chain, Clarinet, Contract, decToHex, stringToHex, Tx, types } from "../deps.ts";

Clarinet.test({
  name: "[VRF] buff-to-u8() properly converts byte to u8",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;

    for (let i = 0; i <= 255; i++) {
      const response = chain.callReadOnlyFn("vrf", "buff-to-u8", [types.buff(decToHex(i))], deployer.address);

      response.result.expectUint(i);
    }
  },
});

Clarinet.test({
  name: "[VRF] lower-16-le() converts lower 16 bytes to uint",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;

    const testCases = [
      { input: "0000000000000000000000000000000000000000000000000000000000001092", expected: BigInt("4242") },
      { input: "00000000000000000000000000000000000000000000000000000000FCE45782", expected: BigInt("4242823042") },
      { input: "00000000000000000000000000000000000000000000000000038AFC86529662", expected: BigInt("997242120083042") },
      { input: "00000000000000000000000000000000000000000000000001B578BD884937D1", expected: BigInt("123137320253208529") },
      { input: "00000000000000000000000000000000000000106376803A634BF728C26037D1", expected: BigInt("1298432874987233137320253208529") },
      {
        input: "000000000000000000000000000000000017B06EA66685F6A832B4F6C26037D1",
        expected: BigInt("123001298432874987233137320253208529"),
      },
      {
        input: "000000000000000000000000000000004A9265488524435AFE713826C26037D1",
        expected: BigInt("99123001298432874987233137320253208529"),
      },
      {
        input: "00000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
        expected: BigInt("340282366920938463463374607431768211455"),
      },
      // with upper 16 bytes filled with something
      { input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF00000000000000000000000000001092", expected: BigInt("4242") },
      { input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000000000FCE45782", expected: BigInt("4242823042") },
      { input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000000038AFC86529662", expected: BigInt("997242120083042") },
      { input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000000000000001B578BD884937D1", expected: BigInt("123137320253208529") },
      { input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF000000106376803A634BF728C26037D1", expected: BigInt("1298432874987233137320253208529") },
      {
        input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0017B06EA66685F6A832B4F6C26037D1",
        expected: BigInt("123001298432874987233137320253208529"),
      },
      {
        input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF4A9265488524435AFE713826C26037D1",
        expected: BigInt("99123001298432874987233137320253208529"),
      },
      {
        input: "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
        expected: BigInt("340282366920938463463374607431768211455"),
      },
    ];

    for (const t of testCases) {
      const response = chain.callReadOnlyFn("vrf", "lower-16-le", [types.buff(stringToHex(t.input))], deployer.address);

      response.result.expectUint(t.expected);
    }
  },
});

Clarinet.test({
  name: "[VRF] get-rnd() returns (ok uint) for blocks from the past",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;

    chain.mineEmptyBlock(20);
    for (let b = chain.blockHeight - 1; b > 0; b--) {
      const response = chain.callReadOnlyFn("vrf", "get-rnd", [types.uint(b)], deployer.address);

      response.result.expectOk();
    }
  },
});

Clarinet.test({
  name: "[VRF] get-rnd() returns err for current block and blocks from the future",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;

    for (let b = chain.blockHeight; b < 20; b++) {
      const response = chain.callReadOnlyFn("vrf", "get-rnd", [types.uint(200 + b)], deployer.address);

      response.result.expectErr();
    }
  },
});

Clarinet.test({
  name: "[VRF] get-save-rnd() called first with block X",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;

    chain.mineEmptyBlock(10);
    const response = chain.mineBlock([Tx.contractCall("vrf", "get-save-rnd", [types.uint(4)], deployer.address)]).receipts[0];

    response.result.expectOk();
  },
});

Clarinet.test({
  name: "[VRF] get-save-rnd() called multiple times with the same block",
  // ignore: true,
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;

    chain.mineEmptyBlock(10);
    for (let i = 1; i <= 20; i++) {
      chain.mineBlock([Tx.contractCall("vrf", "get-save-rnd", [types.uint(4)], deployer.address)]);
    }
  },
});
