import { Account, assertEquals, Chain, Clarinet, Contract, Tx, types } from "../deps.ts";

Clarinet.test({
  name: "[BASE-FT-TOKEN] transfer() throws 4001 error if tx-sender is not the same as sender",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;
    const amount = 10;
    const sender = accounts.get("wallet_1")!;
    const recipient = accounts.get("wallet_2")!;
    const transferTx = Tx.contractCall(
      "base-ft-token",
      "transfer",
      [types.uint(amount), types.principal(sender.address), types.principal(recipient.address), types.none()],
      deployer.address
    );

    chain.mineBlock([Tx.contractCall("base-ft-token", "mint", [types.uint(amount), types.principal(sender.address)], deployer.address)]);

    // act
    const receipt = chain.mineBlock([transferTx]).receipts[0];

    // assert
    receipt.result.expectErr().expectUint(4001);
  },
});

Clarinet.test({
  name: "[BASE-FT-TOKEN] transfer() succeeds when tx-sender is the same as sender",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;
    const amount = 234234;
    const sender = accounts.get("wallet_4")!;
    const recipient = accounts.get("wallet_7")!;
    const transferTx = Tx.contractCall(
      "base-ft-token",
      "transfer",
      [types.uint(amount), types.principal(sender.address), types.principal(recipient.address), types.none()],
      sender.address
    );

    chain.mineBlock([Tx.contractCall("base-ft-token", "mint", [types.uint(amount), types.principal(sender.address)], deployer.address)]);

    // act
    const receipt = chain.mineBlock([transferTx]).receipts[0];

    // assert
    receipt.result.expectOk().expectBool(true);
    assertEquals(receipt.events.length, 1);
    receipt.events.expectFungibleTokenTransferEvent(
      amount,
      sender.address,
      recipient.address,
      `${deployer.address}.base-ft-token::base-ft`
    );
  },
});
