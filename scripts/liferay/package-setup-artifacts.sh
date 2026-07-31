#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

ARTIFACT_DIR="${NEXCENT_ARTIFACT_DIR:-$ROOT_DIR/build/nexcent-full-setup}"
BUILD_OUTPUT_DIR="$ARTIFACT_DIR/deploy/build-output"
SOURCE_DIR="$ARTIFACT_DIR/source"
MANIFEST_FILE="$ARTIFACT_DIR/inventory/build-output-files.txt"

mkdir -p "$BUILD_OUTPUT_DIR" "$SOURCE_DIR" "$ARTIFACT_DIR/inventory"
: > "$MANIFEST_FILE"

copy_with_path() {
    local source_path=$1
    local destination_path="$BUILD_OUTPUT_DIR/$source_path"

    mkdir -p "$(dirname "$destination_path")"
    cp "$source_path" "$destination_path"
    printf '%s\n' "$source_path" >> "$MANIFEST_FILE"
}

while IFS= read -r -d '' artifact; do
    copy_with_path "$artifact"
done < <(
    find client-extensions modules -type f -path '*/build/*' \
        \( -name '*.zip' -o -name '*.jar' \) -print0 | sort -z
)

sort -u -o "$MANIFEST_FILE" "$MANIFEST_FILE"

if [[ ! -s "$MANIFEST_FILE" ]]; then
    echo 'No client-extension ZIPs or module JARs were found under build outputs.' >&2
    exit 1
fi

cp scripts/liferay/full-setup-q2.sh "$SOURCE_DIR/"
cp scripts/liferay/package-setup-artifacts.sh "$SOURCE_DIR/"
cp gradle.properties "$SOURCE_DIR/"
cp build.gradle "$SOURCE_DIR/"

mkdir -p "$SOURCE_DIR/client-extensions"
find client-extensions -type f -name 'client-extension.yaml' -print0 | \
    while IFS= read -r -d '' descriptor; do
        destination="$SOURCE_DIR/$descriptor"
        mkdir -p "$(dirname "$destination")"
        cp "$descriptor" "$destination"
    done

cat > "$ARTIFACT_DIR/INSTALL.txt" <<'EOF'
Nexcent DXP 2026.Q2.8 deployment package
========================================

The deploy/build-output directory preserves the workspace-relative paths of
all generated client-extension ZIPs and OSGi module JARs. These files are
captured from Gradle build outputs, so the package remains complete even after
Liferay File Install consumes files from bundles/deploy.

Recommended clean setup:

1. Use Java 21 and Node 20.19.0.
2. Add `127.0.0.1 nexcent.com` to the hosts file.
3. Copy `config/portal-ext.properties` into the Liferay home directory.
4. Start Liferay once and wait for the `nexcent.com` company to initialize.
5. Copy the files listed in `inventory/build-output-files.txt` to the Liferay
   deploy directory, or run `source/full-setup-q2.sh` from the repository.

The evidence directory contains the API responses, runtime log, and browser
smoke-test output from the verification run.
EOF

printf 'Packaged %s build artifacts into %s\n' \
    "$(wc -l < "$MANIFEST_FILE" | xargs)" "$BUILD_OUTPUT_DIR"
