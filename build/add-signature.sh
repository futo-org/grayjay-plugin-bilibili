#!/bin/sh
public_key=$(head -1 "$1")
sed -i -e 's|"scriptPublicKey": "",|'"$public_key"'|' "$2"

signature=$(sed -n '2p' "$1")
sed -i -e 's|"scriptSignature": "",|'"$signature"'|' "$2"