## `private-market-utils`

Contains utilities to work with `private-market`.

### Selling a groth16 proof

#### Listing an ask for a groth16 proof

1. Make sure that you are running the script in a python env where you have all the packages listed in `requirements.txt` installed.
2. Make sure that you have the following available:
    - a path to an already generated example proof
    - a path to an already generated example public signals
    - a path to the verification key 
2. Run the following to obtain the hash of the verification key:
```bash
$ yarn ts-node scripts/getVkeyHash.ts ../relative/path/to/proof.json ../relative/path/to/publicSignals.json relative/path/to/vkey.json
```
3. Get the merkle root of the group you wish to sell an access to.
4. List your ask on the marketplace. **Keep the downloaded file!** It contains everything that's needed to fill orders later on.

#### Preparing for filling a groth16 proof order

1. If an order has been passed, download it. the order for the marketplace
2. Make sure you have the following available:
    - path to your initial ask file - named as `askSigMerkleGroth16Proof-user-1234567890.json`.
    - path to the order for which you will generate a proof - file named as `orderId-i-askId-j.json`. 
    - path to a private key whose corresponding public key is in the tree of addresses. This file should consist of a single line with the private key in hex format, not prefixed with `0x`.
    - path to the merkle tree of addresses. This file is a simple json file with the following format:
    ```json
    [
    "0xf0d468a8e04e03c65AEe89157DD9fe9933D8b88b",
    "0x4ef2dB1Abe2954103b662369c439a562816953B0",
    "0x52825C460A19d464911F4Aa03a69C4dDf0CA8941",
    "..."
    ]
    ```
    - path to snarkjs generated `wasm`
    - path to snarkjs generated `zkey`
    - path to snarkjs generated `verification_key.json` file 

Those paths are provided relatively to this folder. 

3. Now you are good to go! Run:
```bash
$ yarn run ts-node scripts/sigMerkleProof.ts ./relative/path/ask.json ../relative/path/order.json ./relative/path/privateKey ../relative/path/merkleTree.json ./relative/path/to/wasm ../relative/path/to/zkey ./relative/path/to/vkey.json
```

The proof, public signals and inputs files are available in the `scripts/out/` folder. They are all prefixed with `ask-{askId}-order-{orderId}`.  The inputs file is here if we want to check what went within our proof. Since we will sell this proof, we will now only need the proof and public signals files.

#### Preparing inputs to the recursive proof

You will now prepare the inputs needed for running a recursive proof. 

1. Make sure you have the following available:
    - path to the proof generated previously
    - path to the public signals generated previously
    - path to the verification key used in the previous proof
    - path to the ask file used in the previous proof
    - path to the order file used in the previous proof
    - a filename of your preference for the output file

All paths are provided relatively to this folder.

2. Run:
```bash
$ yarn run ts-node scripts/buildInputGroth16Proof.ts ../relative/path/to/proof.json ../relative/path/to/publicSignals.json ../relative/path/to/vkey.json ../relative/path/to/ask.json ../relative/path/to/order.json ../relative/path/to/output.json
```

The `output.json` file will be what we will input to our circuit for recursive proving.

#### Generating a recursive proof

1. Setup an need access to a machine with generous hardware specs. The following steps have been tested on an AWS `r5.4xlarge` ubuntu machine.
2. After having git cloned the repo, run the `sh/setup.sh` script. 
3. Download and/or upload to your machine the following files:
    - The `zkey` (!19Gb!): `wget "https://drive.google.com/uc?export=download&id=1Ur_gI0Xz37oj4VNrXm9WIS4P5q5zdKKB&export=download&confirm=yes" -O zkey_1.zkey`. If you get the `Too many requests` error download it directly from [here](https://drive.google.com/file/d/1Ur_gI0Xz37oj4VNrXm9WIS4P5q5zdKKB/view?usp=drive_link).
    - The `vkey`: `wget "https://drive.google.com/uc?export=download&id=1oOePWiSqC2PMekJLg1CyFSeoRL9q0bdi" -O vkey.json`
    - The `verifyAndEncryptsigMerkle_cpp` folder (did not find a way to `wget` whole drive folders) : `https://drive.google.com/drive/folders/17DfCvb2AkSdSfd4I6wTEgOJWHvLEw61H?usp=drive_link` 
4. Run `make` within the `verifyAndEncryptsigMerkle_cpp` folder
5. Generate the recursive proof by running: `prove.sh ./relative/path/to/first-proof-prepared-inputs.json ./relative/path/to/cpp/verifyAndEncryptSigMerkleProof ./relative/path/to/verifyAndEncryptSigMerkleProof.vkey`. You should see a bunch of logging. This is relative to generating the witness. Generating the proof can take a bit of time.

That's it! Get the `proof.json` and `public.json` files which were generated during the last step. Get your initial `askSigMerkleGroth16Proof-user-1234567890.json` file. Go to the marketplace and fill the order with each of those files. 