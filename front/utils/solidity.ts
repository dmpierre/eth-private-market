export function p256(n: bigint) {
    let nstr = n.toString(16);
    while (nstr.length < 64) nstr = '0' + nstr;
    nstr = `0x${nstr}`;
    return nstr;
}
