import { Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.5.2/index.ts';
import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";
import { Rhum } from "../../deps/rhum/mod.ts"
import { getMilestoneGoal, 
    getMilestonesCount, 
    getProjectGoal, 
    getProjectOwner, 
    getProjectsCount
} from "./lib/helpers.ts"


Rhum.testPlan("Projects contract:", () => {
    let chain: Chain;
    let accounts: Map<string, Account>;
    let deployer: Account;
    let wallet_1: Account;
    let wallet_2: Account;
    let poor_wallet: Account;

    function setupCleanEnv() {
        (Deno as any).core.ops();
        let result = (Deno as any).core.jsonOpSync("setup_chain", {});
        chain = new Chain(result['session_id']);
        accounts = new Map();

        for (let account of result['accounts']) {
            accounts.set(account.name, account);
        }

        deployer = accounts.get('deployer')!;
        wallet_1 = accounts.get('wallet_1')!;
        wallet_2 = accounts.get('wallet_2')!;
        poor_wallet = accounts.get('poor')!;
    }


    Rhum.testSuite("Projects counter", () => {
        Rhum.beforeEach(() => {
            setupCleanEnv();
        })

        Rhum.testCase("should be 0 when contract is deployed", () => {
            let count = getProjectsCount(chain, deployer).result;
            count.expectUint(0);
        })

        Rhum.testCase("should increments when new project is added", () => {
            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),
            ]);

            assertEquals(block.height, 2);
            assertEquals(block.receipts.length, 1);

            let count = getProjectsCount(chain, deployer).result;
            count.expectUint(1);

            for (let i = 0; i < 10; i++) {
                chain.mineBlock([
                    Tx.contractCall('projects', 'createProject', [], deployer.address),
                ]);
            }

            count = getProjectsCount(chain, deployer).result;
            count.expectUint(11)
        })
    });


    Rhum.testSuite("Milestones counter", () => {
        Rhum.beforeEach(() => {
            setupCleanEnv();
        })

        Rhum.testCase("should be 0 when queried unknown project", () => {
            let count = getMilestonesCount(chain, deployer, 999).result;
            count.expectUint(0)
        })

        Rhum.testCase("should be 0 when queried project without any milesotnes", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),
            ]);

            let count = getMilestonesCount(chain, deployer, 1).result;
            count.expectUint(0)
        })

        Rhum.testCase("should increment when new milestone is added", () => {
            // first project and its milestones
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], deployer.address),
            ]);

            // second project and its milestones
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(2), // projectId
                    types.uint(10) // goal
                ], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(2), // projectId
                    types.uint(30) // goal
                ], deployer.address),
            ]);


            let count = getMilestonesCount(chain, deployer, 1).result;
            count.expectUint(1);

            count = getMilestonesCount(chain, deployer, 2).result;
            count.expectUint(2);
        })
    });

    Rhum.testSuite("Project goal", () => {
        Rhum.beforeEach(() => {
            setupCleanEnv()
        });

        Rhum.testCase("should be 0 when id of unknown project is provided", () => {
            let goal = getProjectGoal(chain, deployer, 10).result;

            goal.expectUint(0);
        })

        Rhum.testCase("should be 0 when queried project without any milestones", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address)
            ]);

            let count = getMilestonesCount(chain, deployer, 1).result;
            count.expectUint(0)

            let goal = getProjectGoal(chain, deployer, 1).result;
            goal.expectUint(0);
        })

        Rhum.testCase("should be 10 when queried project with one milestone with goal 10", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], deployer.address)
            ]);

            let count = getMilestonesCount(chain, deployer, 1).result;
            count.expectUint(1)

            let goal = getProjectGoal(chain, deployer, 1).result;
            goal.expectUint(10);
        })

        Rhum.testCase("should be 30 when queried project with 2 milestones with goals 10 and 20", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(20) // goal
                ], deployer.address),
            ]);

            let count = getMilestonesCount(chain, deployer, 1).result;
            count.expectUint(2)

            let goal = getProjectGoal(chain, deployer, 1).result;
            goal.expectUint(30);
        })
    });

    Rhum.testSuite("Milestone goal", () => {
        Rhum.beforeAll(() => {
            setupCleanEnv()
        })

        Rhum.testCase("should be 0 when queried unknown milestone of unknown project ", () => {
            let goal = getMilestoneGoal(chain, deployer, 999, 3939393).result;

            goal.expectUint(0);
        });

        Rhum.testCase("shoudl be 0 when queried project without milestones", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address)
            ]);

            let goal = getMilestoneGoal(chain, deployer, 1, 0).result;
            goal.expectUint(0);

            goal = getMilestoneGoal(chain, deployer, 1, 1).result;
            goal.expectUint(0);

            goal = getMilestoneGoal(chain, deployer, 1, 2).result;
            goal.expectUint(0);

            goal = getMilestoneGoal(chain, deployer, 1, 555).result;
            goal.expectUint(0);
        })

        Rhum.testCase("should be 0 when queried unknown milestone in a project with multiple milestones", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(20) // goal
                ], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(30) // goal
                ], deployer.address),
            ]);

            let goal = getMilestoneGoal(chain, deployer, 1, 10).result;
            goal.expectUint(0);

            goal = getMilestoneGoal(chain, deployer, 1, 12).result;
            goal.expectUint(0);

            goal = getMilestoneGoal(chain, deployer, 1, 39).result;
            goal.expectUint(0);
        });

        Rhum.testCase("should be equal goal of milestone in project with multiple milestones", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(20) // goal
                ], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(30) // goal
                ], deployer.address),
            ]);

            let goal = getMilestoneGoal(chain, deployer, 1, 1).result;
            goal.expectUint(10);

            goal = getMilestoneGoal(chain, deployer, 1, 2).result;
            goal.expectUint(20);

            goal = getMilestoneGoal(chain, deployer, 1, 3).result;
            goal.expectUint(30);
        });
    });

    Rhum.testSuite("Creating projects", () => {
        Rhum.beforeEach(() => {
            setupCleanEnv();
        });

        Rhum.testCase("should not cause any side effects", () => {
            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address)
            ]);

            assertEquals(block.height, 2);
            assertEquals(block.receipts.length, 1);
            assertEquals(block.receipts[0].events.length, 0)
        })

        Rhum.testCase("should succeed when called by contract deployer", () => {
            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),
                Tx.contractCall('projects', 'createProject', [], deployer.address),
                Tx.contractCall('projects', 'createProject', [], deployer.address),
                Tx.contractCall('projects', 'createProject', [], deployer.address)
            ]);

            assertEquals(block.height, 2);
            assertEquals(block.receipts.length, 4);

            block.receipts.forEach(receipt => {
                receipt.result.expectOk().expectBool(true);
                assertEquals(receipt.events.length, 0)
            });
        });

        Rhum.testCase("should succeed when called by any principal", () => {
            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], wallet_1.address),
                Tx.contractCall('projects', 'createProject', [], wallet_2.address),
                Tx.contractCall('projects', 'createProject', [], wallet_1.address),
                Tx.contractCall('projects', 'createProject', [], wallet_2.address)
            ]);

            assertEquals(block.height, 2);
            assertEquals(block.receipts.length, 4);

            block.receipts.forEach(receipt => {
                receipt.result.expectOk().expectBool(true);
                assertEquals(receipt.events.length, 0)
            });
        });

        Rhum.testCase("should assign tx-sender as project owner", () => {
            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], wallet_1.address),
                Tx.contractCall('projects', 'createProject', [], wallet_2.address),
                Tx.contractCall('projects', 'createProject', [], wallet_1.address),
                Tx.contractCall('projects', 'createProject', [], wallet_2.address)
            ]);

            assertEquals(block.height, 2);
            assertEquals(block.receipts.length, 4);

            block.receipts.forEach((receipt, index) => {
                let expectedOwner = (index % 2 === 0) ? wallet_1 : wallet_2;
                let owner = getProjectOwner(chain, deployer, index+1).result;
                
                owner.expectSome().expectPrincipal(expectedOwner.address);
                
            });
        });
    });

    Rhum.testSuite("Creating milestones", () => {
        Rhum.beforeEach(() => {
            setupCleanEnv();
        });

        Rhum.testCase("should fail when unknow projectId provided", () => {
            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(10), // projectId
                    types.uint(1000) // goal
                ], deployer.address)
            ]);
            
            assertEquals(block.height, 2);
            assertEquals(block.receipts.length, 1);

            let receipt = block.receipts[0];
            receipt.result.expectErr();
        });

        Rhum.testCase("should fail when provided goal is equal 0", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address)
            ]);

            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(0) // goal
                ], deployer.address)
            ]);

            assertEquals(block.height, 3);
            assertEquals(block.receipts.length, 1);

            let receipt = block.receipts[0];
            receipt.result.expectErr();
        });

        Rhum.testCase("should fail when called by someone who is not a project owner", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address)
            ]);

            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], wallet_1.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], wallet_2.address)
            ]);

            assertEquals(block.height, 3);
            assertEquals(block.receipts.length, 2);

            block.receipts.forEach(receipt => {
                receipt.result.expectErr()
            });
        });

        Rhum.testCase("should not cause any side effects", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address)
            ]);

            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], deployer.address)
            ]);

            assertEquals(block.height, 3);
            assertEquals(block.receipts.length, 1);
            assertEquals(block.receipts[0].events.length, 0)
        })

        Rhum.testCase("should succeed when called by any principal who is project owner", () => {
            chain.mineBlock([
                Tx.contractCall('projects', 'createProject', [], deployer.address),
                Tx.contractCall('projects', 'createProject', [], wallet_1.address),
                Tx.contractCall('projects', 'createProject', [], wallet_2.address),
                Tx.contractCall('projects', 'createProject', [], poor_wallet.address),
            ]);

            let block = chain.mineBlock([
                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(1), // projectId
                    types.uint(10) // goal
                ], deployer.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(2), // projectId
                    types.uint(10) // goal
                ], wallet_1.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(3), // projectId
                    types.uint(10) // goal
                ], wallet_2.address),

                Tx.contractCall('projects', 'createMilestone', [
                    types.uint(4), // projectId
                    types.uint(10) // goal
                ], poor_wallet.address),
            ]);

            assertEquals(block.height, 3);
            assertEquals(block.receipts.length, 4);

            block.receipts.forEach(receipt => {
                receipt.result.expectOk().expectBool(true);
                assertEquals(receipt.events.length, 0)
            });
        });

        
    })
})

Rhum.run();