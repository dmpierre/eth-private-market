export function bigint_to_tuple(x: bigint) {
    /**
     * From https://github.com/0xPARC/circom-ecdsa/blob/master/test/ecdsa.test.ts
     */
    let mod: bigint = BigInt(2) ** BigInt(64);
    let ret: [bigint, bigint, bigint, bigint] = [
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
    ];

    var x_temp: bigint = x;
    for (var idx = 0; idx < ret.length; idx++) {
        ret[idx] = x_temp % mod;
        x_temp = x_temp / mod;
    }
    return ret;
}

export function tuple_to_bigint(x: bigint[], n?: number) {
    let mod: bigint = BigInt(2) ** BigInt(64);
    if (n !== undefined) {
        mod = BigInt(2) ** BigInt(n);
    }
    let ret: bigint = BigInt(0);
    for (var idx = 0; idx < x.length; idx++) {
        ret = ret + x[idx] * mod ** BigInt(idx);
    }
    return ret;
}

export function bigint_to_array(n: number, k: number, x: bigint) {
    /**
     * From https://github.com/0xPARC/circom-ecdsa/blob/master/test/ecdsa.test.ts
     */
    let mod: bigint = BigInt(1);
    for (var idx = 0; idx < n; idx++) {
        mod = mod * BigInt(2);
    }

    let ret: bigint[] = [];
    var x_temp: bigint = x;
    for (var idx = 0; idx < k; idx++) {
        ret.push(x_temp % mod);
        x_temp = x_temp / mod;
    }
    return ret;
}

export function Uint8Array_to_bigint(x: Uint8Array) {
    /**
     * From https://github.com/0xPARC/circom-ecdsa/blob/master/test/ecdsa.test.ts
     */
    var ret: bigint = BigInt(0);
    for (var idx = 0; idx < x.length; idx++) {
        ret = ret * BigInt(256);
        ret = ret + BigInt(x[idx]);
    }
    return ret;
}

export const toBigIntArray = (array: (string | number)[]) => {
    let result: bigint[] = [];
    array.forEach((element) => {
        result.push(BigInt(element));
    });
    return result;
};

export const strToBigInt = (s: string) => {
    const str = BigInt('0x' + Buffer.from(s).toString('hex'));
    return str;
};
