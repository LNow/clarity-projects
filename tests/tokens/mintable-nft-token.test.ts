import { Account, assertEquals, Chain, Clarinet, Contract, Tx, types } from "../deps.ts";

Clarinet.test({
  name: "[MINTABLE-NFT-TOKEN] mint-with() throws 4002 error when unknown tender is provided",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;
    const tenderAddress = `${deployer.address}.wstx-token`;
    const txSender = accounts.get("wallet_1")!;
    const mintTx = Tx.contractCall("mintable-nft-token", "mint-with", [types.principal(tenderAddress)], txSender.address);

    // act
    const receipt = chain.mineBlock([mintTx]).receipts[0];

    // assert
    receipt.result.expectErr().expectUint(4002);
  },
});

Clarinet.test({
  name: "[MINTABLE-NFT-TOKEN] mint-with() succeeds when known tender is provided",
  async fn(chain: Chain, accounts: Map<string, Account>, contracts: Map<string, Contract>) {
    const deployer = accounts.get("deployer")!;
    const tenderAddress = `${deployer.address}.wstx-token`;
    const price = 200000000;
    const artistAddress = deployer.address;
    const commissionRate = 50;
    const commissionAddress = deployer.address;
    const txSender = accounts.get("wallet_1")!;
    const mintTx = Tx.contractCall("mintable-nft-token", "mint-with", [types.principal(tenderAddress)], txSender.address);

    // add new tender
    chain.mineBlock([
      Tx.contractCall(
        "mintable-nft-token",
        "set-tender-pricing",
        [
          types.principal(tenderAddress),
          types.uint(price),
          types.principal(artistAddress),
          types.uint(commissionRate),
          types.principal(commissionAddress),
        ],
        deployer.address
      ),
    ]);

    // act
    const receipt = chain.mineBlock([mintTx]).receipts[0];

    // assert
    receipt.result.expectOk();
  },
});
