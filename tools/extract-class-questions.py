#!/usr/bin/env python3
"""
Extrae preguntas desde un PDF hacia un JSON privado para importar al backend.

Uso:
  python tools/extract-class-questions.py --pdf material.pdf --course aritmetica --topic razones-y-proporciones --cycle 2026-2 --source-title "Aritmetica 2026-2" --out tmp/aritmetica.json

El JSON generado NO debe commitearse. Se importa con tools/import-class-questions.js.
No intenta extraer solucionarios ni claves: corta al detectar secciones de respuestas.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Iterable


STOP_RE = re.compile(r"\b(claves?|respuestas?|solucionario|soluciones?)\b", re.I)
QUESTION_RE = re.compile(r"(?m)(?:^|\n)\s*(?:PREGUNTA\s*)?(\d{1,3})[\).\-\s]+")
CHOICE_RE = re.compile(r"(?is)(?:^|\n)\s*([A-E])[\).\-\s]+(.+?)(?=(?:\n\s*[A-E][\).\-\s]+)|\Z)")
IMAGE_HINT_RE = re.compile(r"\b(figura|gr[aá]fico|tabla|diagrama|imagen|observe|mostrado|muestra)\b", re.I)


def read_pdf_text(path: Path) -> str:
    try:
        import pdfplumber  # type: ignore
        with pdfplumber.open(str(path)) as pdf:
            return "\n".join(page.extract_text(x_tolerance=1, y_tolerance=3) or "" for page in pdf.pages)
    except Exception:
        from pypdf import PdfReader  # type: ignore
        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)


def strip_after_answers(text: str) -> str:
    match = STOP_RE.search(text)
    return text[: match.start()] if match else text


def normalize_space(text: str) -> str:
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_blocks(text: str) -> Iterable[tuple[str, str]]:
    matches = list(QUESTION_RE.finditer(text))
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        block = text[start:end].strip()
        if block:
            yield match.group(1), block


def parse_choices(block: str) -> tuple[str, list[dict[str, str]]]:
    matches = list(CHOICE_RE.finditer(block))
    if not matches:
        return normalize_space(block), []
    stem = normalize_space(block[: matches[0].start()])
    choices = []
    for match in matches[:5]:
        choices.append({"label": match.group(1).upper(), "text": normalize_space(match.group(2))})
    return stem, choices


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--course", required=True)
    parser.add_argument("--topic", required=True)
    parser.add_argument("--cycle", default="")
    parser.add_argument("--week", default="")
    parser.add_argument("--source-title", default="")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()

    pdf = Path(args.pdf).expanduser().resolve()
    out = Path(args.out).expanduser().resolve()
    text = normalize_space(strip_after_answers(read_pdf_text(pdf)))

    questions = []
    for number, block in split_blocks(text):
        stem, choices = parse_choices(block)
        if not stem or len(choices) < 2:
            continue
        questions.append({
            "id": f"{args.course}-{args.topic}-{number}",
            "number": number,
            "cycle": args.cycle,
            "week": args.week,
            "sourceTitle": args.source_title or pdf.name,
            "stem": stem,
            "choices": choices,
            "requiresImage": bool(IMAGE_HINT_RE.search(stem)),
        })

    payload = {"course": args.course, "topic": args.topic, "questions": questions}
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {len(questions)} questions to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
