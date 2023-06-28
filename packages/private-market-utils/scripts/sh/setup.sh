#!/bin/bash
cd $HOME

# Install required libs
sudo apt update 
sudo apt -y install unzip build-essential libgmp-dev libsodium-dev nasm nlohmann-json3-dev

# Install nvm + yarn
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

cd $HOME

nvm install 18.16.0 && nvm use 18.16.0
nvm install --lts
npm install --location=global yarn

# Install snarkjs
npm install -g snarkjs

# Install rapid snark
cd $HOME
git clone git@github.com:iden3/rapidsnark.git
cd rapidsnark
npm install
git submodule init
git submodule update
npx task createFieldSources
npx task buildProver

export RAPIDSNARK_PATH="$HOME/rapidsnark/build/prover"