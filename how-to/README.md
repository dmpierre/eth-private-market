# How to

We detail here how to use Private Market and provide all necessary data for you to try it out.

### Bid for an ETH address

[Here](https://www.loom.com/share/c8577868bd4542fc852325545c23c815?sid=e0293293-989e-48ea-baae-68726cf2c4f4) is a video showing the whole bid flow, between two different wallets.

1. To place a bid on an ETH address - *Wallet A* -:
    - Navigate to the “List” tab. 
    - Enter the address for which you would like to know the private key of and a corresponding bid amount. 
    - Click on Bid. 
    - **Keep the downloaded file. You will need it later for decryption.**
2. You can fill a bid for the private key of an address by navigating to the “Bids” tab - *Wallet B* -. A bid can be filled by any other address, including the original bidder. To do so:
    - Copy-paste the private key of the address
    - Click "Prove" to generate a proof. This can take a few minutes. Finally, confirm the transaction.
3. When your bid is filled, to get your private key - *Wallet A* -:
    - Navigate to the “Activity” tab
    - Click on “manage” for your bid of interest (whose status is on "closed")
    - Click on “download”. This is the encrypted fill data.
    - Navigate to the “Decrypt“ tab, upload your initially downloaded bid file (at step 1.) and the encrypted fill data. You should now be able to download your private key.

### Ask for an ETH address

[Here](https://www.loom.com/share/3c2aeb70923340228db3685cd8a807b4?sid=220a4c00-c210-481b-9529-9ddde592cf7a) is a video showing the whole ask flow, between two different wallets.

1. To place an ask on an ETH address - *Wallet A* -: 
    - Navigate to the "List" tab. 
    - Select "ask", enter an address and a corresponding amount. 
    - **Keep the dowloaded file, you will need it later to fill orders.**
2. You can order the private key of an address by navigating to the "Asks" tab - *Wallet B* -. An ask can be filled by any other address, including the original asker. To do so:
    - Click on “manage” for the ask of interest
    - Click “Order”. 
     - **Keep the downloaded file. You will need it later for decryption.**
3. You can check whether orders have been passed for your ask by navigating to the "Activity" tab - *Wallet A* -. To accept it:
    - Click on the “manage” of your ask. All the orders for it are displayed below.
    - Click on "manage" for the order of interest. 
    - When ready, click on “Accept". Upload the initial ask file (at step 1.) and copy-paste the address’ private key. Generate a proof by clicking “Prove”. This quite take a few minutes. Finally, confirm the transaction.
4. When your order is filled, to get your private key - *Wallet B* -: 
    - Navigate to the "Activity" tab. 
    - Click on "manage" for your order of interest (whose status is on "closed").
    - Click on "download". This is the encrypted filled order data.
    - Navigate to the "Decrypt" tab, upload your initially downloaded order file (at step 2.) and the encrypted filled order data. You should now be able to download your private key.

### Ask for an EdDSA Signature

Note that you cannot bid for EdDSA signatures in the app. 

[Here](https://www.loom.com/share/89f2d86485fa4357bfc83651a86bf4f1?sid=f9f17525-e976-4a61-989a-fab5a4958111) is a video showing the whole ask flow, between two different wallets.

1. To place an ask on an EdDSA Signature - *Wallet A* -: 
    - Navigate to the "List" tab. 
    - Select "ask", enter the public key that will sign messages and a corresponding amount. 
    - **Keep the dowloaded file, you will need it later to fill orders.**
2. You can order a signature from a particular public key by navigating to the "Asks" tab - *Wallet B* -. An ask can be filled by any other address, including the original asker. To do so:
    - Click on “manage” for the ask of interest
    - Click “Order”. 
     - **Keep the downloaded file. You will need it later for decryption.**
3. You can check whether orders have been passed for your ask by navigating to the "Activity" tab - *Wallet A* -. To accept it:
    - Click on the “manage” of your ask. All the orders for it are displayed below.
    - Click on "manage" for the order of interest. 
    - When ready, click on “Accept". Upload the initial ask file (at step 1.) and copy-paste the private key that will be used to generate the signature. Generate a proof by clicking “Prove”. This should be quicker than for ethereum addresses, since EdDSA is a SNARK-friendly signature scheme. Finally, confirm the transaction.
4. When your order is filled, to get your signature - *Wallet B* -: 
    - Navigate to the "Activity" tab. 
    - Click on "manage" for your order of interest (whose status is on "closed").
    - Click on "download". This is the encrypted filled order data.
    - Navigate to the "Decrypt" tab, upload your initially downloaded order file (at step 2.) and the encrypted filled order data. You should now be able to download your signature.

### Ask for a groth16 proof

Note that you cannot bid for Groth16 proofs in the app. 

[Here](https://www.loom.com/share/89f2d86485fa4357bfc83651a86bf4f1?sid=f9f17525-e976-4a61-989a-fab5a4958111) is a video showing the whole ask flow, between two different wallets.

1. To place an ask on an EdDSA Signature - *Wallet A* -: 
    - Navigate to the "List" tab. 
    - Select "ask", enter the public key that will sign messages and a corresponding amount. 
    - **Keep the dowloaded file, you will need it later to fill orders.**
2. You can order a signature from a particular public key by navigating to the "Asks" tab - *Wallet B* -. An ask can be filled by any other address, including the original asker. To do so:
    - Click on “manage” for the ask of interest
    - Click “Order”. 
     - **Keep the downloaded file. You will need it later for decryption.**
3. You can check whether orders have been passed for your ask by navigating to the "Activity" tab - *Wallet A* -. To accept it:
    - Click on the “manage” of your ask. All the orders for it are displayed below.
    - Click on "manage" for the order of interest. 
    - When ready, click on “Accept". Upload the initial ask file (at step 1.) and copy-paste the private key that will be used to generate the signature. Generate a proof by clicking “Prove”. This should be quicker than for ethereum addresses, since EdDSA is a SNARK-friendly signature scheme. Finally, confirm the transaction.
4. When your order is filled, to get your signature - *Wallet B* -: 
    - Navigate to the "Activity" tab. 
    - Click on "manage" for your order of interest (whose status is on "closed").
    - Click on "download". This is the encrypted filled order data.
    - Navigate to the "Decrypt" tab, upload your initially downloaded order file (at step 2.) and the encrypted filled order data. You should now be able to download your signature.