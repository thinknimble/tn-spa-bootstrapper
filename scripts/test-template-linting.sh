#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Parse command line arguments
STRICT_MODE=false
AUTO_FIX=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --strict)
            STRICT_MODE=true
            shift
            ;;
        --fix)
            AUTO_FIX=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--strict] [--fix] [--verbose]"
            echo "  --strict: Exit with error code if linting fails (for CI)"
            echo "  --fix: Attempt to auto-fix issues and show what was fixed"
            echo "  --verbose: Show detailed output"
            exit 1
            ;;
    esac
done

cd "$PROJECT_ROOT"

# Read the exact ruff pin from the rendered project instead of using whatever
# ruff is on PATH. Each ruff release changes the default rule set, so a
# different version reports different issues than CI does.
resolve_ruff_spec() {
    local pyproject="$1"
    local spec
    spec=$(grep -oE '"ruff *== *[^"]+"' "$pyproject" | head -1 | tr -d '" ')

    if [ -z "$spec" ]; then
        echo "Error: no exact ruff pin (ruff==X.Y.Z) found in $pyproject" >&2
        exit 1
    fi

    echo "$spec"
}

echo "Testing cookiecutter template linting..."

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

if [ "$VERBOSE" = true ]; then
    echo "Creating temporary rendered project in $TEMP_DIR..."
fi

TEST_CONFIGS=(
    "cookiecutter/react_template.yaml"
)

EXIT_CODE=0
ISSUES_FOUND=false

for config in "${TEST_CONFIGS[@]}"; do
    echo ""
    echo "Testing with config: $config"
    echo "================================="

    if [ -f "$config" ]; then
        if [ "$VERBOSE" = true ]; then
            cookiecutter . --no-input -o "$TEMP_DIR" --config-file "$config"
        else
            cookiecutter . --no-input -o "$TEMP_DIR" --config-file "$config" 2>/dev/null
        fi

        if [ $? -ne 0 ]; then
            echo "Failed to render template with $config"
            EXIT_CODE=1
            continue
        fi
    else
        if [ "$VERBOSE" = true ]; then
            cookiecutter . --no-input -o "$TEMP_DIR"
        else
            cookiecutter . --no-input -o "$TEMP_DIR" 2>/dev/null
        fi

        if [ $? -ne 0 ]; then
            echo "Failed to render template"
            EXIT_CODE=1
            continue
        fi
    fi

    PROJECT_NAME="my_project"
    PROJECT_PATH="$TEMP_DIR/$PROJECT_NAME"

    if [ ! -d "$PROJECT_PATH" ]; then
        echo "Error: Expected project directory $PROJECT_PATH not found"
        EXIT_CODE=1
        continue
    fi

    echo "Running Python linting checks..."
    cd "$PROJECT_PATH"

    if [ -d "server" ]; then
        if command -v uvx &> /dev/null; then
            RUFF_SPEC=$(resolve_ruff_spec "$PROJECT_PATH/pyproject.toml")
            RUFF=(uvx "$RUFF_SPEC")
            echo "Checking server code with $RUFF_SPEC..."

            if [ "$AUTO_FIX" = true ]; then
                # Show what can be fixed
                echo "Attempting auto-fixes..."
                "${RUFF[@]}" check server/ --fix --diff 2>/dev/null || true
            fi

            # Check for linting issues
            if [ "$VERBOSE" = true ]; then
                "${RUFF[@]}" check server/ || RUFF_LINT_EXIT=$?
            else
                "${RUFF[@]}" check server/ --quiet || RUFF_LINT_EXIT=$?
            fi

            # Check for formatting issues
            if [ "$VERBOSE" = true ]; then
                "${RUFF[@]}" format --check server/ || RUFF_FORMAT_EXIT=$?
            else
                "${RUFF[@]}" format --check server/ --quiet || RUFF_FORMAT_EXIT=$?
            fi

            RUFF_EXIT_CODE=$((${RUFF_LINT_EXIT:-0} + ${RUFF_FORMAT_EXIT:-0}))

            if [ "${RUFF_EXIT_CODE:-0}" -ne 0 ]; then
                ISSUES_FOUND=true
                echo "⚠️  Python linting issues found in rendered template"

                # Show the specific file and line with the issue for manual fixing
                echo ""
                echo "Issues that need manual fixing in the template:"
                echo "================================================"

                # Create a fixes file that an AI can easily parse
                FIXES_FILE="$PROJECT_ROOT/template-linting-fixes.json"

                "${RUFF[@]}" check server/ --output-format=json | python3 -c "
import sys, json, os

temp_dir = '$TEMP_DIR'
project_name = '$PROJECT_NAME'
project_root = '$PROJECT_ROOT'

