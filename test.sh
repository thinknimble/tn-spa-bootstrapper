function is_mac() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        return 0
    else
        return 1
    fi
}

is_mac
echo $?
function list_packages() {
    grep -v "#" "${OS_REQUIREMENTS_FILENAME}" | grep -v "^$"
}
list_packages
