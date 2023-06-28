// Type definitions for circomlibjs 0.1
// Project: https://github.com/iden3/circomlibjs#readme
declare module "circomlibjs" {
    export class SMT {
        constructor(...args: any[]);
    
        delete(...args: any[]): void;
    
        find(...args: any[]): void;
    
        insert(...args: any[]): void;
    
        update(...args: any[]): void;
    
    }
    
    export class SMTMemDb {
        constructor(...args: any[]);
    
        get(...args: any[]): void;
    
        getRoot(...args: any[]): void;
    
        multiDel(...args: any[]): void;
    
        multiGet(...args: any[]): void;
    
        multiIns(...args: any[]): void;
    
        setRoot(...args: any[]): void;
    
    }
    
    export class evmasm {
        constructor(...args: any[]);
    
        add(...args: any[]): void;
    
        addmod(...args: any[]): void;
    
        address(...args: any[]): void;
    
        and(...args: any[]): void;
    
        balance(...args: any[]): void;
    
        blockhash(...args: any[]): void;
    
        byte(...args: any[]): void;
    
        call(...args: any[]): void;
    
        callcode(...args: any[]): void;
    
        calldatacopy(...args: any[]): void;
    
        calldataload(...args: any[]): void;
    
        calldatasize(...args: any[]): void;
    
        caller(...args: any[]): void;
    
        callvalue(...args: any[]): void;
    
        codecopy(...args: any[]): void;
    
        codesize(...args: any[]): void;
    
        coinbase(...args: any[]): void;
    
        create(...args: any[]): void;
    
        createTxData(...args: any[]): void;
    
        delegatecall(...args: any[]): void;
    
        difficulty(...args: any[]): void;
    
        div(...args: any[]): void;
    
        dup(...args: any[]): void;
    
        eq(...args: any[]): void;
    
        exp(...args: any[]): void;
    
        extcodecopy(...args: any[]): void;
    
        extcodesize(...args: any[]): void;
    
        gas(...args: any[]): void;
    
        gaslimit(...args: any[]): void;
    
        gasprice(...args: any[]): void;
    
        gt(...args: any[]): void;
    
        invalid(...args: any[]): void;
    
        iszero(...args: any[]): void;
    
        jmp(...args: any[]): void;
    
        jmpi(...args: any[]): void;
    
        keccak(...args: any[]): void;
    
        label(...args: any[]): void;
    
        log0(...args: any[]): void;
    
        log1(...args: any[]): void;
    
        log2(...args: any[]): void;
    
        log3(...args: any[]): void;
    
        log4(...args: any[]): void;
    
        lt(...args: any[]): void;
    
        mload(...args: any[]): void;
    
        mod(...args: any[]): void;
    
        msize(...args: any[]): void;
    
        mstore(...args: any[]): void;
    
        mstore8(...args: any[]): void;
    
        mul(...args: any[]): void;
    
        mulmod(...args: any[]): void;
    
        not(...args: any[]): void;
    
        number(...args: any[]): void;
    
        or(...args: any[]): void;
    
        origin(...args: any[]): void;
    
        pc(...args: any[]): void;
    
        pop(...args: any[]): void;
    
        push(...args: any[]): void;
    
        return(...args: any[]): void;
    
        returndatacopy(...args: any[]): void;
    
        returndatasize(...args: any[]): void;
    
        revert(...args: any[]): void;
    
        sdiv(...args: any[]): void;
    
        selfdestruct(...args: any[]): void;
    
        sgt(...args: any[]): void;
    
        sha3(...args: any[]): void;
    
        shor(...args: any[]): void;
    
        signextend(...args: any[]): void;
    
        sload(...args: any[]): void;
    
        slt(...args: any[]): void;
    
        smod(...args: any[]): void;
    
        sstore(...args: any[]): void;
    
        staticcall(...args: any[]): void;
    
        stop(...args: any[]): void;
    
        sub(...args: any[]): void;
    
        swap(...args: any[]): void;
    
        timestamp(...args: any[]): void;
    
    }
    
    export function buildBabyjub(): any;
    
    export function buildEddsa(): any;
    
    export function buildMimc7(): any;
    
    export function buildMimcSponge(): any;
    
    export function buildPedersenHash(): any;
    
    export function buildPoseidon(): any;
    
    export function buildPoseidonOpt(): any;
    
    export function buildPoseidonReference(): any;
    
    export function buildPoseidonWasm(module: any): void;
    
    export function buildSMT(db: any, root: any): any;
    
    export function newMemEmptyTrie(): any;
    
    export namespace mimc7Contract {
        const abi: {
            constant: boolean;
            inputs: {
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                name: string;
                type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
        }[];
    
        function createCode(seed: any, n: any): any;
    
    }
    
    export namespace mimcSpongecontract {
        const abi: {
            constant: boolean;
            inputs: {
                name: string;
                type: string;
            }[];
            name: string;
            outputs: {
                name: string;
                type: string;
            }[];
            payable: boolean;
            stateMutability: string;
            type: string;
        }[];
    
        function createCode(seed: any, n: any): any;
    
    }
    
    export namespace poseidonContract {
        function createCode(nInputs: any): any;
    
        function generateABI(nInputs: any): any;
    
    }
}