try:
    # Ruff writes a flat list of diagnostics, one entry per issue.
    data = json.load(sys.stdin)
    fixes = []

    # Resolve symlinks on both sides. On macOS the temporary directory is
    # /var/..., but ruff reports the real path /private/var/....
    server_root = os.path.realpath(os.path.join(temp_dir, project_name, 'server'))

    for issue in data:
        # Get the relative path from the rendered project
        rendered_file = issue.get('filename', '')
        relative_file = os.path.relpath(os.path.realpath(rendered_file), server_root)

        # Map to the template file path
        template_file = f'{{{{cookiecutter.project_slug}}}}/server/{relative_file.replace(project_name, \"{{cookiecutter.project_slug}}\")}'
        template_path = os.path.join(project_root, template_file)

        line = issue.get('location', {}).get('row', 0)
        col = issue.get('location', {}).get('column', 0)
        end_line = issue.get('end_location', {}).get('row', line)
        end_col = issue.get('end_location', {}).get('column', col)
        code = issue.get('code', '')
        msg = issue.get('message', '')
        fixable = issue.get('fix', None) is not None

        # Read the actual line content from the rendered file
        try:
            with open(rendered_file, 'r') as f:
                lines = f.readlines()
                if line > 0 and line <= len(lines):
                    line_content = lines[line - 1].rstrip()
                else:
                    line_content = ''
        except OSError:
            line_content = ''

        fix_info = {
            'template_file': template_file,
            'template_path': template_path,
            'rendered_file': relative_file,
            'line': line,
            'column': col,
            'end_line': end_line,
            'end_column': end_col,
            'code': code,
            'message': msg,
            'fixable': fixable,
            'line_content': line_content
        }

        fixes.append(fix_info)

        # Print human-readable output
        print(f'  File: {template_file}')
        print(f'  Line {line}: {msg} [{code}]')
        if line_content:
            print(f'  Content: {line_content}')
        print()

    # Save fixes to JSON file for AI processing
    with open('$FIXES_FILE', 'w') as f:
        json.dump({'fixes': fixes, 'total': len(fixes)}, f, indent=2)

    if fixes:
        print(f'AI-Parseable fixes saved to: template-linting-fixes.json')
        print(f'Total issues to fix: {len(fixes)}')
except Exception as e:
    print(f'Error processing linting results: {e}', file=sys.stderr)
"

                if [ "$STRICT_MODE" = true ]; then
                    EXIT_CODE=1
                fi
            else
                echo "✅ Python linting passed"
            fi
        else
            echo "Error: uv is not installed, thus ruff cannot run. See https://docs.astral.sh/uv/getting-started/installation/" >&2
            exit 1
        fi
    fi

    if [ -d "clients/web/react" ]; then
        echo "Checking React client dependencies..."
        cd clients/web/react
        npm install --silent || {
            echo "Warning: npm install failed for React client"
        }

        if [ -f "package.json" ] && grep -q '"lint"' package.json; then
            echo "Running React client linting..."
            npm run lint || {
                echo "React client linting failed"
                EXIT_CODE=1
            }
        fi

        if [ -f "package.json" ] && grep -q '"typecheck"' package.json; then
            echo "Running React client type checking..."
            npm run typecheck || {
                echo "React client type checking failed"
                EXIT_CODE=1
            }
        fi
        cd "$PROJECT_PATH"
    fi

    if [ -d "clients/mobile/react-native" ] && [ "$config" != "cookiecutter/react_template.yaml" ]; then
        echo "Checking React Native client dependencies..."
        cd clients/mobile/react-native
        npm install --silent || {
            echo "Warning: npm install failed for React Native client"
        }

        if [ -f "package.json" ] && grep -q '"lint"' package.json; then
            echo "Running React Native client linting..."
            npm run lint || {
                echo "React Native client linting failed"
                EXIT_CODE=1
            }
        fi

        if [ -f "package.json" ] && grep -q '"typecheck"' package.json; then
            echo "Running React Native client type checking..."
            npm run typecheck || {
                echo "React Native client type checking failed"
                EXIT_CODE=1
            }
        fi
        cd "$PROJECT_PATH"
    fi

    rm -rf "$PROJECT_PATH"
done

echo ""
echo "========================================="
if [ "$ISSUES_FOUND" = true ]; then
    echo "⚠️  LINTING ISSUES DETECTED"
    echo ""
    echo "The rendered cookiecutter template has linting issues."
    echo "These issues can't be auto-fixed in the template files because"
    echo "the cookiecutter syntax ({{ }}) interferes with linters."
    echo ""

    if [ -f "$PROJECT_ROOT/template-linting-fixes.json" ]; then
        echo "📋 Fix instructions saved to: template-linting-fixes.json"
        echo ""
        echo "To fix these issues:"
        echo "1. An AI agent can read template-linting-fixes.json and apply fixes"
        echo "2. Or manually update the template files based on the output above"
        echo "3. Re-run this script to verify the fixes"
    else
        echo "To fix these issues:"
        echo "1. Note the file paths and line numbers above"
        echo "2. Manually update the template files in {{cookiecutter.project_slug}}/"
        echo "3. Re-run this script to verify the fixes"
    fi

    echo ""
    if [ "$STRICT_MODE" = true ]; then
        echo "❌ Exiting with error (strict mode enabled)"
        exit $EXIT_CODE
    else
        echo "ℹ️  Continuing despite issues (use --strict for CI)"
        exit 0
    fi
elif [ $EXIT_CODE -ne 0 ]; then
    echo "❌ Template rendering or other errors occurred"
    exit $EXIT_CODE
else
    echo "✅ All linting checks passed!"
    echo "The rendered cookiecutter template is clean."
    exit 0
fi
