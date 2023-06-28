#!/bin/bash
PATH_INPUT=$1
PATH_CPP=$2
PATH_ZKEY=$3
PATH_VKEY=$4

start=`date +%s`

echo Generating witness...
${PATH_CPP} ${PATH_INPUT} ./witness.wtns

echo Generating proof..
$RAPIDSNARK_PATH ${PATH_ZKEY} ./witness.wtns ./proof.json ./public.json

echo Verifying proof...
snarkjs groth16 verify ${PATH_VKEY} ./public.json ./proof.json

end=`date +%s`
echo "DONE ($((end-start))s)"