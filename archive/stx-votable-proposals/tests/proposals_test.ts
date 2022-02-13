
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.5.2/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';


Clarinet.test({
    name: "Checks empty contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        getProposalsCount(chain, owner).result.expectUint(0);
        getProposal(chain, owner, 0).result.expectNone();
        getProposal(chain, owner, 1).result.expectNone();
        getProposal(chain, wallet_1, 10).result.expectNone();
    },
});

Clarinet.test({
    name: "Checks new proposal creation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const PROPOSAL_GOAL: number = 20000;


        let block = chain.mineBlock([
            Tx.contractCall('proposals', 'createProposal', [types.uint(PROPOSAL_GOAL)], owner.address),
        ]);

        getProposalsCount(chain, owner).result.expectUint(1)

        let proposal = getProposal(chain, wallet_1, 1).result.expectSome().expectTuple();
        assertEquals(proposal, mockProposal(owner, PROPOSAL_GOAL, 0))
    },
});

Clarinet.test({
    name: "Checks investing in proposals",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const poor = accounts.get('poor')!;

        const PROPOSAL_GOAL: number = 20000;

        // create two proposals
        chain.mineBlock([
            Tx.contractCall('proposals', 'createProposal', [
                types.uint(PROPOSAL_GOAL)
            ], owner.address),

            Tx.contractCall('proposals', 'createProposal', [
                types.uint(PROPOSAL_GOAL)
            ], owner.address),
        ]);

        let block = chain.mineBlock([
            Tx.contractCall('proposals', 'invest', [
                types.uint(1),
                types.uint(200)
            ], wallet_1.address),

            Tx.contractCall('proposals', 'invest', [
                types.uint(2),
                types.uint(10)
            ], wallet_1.address),
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 3);

        let proposal_1 = getProposal(chain, owner, 1).result.expectSome().expectTuple();
        let proposal_2 = getProposal(chain, owner, 2).result.expectSome().expectTuple();
        assertEquals(proposal_1, mockProposal(owner, PROPOSAL_GOAL, 200));
        assertEquals(proposal_2, mockProposal(owner, PROPOSAL_GOAL, 10));

        block = chain.mineBlock([
            // try to invest 0 - should throw an error
            Tx.contractCall('proposals', 'invest', [
                types.uint(1),
                types.uint(0)
            ], wallet_1.address),

            // try to invest in unknown proposal - should throw an error
            Tx.contractCall('proposals', 'invest', [
                types.uint(99999),
                types.uint(10)
            ], wallet_1.address),

            // fulfill proposal goal - expected OK
            Tx.contractCall('proposals', 'invest', [
                types.uint(2),
                types.uint(PROPOSAL_GOAL)
            ], wallet_1.address),

            // try to invest in already funded proposal - should throw and error
            Tx.contractCall('proposals', 'invest', [
                types.uint(2),
                types.uint(1)
            ], wallet_1.address),

            // try to invest in while not having any funds - should throw and error
            Tx.contractCall('proposals', 'invest', [
                types.uint(1),
                types.uint(20)
            ], poor.address)
        ]);

        block.receipts[0].result.expectErr();
        block.receipts[1].result.expectErr();
        block.receipts[2].result.expectOk();
        block.receipts[3].result.expectErr();
        block.receipts[4].result.expectErr();
    },
});

Clarinet.test({
    name: "Checks closing proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;
        const poor = accounts.get('poor')!;

        const PROPOSAL_GOAL: number = 20000;

        // create two proposals
        chain.mineBlock([
            Tx.contractCall('proposals', 'createProposal', [
                types.uint(PROPOSAL_GOAL)
            ], owner.address),

            Tx.contractCall('proposals', 'createProposal', [
                types.uint(PROPOSAL_GOAL)
            ], poor.address),
        ]);

        let block = chain.mineBlock([
            // try to close unknow proposal - should throw an error
            Tx.contractCall('proposals', 'closeProposal', [
                types.uint(999)
            ], owner.address),

        ]);
        block.receipts[0].result.expectErr();


        block = chain.mineBlock([
            // try to close proposal with addres that is not owner of this proposal - should throw an error
            Tx.contractCall('proposals', 'closeProposal', [
                types.uint(1)
            ], wallet_1.address),

        ]);
        block.receipts[0].result.expectErr();


        block = chain.mineBlock([
            Tx.contractCall('proposals', 'invest', [
                types.uint(1),
                types.uint(PROPOSAL_GOAL-1)
            ], wallet_1.address),

            Tx.contractCall('proposals', 'invest', [
                types.uint(2),
                types.uint(PROPOSAL_GOAL)
            ], wallet_1.address),
        ]);

        let proposal_1 = getProposal(chain, owner, 1).result.expectSome().expectTuple();
        let proposal_2 = getProposal(chain, owner, 2).result.expectSome().expectTuple();
        assertEquals(proposal_1, mockProposal(owner, PROPOSAL_GOAL, PROPOSAL_GOAL-1));
        assertEquals(proposal_2, mockProposal(poor, PROPOSAL_GOAL, PROPOSAL_GOAL));


        block = chain.mineBlock([
            // try to close not fully funded proposal - should throw an error
            Tx.contractCall('proposals', 'closeProposal', [
                types.uint(1)
            ], owner.address),

        ]);
        block.receipts[0].result.expectErr();


        block = chain.mineBlock([
            // try to close not fully funded proposal - should throw an error
            Tx.contractCall('proposals', 'closeProposal', [
                types.uint(2)
            ], poor.address),
        ]);
        block.receipts[0].result.expectOk();
        
        proposal_2 = getProposal(chain, owner, 2).result.expectSome().expectTuple();
        assertEquals(proposal_2, mockProposal(poor, PROPOSAL_GOAL, PROPOSAL_GOAL, true));
        

        block = chain.mineBlock([
            // try to close already closed proposal - should throw an error
            Tx.contractCall('proposals', 'closeProposal', [
                types.uint(2)
            ], poor.address),
        ]);
        block.receipts[0].result.expectErr();
    },
});

// helpeer functions
function getProposalsCount(chain: Chain, account: Account) {
    return chain.callReadOnlyFn('proposals', 'getProposalsCount', [], account.address)
}


function getProposal(chain: Chain, account: Account, proposalId: number) {
    return chain.callReadOnlyFn('proposals', 'getProposal', [
        types.uint(proposalId)
    ], account.address)
}


function mockProposal(owner: Account, goal: number, invested: number, closed: boolean = false) {
    return {
        owner: owner.address,
        goal: types.uint(goal),
        invested: types.uint(invested),
        closed: types.bool(closed)
    }
}