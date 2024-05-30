base_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

config_file=$base_dir/mobile/$1

defaults_file=$base_dir/resources/$2

cat $config_file
echo $defaults_file

declare -a replace_with
declare -a merged_arr

while IFS= read -r line; do
    replace_with+=("$line")
done < <(grep -o "REPLACE_WITH_[A-Z_]*" "$config_file")

while IFS= read -r line; do
    merged_arr+=("$line")
done < <(grep -o "REPLACE_WITH_[A-Z_]*" "$defaults_file")


for i in "${replace_with[@]}"; do
    # printf $i
    # set the value equal to the value that matches the same name in the defaults file
    value=$(grep -o "$i=.*" "$defaults_file")
    value=${value#*=}
    value=$(printf '%q' "$value")
    # echo $i has value $value
    if [[ -n $value ]]; then
    # replace that name in the file with the value 
        sed -i.bak "s#<$i>#$value#g" "$config_file"
    fi 

done