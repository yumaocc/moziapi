#!/usr/bin/env python3
"""Extract public OpenAI relay pricing claims from VeriDrop's PRO leaderboard."""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import re
import sys
import time
from dataclasses import dataclass
from html import unescape
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from lxml import html


BASE_URL = "https://veridrop.org"
LEADERBOARD_URL = f"{BASE_URL}/leaderboard/openai"
USER_AGENT = "sub2api-veridrop-public-data-audit/1.0"

RECHARGE_PATTERNS = (
    re.compile(r"[^。！？；]{0,40}(?:充值|充值汇率|兑换)[^。！？；]{0,80}", re.I),
    re.compile(r"[^。！？；]{0,40}(?:\d+(?:\.\d+)?\s*[元¥￥R])\s*[=:：]\s*\$?\d+(?:\.\d+)?[^。！？；]{0,50}", re.I),
    re.compile(r"[^。！？；]{0,40}\d+(?:\.\d+)?\s*[:：]\s*\d+(?:\.\d+)?[^。！？；]{0,50}", re.I),
)

MULTIPLIER_PATTERNS = (
    re.compile(r"[^。！？；]{0,55}(?:OpenAI|GPT|Codex|Code[xX]?)[^。！？；]{0,80}(?:\d+(?:\.\d+)?\s*[xX倍折])[^。！？；]{0,45}", re.I),
    re.compile(r"[^。！？；]{0,55}(?:倍率|官方价)[^。！？；]{0,80}", re.I),
    re.compile(r"[^。！？；]{0,55}(?:低至|价格)[^。！？；]{0,35}\d+(?:\.\d+)?\s*折[^。！？；]{0,45}", re.I),
)


@dataclass(frozen=True)
class Relay:
    rank: int
    domain: str
    detail_url: str
    openai_tests: str
    openai_score: str


def fetch(url: str, attempts: int = 3) -> bytes:
    request = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
    for attempt in range(attempts):
        try:
            with urlopen(request, timeout=30) as response:
                return response.read()
        except (HTTPError, URLError, TimeoutError):
            if attempt + 1 == attempts:
                raise
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError("unreachable")


def clean(value: str) -> str:
    return " ".join(unescape(value).split())


def first_match(pattern: re.Pattern[str], value: str) -> str:
    match = pattern.search(value)
    return clean(match.group(0)) if match else ""


def matching_claims(
    patterns: tuple[re.Pattern[str], ...], value: str, *, require_numeric: bool = False
) -> str:
    claims: list[str] = []
    for pattern in patterns:
        claim = first_match(pattern, value)
        has_number = bool(re.search(r"\d", claim)) or "一比一" in claim
        if claim and (not require_numeric or has_number) and claim not in claims:
            claims.append(claim)
    return " | ".join(claims)


def leaderboard_relays() -> list[Relay]:
    document = html.fromstring(fetch(LEADERBOARD_URL))
    relays: list[Relay] = []
    seen: set[str] = set()

    badges = document.xpath(
        '//*[contains(concat(" ", normalize-space(@class), " "), " tier-pro ")]'
    )
    for badge in badges:
        articles = badge.xpath("ancestor::article[1]")
        if not articles:
            continue
        article = articles[0]
        links = article.xpath('.//h2//a[contains(@href, "/leaderboard/")]')
        if not links:
            continue
        domain = clean(links[0].text_content())
        if domain in seen or domain == "api.openai.com":
            continue
        seen.add(domain)

        text = clean(article.text_content())
        tests = first_match(re.compile(r"\d+(?=\s*次 OpenAI 检测)"), text)
        scores = article.xpath(
            './/a[.//*[contains(concat(" ", normalize-space(@class), " "), " lb-proto-name ") '
            'and normalize-space(.)="OpenAI"]]'
            '//*[contains(concat(" ", normalize-space(@class), " "), " lb-proto-score ")]/text()'
        )
        score = clean(scores[0]) if scores else ""
        relays.append(
            Relay(
                rank=len(relays) + 1,
                domain=domain,
                detail_url=urljoin(BASE_URL, links[0].get("href").split("?", 1)[0]),
                openai_tests=tests,
                openai_score=score,
            )
        )
    return relays


def relay_row(relay: Relay, captured_at: str) -> dict[str, str | int]:
    document = html.fromstring(fetch(relay.detail_url))
    zones = document.xpath(
        '//*[contains(concat(" ", normalize-space(@class), " "), " official-zone ")]'
    )
    description = ""
    pricing_url = ""
    if zones:
        zone = zones[0]
        descriptions = zone.xpath(
            './/*[contains(concat(" ", normalize-space(@class), " "), " official-desc ")]'
        )
        if descriptions:
            description = clean(descriptions[0].text_content())
        pricing_links = zone.xpath('.//a[contains(normalize-space(.), "定价")]/@href')
        if pricing_links:
            pricing_url = pricing_links[0]

    recharge_claim = matching_claims(RECHARGE_PATTERNS, description, require_numeric=True)
    multiplier_claim = matching_claims(
        MULTIPLIER_PATTERNS, description, require_numeric=True
    )
    return {
        "captured_at": captured_at,
        "openai_rank": relay.rank,
        "domain": relay.domain,
        "openai_tests": relay.openai_tests,
        "openai_score": relay.openai_score,
        "recharge_claim": recharge_claim or "未披露",
        "openai_multiplier_claim": multiplier_claim or "未披露",
        "pricing_url": pricing_url,
        "veridrop_detail_url": relay.detail_url,
        "official_description": description,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("-o", "--output", default="veridrop_openai_pricing.csv")
    args = parser.parse_args()

    captured_at = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    relays = leaderboard_relays()
    if not relays:
        print("No PRO OpenAI relays found", file=sys.stderr)
        return 1

    rows = []
    for index, relay in enumerate(relays, 1):
        try:
            rows.append(relay_row(relay, captured_at))
        except (HTTPError, URLError, TimeoutError) as error:
            print(f"warning: {relay.domain}: {error}", file=sys.stderr)
            rows.append(
                {
                    "captured_at": captured_at,
                    "openai_rank": relay.rank,
                    "domain": relay.domain,
                    "openai_tests": relay.openai_tests,
                    "openai_score": relay.openai_score,
                    "recharge_claim": "抓取失败",
                    "openai_multiplier_claim": "抓取失败",
                    "pricing_url": "",
                    "veridrop_detail_url": relay.detail_url,
                    "official_description": "",
                }
            )
        print(f"[{index:02d}/{len(relays)}] {relay.domain}", file=sys.stderr)

    with open(args.output, "w", newline="", encoding="utf-8-sig") as output:
        writer = csv.DictWriter(output, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"wrote {len(rows)} rows to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
