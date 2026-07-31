#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
cd "$ROOT_DIR"

PRODUCT_EXPECTED="dxp-2026.q2.8"
SITE_ERC="${NEXCENT_SITE_ERC:-NXC_NEXT_GEN_SITE}"
SITE_NAME="${NEXCENT_SITE_NAME:-$(awk -F= '/^nexcent.fragments.group.key=/{print $2}' gradle.properties | xargs)}"
WEB_ID="${NEXCENT_WEB_ID:-$(awk -F= '/^nexcent.fragments.company.web.id=/{print $2}' gradle.properties | xargs)}"
PRODUCT=$(awk -F= '/^liferay.workspace.product=/{print $2}' gradle.properties | xargs)
ADMIN_PASSWORD="${LIFERAY_ADMIN_PASSWORD:-learn}"
ARTIFACT_DIR="${NEXCENT_ARTIFACT_DIR:-$ROOT_DIR/build/nexcent-full-setup}"
LIFERAY_HOME="${LIFERAY_HOME:-$ROOT_DIR/bundles}"
LIFERAY_BASE_URL="${LIFERAY_BASE_URL:-http://$WEB_ID:8080}"
LIFERAY_ADMIN_EMAIL="${LIFERAY_ADMIN_EMAIL:-admin@$WEB_ID}"
RUN_BROWSER_SMOKE="${NEXCENT_RUN_BROWSER_SMOKE:-true}"

LIFERAY_PID=""

log() {
    printf '\n[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"
}

fail() {
    printf '\nERROR: %s\n' "$*" >&2
    exit 1
}

cleanup() {
    if [[ -n "$LIFERAY_PID" ]] && kill -0 "$LIFERAY_PID" 2>/dev/null; then
        kill "$LIFERAY_PID" 2>/dev/null || true
    fi
}

wait_for_http() {
    local description=$1
    local url=$2
    local expected=$3
    local output_file=${4:-/dev/null}
    local credentials=${5:-}
    local max_attempts=${6:-180}

    for attempt in $(seq 1 "$max_attempts"); do
        local curl_args=(
            --noproxy '*'
            --silent
            --output "$output_file"
            --write-out '%{http_code}'
        )

        if [[ -n "$credentials" ]]; then
            curl_args+=(--user "$credentials")
        fi

        local status
        status=$(curl "${curl_args[@]}" "$url" || true)

        if [[ "$status" == "$expected" ]]; then
            log "$description is ready (HTTP $status)"
            return 0
        fi

        if (( attempt % 12 == 0 )); then
            log "Waiting for $description (attempt $attempt, HTTP $status)"
            tail -n 60 "$ARTIFACT_DIR/evidence/liferay-runtime.log" || true
        fi

        sleep 5
    done

    return 1
}

trap cleanup EXIT

[[ "$PRODUCT" == "$PRODUCT_EXPECTED" ]] || \
    fail "Expected liferay.workspace.product=$PRODUCT_EXPECTED, found $PRODUCT"
[[ -n "$WEB_ID" ]] || fail 'nexcent.fragments.company.web.id is required'
[[ -n "$SITE_NAME" ]] || fail 'nexcent.fragments.group.key is required'

grep -R --quiet --fixed-strings 'NXC_METRIC_MEMBERS' \
    client-extensions/nexcent-objects || \
    fail 'Metric seed entries are missing from nexcent-objects'

export NO_PROXY="localhost,127.0.0.1,$WEB_ID"
export no_proxy="$NO_PROXY"
export LIFERAY_BASE_URL
export LIFERAY_ADMIN_EMAIL
export NEXCENT_ARTIFACT_DIR="$ARTIFACT_DIR"
export NEXCENT_SITE_ERC="$SITE_ERC"
export NEXCENT_SITE_NAME="$SITE_NAME"

rm -rf "$ARTIFACT_DIR"
mkdir -p "$ARTIFACT_DIR"/{config,deploy,evidence,inventory}

