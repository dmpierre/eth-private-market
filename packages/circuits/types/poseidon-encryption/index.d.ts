declare module "poseidon-encryption" {
     
     export function encrypt (msg: any, key: any, nonce: any): any[];
     export function decrypt (ciphertext: any, key: any, nonce: any, length: any): any[];
     //# sourceMappingURL=poseidonCipher.d.ts.map

     export const poseidon: typeof import("./src/poseidon");
     export const poseidonPerm: typeof import("./src/poseidonPerm");
     export { encrypt as poseidonEncrypt, decrypt as poseidonDecrypt };
     //# sourceMappingURL=index.d.ts.map

}