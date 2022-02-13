
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.5.2/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Checks empty proposals contract",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get('deployer')!;

        getProposalCount(chain, owner).result.expectUint(0);
        getTotalVotesCount(chain, owner, 0).result.expectUint(0);
        getYeaVotesCount(chain, owner, 0).result.expectUint(0);
        getNayVotesCount(chain, owner, 0).result.expectUint(0);

        getTotalVotesCount(chain, owner, 1).result.expectUint(0);
        getYeaVotesCount(chain, owner, 1).result.expectUint(0);
        getNayVotesCount(chain, owner, 1).result.expectUint(0);
    }
});

Clarinet.test({
    name: "Checks new proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get('deployer')!;

        // add new proposal
        let block = chain.mineBlock([
            Tx.contractCall('proposals', 'createProposal', [], owner.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        
        getProposalCount(chain, owner).result.expectUint(1);
        getTotalVotesCount(chain, owner, 1).result.expectUint(0);
        getYeaVotesCount(chain, owner, 1).result.expectUint(0);
        getNayVotesCount(chain, owner, 1).result.expectUint(0);

        // add 2 new proposal
        block = chain.mineBlock([
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
        ]);
        assertEquals(block.receipts.length, 2);
        assertEquals(block.height, 3);
        
        getProposalCount(chain, owner).result.expectUint(3);

        getTotalVotesCount(chain, owner, 2).result.expectUint(0);
        getYeaVotesCount(chain, owner, 2).result.expectUint(0);
        getNayVotesCount(chain, owner, 2).result.expectUint(0);

        getTotalVotesCount(chain, owner, 3).result.expectUint(0);
        getYeaVotesCount(chain, owner, 3).result.expectUint(0);
        getNayVotesCount(chain, owner, 3).result.expectUint(0);
    },
});


Clarinet.test({
    name: "Checks simple voting",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        // add 5 new proposals
        chain.mineBlock([
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address)
        ]);
        getProposalCount(chain, owner).result.expectUint(5);

        // vote for 2nd proposal
        let block = chain.mineBlock([
            Tx.contractCall('proposals', 'voteYea', [`u2`], owner.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 3);

        getTotalVotesCount(chain, owner, 1).result.expectUint(0);
        getYeaVotesCount(chain, owner, 1).result.expectUint(0);
        getNayVotesCount(chain, owner, 1).result.expectUint(0);

        getTotalVotesCount(chain, owner, 2).result.expectUint(1);
        getYeaVotesCount(chain, owner, 2).result.expectUint(1);
        getNayVotesCount(chain, owner, 2).result.expectUint(0);


        // vote for 3nd proposal
        block = chain.mineBlock([
            Tx.contractCall('proposals', 'voteYea', [`u3`], wallet_1.address),
            Tx.contractCall('proposals', 'voteNay', [`u3`], owner.address)
        ]);
        getTotalVotesCount(chain, owner, 3).result.expectUint(2);
        getYeaVotesCount(chain, owner, 3).result.expectUint(1);
        getNayVotesCount(chain, owner, 3).result.expectUint(1);
    }
});


Clarinet.test({
    name: "Checks multiple voting (cheating)",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const owner = accounts.get('deployer')!;
        const wallet_1 = accounts.get('wallet_1')!;

        // add 5 new proposals
        chain.mineBlock([
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address),
            Tx.contractCall('proposals', 'createProposal', [], owner.address)
        ]);
        getProposalCount(chain, owner).result.expectUint(5);

        // vote for 2nd proposal
        let block = chain.mineBlock([
            Tx.contractCall('proposals', 'voteYea', [`u2`], owner.address)
        ]);
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 3);

        getTotalVotesCount(chain, owner, 2).result.expectUint(1);
        getYeaVotesCount(chain, owner, 2).result.expectUint(1);
        getNayVotesCount(chain, owner, 2).result.expectUint(0);

        // check yea cheating
        block = chain.mineBlock([
            Tx.contractCall('proposals', 'voteYea', [`u2`], owner.address)
        ]);
        block.receipts[0].result.expectErr()
        getTotalVotesCount(chain, owner, 2).result.expectUint(1);
        getYeaVotesCount(chain, owner, 2).result.expectUint(1);
        getNayVotesCount(chain, owner, 2).result.expectUint(0);

        // check nay cheating
        block = chain.mineBlock([
            Tx.contractCall('proposals', 'voteNay', [`u2`], owner.address)
        ]);
        block.receipts[0].result.expectErr()
        getTotalVotesCount(chain, owner, 2).result.expectUint(1);
        getYeaVotesCount(chain, owner, 2).result.expectUint(1);
        getNayVotesCount(chain, owner, 2).result.expectUint(0);
    }
});




// helpeer functions
function getProposalCount(chain: Chain, account: Account) {
    return chain.callReadOnlyFn('proposals', 'getProposalsCount', [], account.address)
}


function getTotalVotesCount(chain: Chain, account: Account, proposalId: number) {
    return chain.callReadOnlyFn('proposals', 'getTotalVotesCount', [`u${proposalId}`], account.address)
}


function getYeaVotesCount(chain: Chain, account: Account, proposalId: number) {
    return chain.callReadOnlyFn('proposals', 'getYeaVotesCount', [`u${proposalId}`], account.address)
}


function getNayVotesCount(chain: Chain, account: Account, proposalId: number) {
    return chain.callReadOnlyFn('proposals', 'getNayVotesCount', [`u${proposalId}`], account.address)
}