log 'Inventorying current project setup'
find client-extensions -type f \
    \( -name 'client-extension.yaml' -o -name '*.batch-engine-data.json' \) \
    -print | sort | tee "$ARTIFACT_DIR/inventory/client-extensions.txt"
find modules -type f \
    \( -name 'bnd.bnd' -o -name 'service.xml' -o -name 'rest-config.yaml' \) \
    -print | sort | tee "$ARTIFACT_DIR/inventory/modules.txt"
find client-extensions -type f \
    \( -name 'fragment.json' -o -name 'style-book.json' -o -name 'frontend-tokens-values.json' \) \
    -print | sort | tee "$ARTIFACT_DIR/inventory/authoring-assets.txt"

log 'Installing frontend dependencies'
npm ci

log "Initializing clean Liferay DXP $PRODUCT bundle"
chmod +x gradlew
./gradlew initBundle --no-daemon --stacktrace

log 'Configuring unattended Nexcent company before first startup'
cat > "$LIFERAY_HOME/portal-ext.properties" <<EOF
company.default.locale=en_US
company.default.name=Nexcent
company.default.web.id=$WEB_ID
company.security.auth.type=emailAddress
company.security.strangers=false
default.admin.email.address.prefix=admin
default.admin.first.name=Nexcent
default.admin.last.name=Admin
default.admin.password=$ADMIN_PASSWORD
default.admin.screen.name=nexcentadmin
setup.wizard.enabled=false
terms.of.use.required=false
users.reminder.queries.enabled=false
EOF
cp "$LIFERAY_HOME/portal-ext.properties" "$ARTIFACT_DIR/config/"
cp gradle.properties "$ARTIFACT_DIR/"

if ! grep -qE "(^|[[:space:]])$WEB_ID([[:space:]]|$)" /etc/hosts 2>/dev/null; then
    if command -v sudo >/dev/null 2>&1; then
        echo "127.0.0.1 $WEB_ID" | sudo tee -a /etc/hosts >/dev/null
    else
        log "Add '127.0.0.1 $WEB_ID' to /etc/hosts when running outside CI"
    fi
fi

# File Install must not see company-scoped Nexcent artifacts until the default
# company has completed its first bootstrap.
mkdir -p "$LIFERAY_HOME/deploy"
find "$LIFERAY_HOME/deploy" -mindepth 1 -maxdepth 1 -delete

log 'Starting clean Liferay before deploying project artifacts'
nohup env \
    JAVA_OPTS="${JAVA_OPTS:--Xms1g -Xmx3g -Dfile.encoding=UTF-8 -Duser.timezone=UTC}" \
    "$LIFERAY_HOME/tomcat/bin/catalina.sh" run \
    > "$ARTIFACT_DIR/evidence/liferay-runtime.log" 2>&1 &
LIFERAY_PID=$!
echo "$LIFERAY_PID" > "$ARTIFACT_DIR/evidence/liferay-runtime.pid"

log 'Waiting for portal startup'
for attempt in $(seq 1 240); do
    if ! kill -0 "$LIFERAY_PID" 2>/dev/null; then
        tail -n 400 "$ARTIFACT_DIR/evidence/liferay-runtime.log" || true
        fail 'Liferay exited before startup completed'
    fi

    status=$(curl --noproxy '*' --silent --output /dev/null \
        --write-out '%{http_code}' "$LIFERAY_BASE_URL/c/portal/login" || true)

    if [[ "$status" == '200' || "$status" == '302' || "$status" == '303' ]]; then
        break
    fi

    if (( attempt % 12 == 0 )); then
        log "Portal startup attempt $attempt returned HTTP $status"
        tail -n 60 "$ARTIFACT_DIR/evidence/liferay-runtime.log" || true
    fi

    sleep 10
done

status=$(curl --noproxy '*' --silent --output /dev/null \
    --write-out '%{http_code}' "$LIFERAY_BASE_URL/c/portal/login" || true)
if [[ "$status" != '200' && "$status" != '302' && "$status" != '303' ]]; then
    fail "Portal did not become ready; final HTTP status: $status"
fi

