#!/usr/bin/env python3
"""Descarga los PDF autorizados y crea bancos privados sin claves."""

from __future__ import annotations

import json
import re
import time
import urllib.request
from collections import defaultdict
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
SOURCES = json.loads((ROOT / "tools" / "class-question-pdfs.json").read_text(encoding="utf-8"))
PDF_DIR = ROOT / "tmp" / "class-question-pdfs"
OUT_DIR = ROOT / "tmp" / "class-question-banks"
QUESTION_RE = re.compile(r"(?m)(?:^|\n)\s*(\d{1,3})[\.\)]\s+")
CHOICE_RE = re.compile(r"(?<![A-Za-z0-9])([A-E])\)\s*")
STOP_RE = re.compile(r"(?im)^\s*(?:CLAVES?|RESPUESTAS?|SOLUCIONARIO|SOLUCIONES)\s*$")
IMAGE_RE = re.compile(r"\b(figura|gráfico|grafica|tabla|diagrama|imagen|mostrada|mostrado|observe)\b", re.I)
EXACT_WEEK_RANGES = {
    "fisica": {
        "semana-1": ("Física — Libro 1 — CEPREUNI 2026-2", 1, 30),
        "semana-2": ("Física — Libro 1 — CEPREUNI 2026-2", 31, 60),
    }
}


def normalize(text: str) -> str:
    text = text.replace("\r", "\n").replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def download(source: dict[str, str]) -> Path:
    PDF_DIR.mkdir(parents=True, exist_ok=True)
    target = PDF_DIR / f"{source['id']}.pdf"
    if target.exists() and target.stat().st_size > 20000:
        return target
    url = f"https://drive.usercontent.google.com/download?id={source['id']}&export=download&confirm=t"
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=120) as response, target.open("wb") as output:
        while True:
            chunk = response.read(1024 * 512)
            if not chunk:
                break
            output.write(chunk)
    return target


def ordered_choices(block: str) -> tuple[str, list[dict[str, str]]]:
    matches = list(CHOICE_RE.finditer(block))
    for start in range(len(matches)):
        sequence = matches[start:start + 5]
        if len(sequence) < 5 or [item.group(1) for item in sequence] != list("ABCDE"):
            continue
        stem = normalize(block[:sequence[0].start()])
        choices = []
        for index, item in enumerate(sequence):
            end = sequence[index + 1].start() if index < 4 else len(block)
            value = normalize(block[item.end():end])
            choices.append({"label": item.group(1), "text": value})
        if stem and all(choice["text"] for choice in choices):
            return stem, choices
    return "", []


def extract(source: dict[str, str], path: Path) -> list[dict]:
    reader = PdfReader(str(path))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    stop = STOP_RE.search(text)
    if stop:
        text = text[:stop.start()]
    matches = list(QUESTION_RE.finditer(text))
    questions = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        stem, choices = ordered_choices(text[match.end():end])
        if not stem or len(choices) != 5:
            continue
        number = match.group(1)
        questions.append({
            "id": f"{source['course']}-{source['id'][:8]}-{number}-{index + 1}",
            "number": number,
            "cycle": "2026-2",
            "sourceTitle": source["title"],
            "stem": stem,
            "choices": choices,
            "requiresImage": bool(IMAGE_RE.search(stem)),
        })
    return questions


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    banks: dict[str, list[dict]] = defaultdict(list)
    for position, source in enumerate(SOURCES, 1):
        path = download(source)
        found = extract(source, path)
        banks[source["course"]].extend(found)
        print(f"[{position}/{len(SOURCES)}] {source['course']}: {len(found)}")
        time.sleep(.05)
    total = 0
    for course, questions in banks.items():
        payload = {"course": course, "topic": "general", "questions": questions}
        (OUT_DIR / f"{course}-general.json").write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        total += len(questions)
        for topic, (source_title, first, last) in EXACT_WEEK_RANGES.get(course, {}).items():
            exact = [
                question for question in questions
                if question["sourceTitle"] == source_title
                and str(question["number"]).isdigit()
                and first <= int(question["number"]) <= last
            ]
            (OUT_DIR / f"{course}-{topic}.json").write_text(
                json.dumps({"course": course, "topic": topic, "questions": exact}, ensure_ascii=False, separators=(",", ":")),
                encoding="utf-8",
            )
            print(f"{course}/{topic}: {len(exact)} preguntas exactas")
    print(f"Total extraído: {total} preguntas en {len(banks)} cursos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
