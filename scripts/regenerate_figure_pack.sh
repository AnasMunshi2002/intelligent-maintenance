#!/usr/bin/env bash
# Gate: validate every case-study URL before regenerating figures/screenshots.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
echo "==> Validating case-study URLs..."
if ! python3 "$HERE/check_case_study_links.py"; then
  echo "✗ Link check failed. Aborting figure pack regeneration." >&2
  echo "  See /mnt/documents/link_check_report.json for details." >&2
  exit 1
fi
echo "==> Link check passed. Regenerating figure pack..."
python3 /tmp/figpack.py
