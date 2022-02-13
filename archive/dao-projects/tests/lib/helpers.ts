import { Chain, Account, types } from "https://deno.land/x/clarinet@v0.5.2/index.ts";

//helpers
export interface Result {
    session_id: number,
    result: string
    events: []
}

export function callReadOnlyFn(chain: Chain, caller: Account, fname: string, options: Array<any> = []) {
    return chain.callReadOnlyFn('projects', fname, options, caller.address);
}

export function getProjectsCount(chain: Chain, caller: Account): Result {
    let call = callReadOnlyFn(chain, caller, 'getProjectsCount')

    return call;
}

export function getMilestonesCount(chain: Chain, caller: Account, projectId: number): Result {
    let call = callReadOnlyFn(chain, caller, 'getMilestonesCount', [
        types.uint(projectId)
    ])

    return call;
}

export function getProjectGoal(chain: Chain, caller: Account, projectId: number): Result {
    let call = callReadOnlyFn(chain, caller, 'getProjectGoal', [
        types.uint(projectId)
    ])

    return call;
}

export function getMilestoneGoal(chain: Chain, caller: Account, projectId: number, milestoneId: number): Result {
    let call = callReadOnlyFn(chain, caller, 'getMilestoneGoal', [
        types.uint(projectId),
        types.uint(milestoneId)
    ]);

    return call;
}

export function getProjectOwner(chain: Chain, caller: Account, projectId: number): Result {
    let call = callReadOnlyFn(chain, caller, 'getProjectOwner', [
        types.uint(projectId)
    ]);

    return call;
}

export function getTotalSupply(chain: Chain, caller: Account): Result {
    let call = callReadOnlyFn(chain, caller, 'getTotalSupply');

    return call
}