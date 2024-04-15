#!/bin/sh
# From:
# https://gitlab.futo.org/videostreaming/grayjay/-/blob/master/docs/Script%20Signing.md
# Example usage:
# cat script.js | sign-script.sh
# sh sign-script.sh script.js
# PRIVATE_KEY_PASSPHRASE="<passphrase>" bash sign-script.sh BiliBiliScript.js
#
# Generate a keys:
# ssh-keygen -m PEM -t rsa -b 2048 -C "Grayjay Plugin Signing"

#Set your key paths here
PRIVATE_KEY_PATH=~/.ssh/id_rsa
PUBLIC_KEY_PATH=~/.ssh/id_rsa.pub

[[ $PRIVATE_KEY_PASSPHRASE ]] && passphrase_subcommand="-passin pass:$PRIVATE_KEY_PASSPHRASE" || passphrase_subcommand=""

PUBLIC_KEY_PKCS8=$(ssh-keygen -f "$PUBLIC_KEY_PATH" -e -m pkcs8 | tail -n +2 | head -n -1 | tr -d '\n')
echo "This is your public key: '$PUBLIC_KEY_PKCS8'"

if [ $# -eq 0 ]; then
  # No parameter provided, read from stdin
  DATA=$(cat)
else
  # Parameter provided, read from file
  DATA=$(cat "$1")
fi

SIGNATURE=$(echo -n "$DATA" | openssl dgst -sha512 -sign "$PRIVATE_KEY_PATH" $passphrase_subcommand | base64 -w 0)
echo "This is your signature: '$SIGNATURE'"
