#!/usr/bin/env python3
"""Validate case-study URLs before regenerating figure pack/screenshots.

Extracts URLs from src/components/CaseStudiesSection.tsx and checks each one
with HEAD (falling back to GET) using a browser-like User-Agent. Detects:
  - non-2xx status codes
  - redirects to generic landing pages (heuristic: path collapses to '/' or
    a known index path while original had a deep path)

Exit code 0 = all OK. Exit code 1 = at least one URL failed; figure pack
regeneration should be aborted.
"""
import re, sys, json, urllib.request, urllib.error
from urllib.parse import urlparse

SRC = "/dev-server/src/components/CaseStudiesSection.tsx"
UA  = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

def extract_cases(path):
    txt = open(path).read()
    # crude but reliable: pair name + url within each object literal
    blocks = re.findall(r"\{([^{}]*?url:\s*\"[^\"]+\"[^{}]*?)\}", txt, re.S)
    out = []
    for b in blocks:
        name = re.search(r'name:\s*"([^"]+)"', b)
        url  = re.search(r'url:\s*"([^"]+)"',  b)
        if name and url:
            out.append((name.group(1), url.group(1)))
    return out

def fetch(url, method="HEAD"):
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA})
    return urllib.request.urlopen(req, timeout=15)

def check(name, url):
    orig_path = urlparse(url).path.rstrip("/")
    try:
        try:
            r = fetch(url, "HEAD")
        except (urllib.error.HTTPError, urllib.error.URLError):
            r = fetch(url, "GET")
        final = r.geturl()
        status = r.status
        final_path = urlparse(final).path.rstrip("/")
        redirected = final != url
        # heuristic: deep link collapsed to root/index
        collapsed = redirected and orig_path.count("/") >= 2 and final_path.count("/") <= 1
        ok = (200 <= status < 400) and not collapsed
        return {"name": name, "url": url, "status": status, "final": final,
                "redirected": redirected, "collapsed_to_landing": collapsed, "ok": ok}
    except Exception as e:
        return {"name": name, "url": url, "status": None, "final": None,
                "redirected": False, "collapsed_to_landing": False,
                "ok": False, "error": str(e)}

def main():
    cases = extract_cases(SRC)
    if not cases:
        print("No URLs found in", SRC); sys.exit(2)
    results = [check(n, u) for n, u in cases]
    fails = [r for r in results if not r["ok"]]
    width = max(len(r["name"]) for r in results)
    print(f"\nLink check: {len(results)} URLs ({len(fails)} failing)\n" + "-"*60)
    for r in results:
        flag = "OK " if r["ok"] else "FAIL"
        extra = ""
        if r.get("collapsed_to_landing"): extra = " (redirects to landing page)"
        elif r.get("error"):               extra = f" ({r['error']})"
        elif r.get("redirected"):          extra = " (redirected)"
        print(f"  [{flag}] {r['name']:<{width}}  {r['status']}  {r['url']}{extra}")
    out = "/mnt/documents/link_check_report.json"
    with open(out, "w") as f: json.dump(results, f, indent=2)
    print(f"\nReport: {out}")
    sys.exit(0 if not fails else 1)

if __name__ == "__main__":
    main()
