import fs from 'fs';
import { decrypt as poseidonDecrypt } from 'maci-crypto';
import { utilsBigint } from '../lib/index';
import { ecdh } from '../lib/src/crypto';

const bn128FieldMod =
    21888242871839275222246405745257275088696311157297823662689037894645226208583n;

const main = () => {
    const pathEncryptedOrder = process.argv[2];
    const pathOrderWithECDH = process.argv[3];
    const orderWithECDH = JSON.parse(
        fs.readFileSync(__dirname + '/' + pathOrderWithECDH).toString()
    );
    let encryptedProof = JSON.parse(
        fs.readFileSync(__dirname + '/' + pathEncryptedOrder).toString()
    ).encryptedData;
    const sharedKString = orderWithECDH.ecdh;
    const nonce = orderWithECDH.nonce;
    encryptedProof = encryptedProof
        .map((x: string) => BigInt(x))
        .slice(0, 49) as bigint[];
    console.log(encryptedProof);
    console.log(nonce);
    console.log(sharedKString);

    const decrypted = poseidonDecrypt(
        encryptedProof,
        [BigInt(sharedKString[0]), BigInt(sharedKString[1])],
        nonce,
        48
    );

    const negpa_0 = decrypted.slice(0, 6) as bigint[];
    const negpa_1 = decrypted.slice(6, 12) as bigint[];
    const pb_0_0 = decrypted.slice(12, 18) as bigint[];
    const pb_0_1 = decrypted.slice(18, 24) as bigint[];
    const pb_1_0 = decrypted.slice(24, 30) as bigint[];
    const pb_1_1 = decrypted.slice(30, 36) as bigint[];
    const pc_0 = decrypted.slice(36, 42) as bigint[];
    const pc_1 = decrypted.slice(42, 48) as bigint[];

    const proof = {
        pi_a: [
            utilsBigint.tuple_to_bigint(negpa_0, 43).toString(),
            (
                bn128FieldMod - utilsBigint.tuple_to_bigint(negpa_1, 43)
            ).toString(),
            '1',
        ],
        pi_b: [
            [
                utilsBigint.tuple_to_bigint(pb_0_0, 43).toString(),
                utilsBigint.tuple_to_bigint(pb_0_1, 43).toString(),
            ],
            [
                utilsBigint.tuple_to_bigint(pb_1_0, 43).toString(),
                utilsBigint.tuple_to_bigint(pb_1_1, 43).toString(),
            ],
            ['1', '0'],
        ],
        pi_c: [
            utilsBigint.tuple_to_bigint(pc_0, 43).toString(),
            utilsBigint.tuple_to_bigint(pc_1, 43).toString(),
            '1',
        ],
        protocol: 'groth16',
        curve: 'bn128',
    };
};

main();
