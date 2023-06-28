# FROM https://github.com/nalinbhardwaj/isokratia/blob/main/isokratia-aggregator/python/script.py
# Slightly modified file loading and output
from ast import arg
from py_ecc.fields import (
    bn128_FQ as FQ,
    bn128_FQ2 as FQ2,
)
from field_helper import (
    numberToArray,
    Fp12convert,
)

from py_ecc.fields import (
    bn128_FQ as FQ,
    bn128_FQ2 as FQ2,
)
from py_ecc.bn128 import (
    bn128_pairing as pairing
)
import json
import sys

# get cli arg
if len(sys.argv) != 5:
    print("Usage: python3 script.py proof_file public_inputs_file vkey_file output_file")
    exit(1)

input_filename = sys.argv[1]
public_inputs_filename = sys.argv[2]
vkey_filename = sys.argv[3]
outfile = sys.argv[4]

with open(input_filename, 'r') as input_file:
    input_data = input_file.read()

proof = json.loads(input_data)

with open(public_inputs_filename, 'r') as fin:
    public_inputs_data = json.load(fin)

with open(vkey_filename, 'r') as vkey_file:
    vkey_data = vkey_file.read()

vkey = json.loads(vkey_data)

x, y, z = tuple([FQ((int(x))) for x in vkey["vk_alpha_1"]]) 
negalpha = ( x / z, -(y / z) )

x, y, z = tuple([ FQ2([int(x[0]), int(x[1])]) for x in vkey["vk_beta_2"]])
beta = ( x / z, y / z )

x, y, z = tuple([ FQ2([int(x[0]), int(x[1])]) for x in vkey["vk_gamma_2"]])
gamma = ( x / z, y / z )

x, y, z = tuple([ FQ2([int(x[0]), int(x[1])]) for x in vkey["vk_delta_2"]])
delta = ( x / z, y / z )

public_input_count = vkey["nPublic"]

ICs = []
for i in range(public_input_count + 1):
    x, y, z = tuple([ FQ(int(x)) for x in vkey["IC"][i]])
    ICs.append( ( x / z, y / z ) )

negalphabeta = pairing.pairing( beta, negalpha )

def Fpconvert(X, n, k):
    return numberToArray(X.n, n, k)

def Fp2convert(X, n, k):
    return [ numberToArray(X.coeffs[0].n, n, k) , numberToArray(X.coeffs[1].n, n, k) ]

def Fp12convert(X, n, k):
    basis1 = X.coeffs
    ret = []
    for i in range(6):
        fq2elt = FQ2([basis1[i].n, 0]) + FQ2([basis1[i+6].n, 0]) * FQ2([9,1])
        value = Fp2convert(fq2elt, n, k)
        ret.append(value)
    return ret

n = 43
k = 6


inputParameters = {
    "gamma2": [ Fp2convert(gamma[0], n, k), Fp2convert(gamma[1], n, k)],
    "delta2": [ Fp2convert(delta[0], n, k), Fp2convert(delta[1], n, k)],
    "negalfa1xbeta2": Fp12convert(negalphabeta, n, k),
    "IC": [[Fpconvert(IC[0], n, k), Fpconvert(IC[1], n, k)] for IC in ICs],
}



x, y, z = tuple([FQ((int(x))) for x in proof["pi_a"]]) 
negpi_a = (x / z, - (y / z))
x, y, z = tuple([ FQ2([int(x[0]), int(x[1])]) for x in proof["pi_b"]])
pi_b = (x / z, y / z)


x, y, z = tuple([FQ((int(x))) for x in proof["pi_c"]]) 
pi_c = (x / z, y / z)
print("pi_b", pi_c)

proofParameters = {
    "negpa": [Fpconvert(negpi_a[0], n, k), Fpconvert(negpi_a[1], n, k)],
    "pb": [ Fp2convert(pi_b[0], n, k), Fp2convert(pi_b[1], n, k)],
    "pc": [Fpconvert(pi_c[0], n, k), Fpconvert(pi_c[1], n, k)],
}

fullCircomInput = {**inputParameters, **proofParameters, "pubInput": public_inputs_data}

filename = input_filename.split('.')[0]

with open(outfile, 'w') as outfile:
    json.dump(fullCircomInput, outfile)