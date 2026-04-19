# CI/CD integration

## Capability regression check

Assert that a server's capabilities haven't changed from a known baseline:

```yaml
# .github/workflows/fhir-regression.yml
- name: Check FHIR capability regression
  run: |
    npx fhir-capability-analyzer compare \
      ./fixtures/capability-baseline.json \
      ${{ vars.FHIR_SERVER_URL }} \
      --exit-on-diff
```

## Profile conformance assertion

Analyze the server and parse JSON output to assert a specific profile is detected:

```bash
result=$(npx fhir-capability-analyzer analyze $FHIR_SERVER_URL --format json)
echo "$result" | jq -e '.conformance.detectedProfiles[] | select(.standard == "US Core")' > /dev/null
echo "US Core profile detected ✓"
```

## Zero-warning check

Exit code 1 when warnings are found (text/markdown mode):

```yaml
- name: Analyze FHIR server — fail on warnings
  run: npx fhir-capability-analyzer analyze ${{ vars.FHIR_SERVER_URL }}
```

## Capture baseline

Create a baseline CapabilityStatement snapshot:

```bash
npx fhir-capability-analyzer analyze https://server.example.com --format json \
  | jq '.server' > ./fixtures/capability-baseline.json
```

## GitHub Actions example

```yaml
name: FHIR server capability check
on:
  schedule:
    - cron: "0 6 * * 1"   # every Monday morning
  workflow_dispatch:

jobs:
  capability-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Analyze server
        run: |
          npx fhir-capability-analyzer analyze ${{ vars.FHIR_SERVER_URL }} \
            --format json > capability-report.json

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: capability-report
          path: capability-report.json

      - name: Compare against baseline
        run: |
          npx fhir-capability-analyzer compare \
            ./fixtures/baseline.json \
            ${{ vars.FHIR_SERVER_URL }} \
            --exit-on-diff
```
