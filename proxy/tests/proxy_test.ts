
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.6.0/index.ts';

Clarinet.test({
    name: "Ensure that <...>",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let wallet_1 = accounts.get("wallet_1")!;

        // get current proxy subject
        let subject = chain.callReadOnlyFn('proxy', 'get-subject', [], wallet_1.address).result;

        let result = chain.callReadOnlyFn(
            "proxy",
            "perform-operation",
            [
                types.uint(10),
                types.uint(15),
                types.principal(subject)
            ], wallet_1.address
        ).result;

        result.expectOk().expectUint(150)


        // change proxy subject to different contract
        let block = chain.mineBlock([
            Tx.contractCall(
                'proxy',
                'change-subject',
                [
                    types.principal('ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.subject_b')
                ],
                wallet_1.address
            )
        ]);
        block.receipts[0].result.expectOk().expectBool(true);


        // let's try to call proxy once again with the same subject as in the first call
        // it should fail with error 9999999999
        result = chain.callReadOnlyFn(
            "proxy",
            "perform-operation",
            [
                types.uint(10),
                types.uint(15),
                types.principal(subject)
            ], wallet_1.address
        ).result;

        result.expectErr().expectUint(9999999999);


        // get new subject
        subject = chain.callReadOnlyFn('proxy', 'get-subject', [], wallet_1.address).result;

        result = chain.callReadOnlyFn(
            "proxy",
            "perform-operation",
            [
                types.uint(10),
                types.uint(15),
                types.principal(subject)
            ], wallet_1.address
        ).result;

        result.expectOk().expectUint(25);
    },
});