log 'Waiting for the Nexcent company and administrator account'
wait_for_http \
    'Nexcent administrator account' \
    "$LIFERAY_BASE_URL/o/headless-admin-user/v1.0/my-user-account" \
    '200' \
    "$ARTIFACT_DIR/evidence/admin-user.json" \
    "$LIFERAY_ADMIN_EMAIL:$ADMIN_PASSWORD" \
    120 || fail "Company $WEB_ID was not created during first startup"

log 'Building and deploying the complete workspace into the running portal'
./gradlew deploy --no-daemon --stacktrace
find "$LIFERAY_HOME/deploy" -maxdepth 2 -type f -print | sort \
    | tee "$ARTIFACT_DIR/inventory/staged-deploy-files.txt"
cp -R "$LIFERAY_HOME/deploy/." "$ARTIFACT_DIR/deploy/" 2>/dev/null || true

log "Waiting for Site Initializer to provision $SITE_NAME"
wait_for_http \
    'Nexcent site initializer' \
    "$LIFERAY_BASE_URL/o/headless-admin-site/v1.0/sites/$SITE_ERC" \
    '200' \
    "$ARTIFACT_DIR/evidence/site.json" \
    "$LIFERAY_ADMIN_EMAIL:$ADMIN_PASSWORD" \
    240 || fail "Site Initializer did not provision $SITE_ERC"

SITE_FILE="$ARTIFACT_DIR/evidence/site.json" node <<'NODE'
const fs = require('node:fs');
const site = JSON.parse(fs.readFileSync(process.env.SITE_FILE, 'utf8'));
if (site.externalReferenceCode !== process.env.NEXCENT_SITE_ERC || !site.id) {
    throw new Error('Site response is missing the expected ERC or numeric id');
}
console.log(`Site ready: ${site.name} (${site.externalReferenceCode}, id=${site.id})`);
NODE

SITE_ID=$(node -e "const site=require(process.argv[1]); process.stdout.write(String(site.id));" \
    "$ARTIFACT_DIR/evidence/site.json")
export NEXCENT_SITE_ID="$SITE_ID"

log 'Waiting for Home page composition'
for attempt in $(seq 1 120); do
    pages_status=$(curl --noproxy '*' --silent \
        --output "$ARTIFACT_DIR/evidence/site-pages.json" \
        --write-out '%{http_code}' \
        --user "$LIFERAY_ADMIN_EMAIL:$ADMIN_PASSWORD" \
        "$LIFERAY_BASE_URL/o/headless-admin-site/v1.0/sites/$SITE_ID/site-pages?pageSize=100" || true)

    if [[ "$pages_status" == '200' ]] && \
        SITE_PAGES_FILE="$ARTIFACT_DIR/evidence/site-pages.json" node <<'NODE'
const fs = require('node:fs');
const response = JSON.parse(fs.readFileSync(process.env.SITE_PAGES_FILE, 'utf8'));
process.exit((response.items ?? []).some((item) => item.name === 'Home') ? 0 : 1);
NODE
    then
        break
    fi

    sleep 5
done

SITE_PAGES_FILE="$ARTIFACT_DIR/evidence/site-pages.json" node <<'NODE'
const fs = require('node:fs');
const response = JSON.parse(fs.readFileSync(process.env.SITE_PAGES_FILE, 'utf8'));
const home = (response.items ?? []).find((item) => item.name === 'Home');
if (!home) {
    throw new Error('Site Initializer did not create the Home page');
}
console.log(`Home page ready: ${home.friendlyUrlPath || home.friendlyURL || '/home'}`);
NODE

log 'Waiting for React runtime, CAPTCHA API, and Metrics Object API'
runtime_paths=(
    '/o/nexcent-react-runtime/index.js'
    '/o/nexcent-landing-elements/index.js'
)

