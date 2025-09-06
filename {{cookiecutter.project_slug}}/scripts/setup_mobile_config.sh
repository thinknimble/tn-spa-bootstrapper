#!/bin/bash

# for debugging

# set -e
# set -x

# base_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

config_file=$1

defaults_file=$2


declare -a config_vars
declare -a merged_arr

reset_config_vars() {
    unset config_vars
}
trap reset_config_vars EXIT

while IFS= read -r line; do
    config_vars+=("$line")
done < <(grep -o "REPLACE_WITH_[A-Z_]*" "$config_file")


for i in "${config_vars[@]}"; do
    value=$(grep -o "$i=.*" "$defaults_file") || echo ""
    if [[ -z $value ]]; then
        echo "Skipping $i as it does not exist in $defaults_file"
        continue
    fi

    value=${value#*=}
    value=$(printf '%q' "$value")
    if [[ -n $value ]]; then
        sed -i.bak "s#<$i>#$value#g" "$config_file"
    else
        echo "Skipping $i as it does not exist in $defaults_file"
    fi
done
