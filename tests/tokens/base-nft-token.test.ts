import { Account, assertEquals, Chain, Clarinet, Contract, Tx, types } from "../deps.ts";

Clarinet.test({
  name: "[BASE-NFT-TOKEN] transfer() throws 4001 error if tx-sender is not the same as sender",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;
    const tokenId = 1;
    const sender = accounts.get("wallet_1")!;
    const recipient = accounts.get("wallet_2")!;
    const transferTx = Tx.contractCall(
      "base-nft-token",
      "transfer",
      [types.uint(tokenId), types.principal(sender.address), types.principal(recipient.address)],
      deployer.address
    );

    chain.mineBlock([Tx.contractCall("base-nft-token", "mint", [types.principal(sender.address)], deployer.address)]);

    // act
    const receipt = chain.mineBlock([transferTx]).receipts[0];

    // assert
    receipt.result.expectErr().expectUint(4001);
  },
});

Clarinet.test({
  name: "[BASE-NFT-TOKEN] transfer() succeeds when tx-sender is the same as sender",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;
    const tokenId = 1;
    const sender = accounts.get("wallet_4")!;
    const recipient = accounts.get("wallet_7")!;
    const transferTx = Tx.contractCall(
      "base-nft-token",
      "transfer",
      [types.uint(tokenId), types.principal(sender.address), types.principal(recipient.address)],
      sender.address
    );

    chain.mineBlock([Tx.contractCall("base-nft-token", "mint", [types.principal(sender.address)], deployer.address)]);

    // act
    const receipt = chain.mineBlock([transferTx]).receipts[0];

    // assert
    receipt.result.expectOk().expectBool(true);
    assertEquals(receipt.events.length, 1);
    receipt.events.expectNonFungibleTokenTransferEvent(
      types.uint(tokenId),
      sender.address,
      recipient.address,
      `${deployer.address}.base-nft-token`,
      "base-nft"
    );
  },
});