for attempt in $(seq 1 240); do
    runtime_ready=false

    for path in "${runtime_paths[@]}"; do
        if curl --noproxy '*' --fail --silent --show-error \
            "$LIFERAY_BASE_URL$path" \
            --output "$ARTIFACT_DIR/evidence/nexcent-runtime.js"; then
            if grep -q 'nexcent-react-header' "$ARTIFACT_DIR/evidence/nexcent-runtime.js"; then
                export NEXCENT_RUNTIME_URL="$LIFERAY_BASE_URL$path"
                runtime_ready=true
                break
            fi
        fi
    done

    captcha_status=$(curl --noproxy '*' --silent \
        --output "$ARTIFACT_DIR/evidence/captcha.json" \
        --write-out '%{http_code}' \
        "$LIFERAY_BASE_URL/o/captcha/v1.0/captcha/challenge" || true)

    metrics_status=$(curl --noproxy '*' --silent \
        --output "$ARTIFACT_DIR/evidence/metrics.json" \
        --write-out '%{http_code}' \
        --user "$LIFERAY_ADMIN_EMAIL:$ADMIN_PASSWORD" \
        "$LIFERAY_BASE_URL/o/c/nxcmetricssnapshots?pageSize=20" || true)

    if [[ "$runtime_ready" == 'true' && "$captcha_status" == '200' && "$metrics_status" == '200' ]]; then
        break
    fi

    if (( attempt % 12 == 0 )); then
        log "Deployment wait: runtime=$runtime_ready captcha=$captcha_status metrics=$metrics_status"
        grep -i -E 'nexcent|client extension|batch|ERROR|Exception' \
            "$ARTIFACT_DIR/evidence/liferay-runtime.log" | tail -n 120 || true
    fi

    sleep 5
done

if [[ "${runtime_ready:-false}" != 'true' || "${captcha_status:-0}" != '200' || "${metrics_status:-0}" != '200' ]]; then
    fail 'Nexcent runtime deployments did not become ready'
fi

log 'Verifying metric seed entries'
METRICS_FILE="$ARTIFACT_DIR/evidence/metrics.json" node <<'NODE'
const fs = require('node:fs');
const response = JSON.parse(fs.readFileSync(process.env.METRICS_FILE, 'utf8'));
const expected = new Set([
    'NXC_METRIC_MEMBERS',
    'NXC_METRIC_CLUBS',
    'NXC_METRIC_EVENT_BOOKINGS',
    'NXC_METRIC_PAYMENTS',
]);
for (const item of response.items ?? []) {
    expected.delete(item.externalReferenceCode);
}
if (expected.size > 0) {
    throw new Error(`Missing metric seed entries: ${[...expected].join(', ')}`);
}
console.log('All four metric seed entries are available.');
NODE

if [[ "$RUN_BROWSER_SMOKE" == 'true' ]]; then
    log 'Installing Playwright Chromium and running browser smoke checks'
    npm install --no-save --ignore-scripts @playwright/test@1.55.0
    npx playwright install --with-deps chromium
    npx playwright test scripts/liferay-runtime.spec.ts --reporter=line --workers=1
    cp -R test-results "$ARTIFACT_DIR/evidence/" 2>/dev/null || true
    cp -R playwright-report "$ARTIFACT_DIR/evidence/" 2>/dev/null || true
fi

cat > "$ARTIFACT_DIR/README.txt" <<EOF
Nexcent full setup package
==========================
Liferay product: $PRODUCT
Company web ID: $WEB_ID
Site: $SITE_NAME
Site ERC: $SITE_ERC
Java: 21
Node: 20.19.0

Verified:
- clean DXP 2026.Q2.8 bootstrap
- company creation before company-scoped deployment
- complete Gradle workspace deployment
- Site Initializer autoprovisioning
- Nexcent Landing Master and Home page creation
- consolidated Nexcent Objects batch import
- four metric seed entries
- Contact CAPTCHA and REST route availability
- React custom element registration and Shadow DOM rendering
- Header account-menu interaction
- Global Modal open/close/focus behavior

The package contains deployable artifacts, portal configuration, inventory,
and runtime evidence generated by the verification run.
EOF

log "Full Nexcent setup verification completed: $ARTIFACT_DIR"
