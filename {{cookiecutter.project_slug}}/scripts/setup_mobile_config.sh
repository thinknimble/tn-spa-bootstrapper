#!/bin/bash

# for debugging

# set -e
# set -x 

# base_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

config_file=mobile/$1

defaults_file=resources/$2


declare -a config_vars
declare -a merged_arr

while IFS= read -r line; do
    config_vars+=("$line")
done < <(grep -o "REPLACE_WITH_[A-Z_]*" "$config_file")

while IFS= read -r line; do
    merged_arr+=("$line")
done < <(grep -o "REPLACE_WITH_[A-Z_]*" "$defaults_file")


for i in "${config_vars[@]}"; do
    value=$(grep -o "$i=.*" "$defaults_file")
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