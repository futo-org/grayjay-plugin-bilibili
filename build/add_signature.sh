#!/bin/sh
public_key=$(head -1 "$1")
sed -i -e 's|"scriptPublicKey": "",|'"$public_key"'|' ./BiliBiliConfig.json

signature=$(sed -n '2p' "$1")
sed -i -e 's|"scriptSignature": "",|'"$signature"'|' ./BiliBiliConfig.json