from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from pypdf import PdfReader


ARITHMETIC_TOPICS = [
    "RAZONES Y PROPORCIONES",
    "MAGNITUDES PROPORCIONALES",
    "REGLA DE TRES",
    "REPARTO PROPORCIONAL",
    "TANTO POR CUANTO Y PORCENTAJES",
    "INTERÉS SIMPLE Y COMPUESTO",
    "MEZCLA Y ALEACIÓN",
    "MEDIDAS DE TENDENCIA CENTRAL Y DISPERSIÓN",
    "ANÁLISIS COMBINATORIO",
    "PROBABILIDAD",
    "NUMERACIÓN Y CONTEO DE CIFRAS",
    "NÚMEROS NATURALES, ENTEROS Y COMPLEMENTO ARITMÉTICO",
    "MULTIPLICACIÓN, DIVISIÓN Y DIVISIBILIDAD",
    "ECUACIONES DIOFÁNTICAS",
    "NÚMEROS PRIMOS Y DIVISORES",
    "MCD Y MCM",
    "RACIONALES Y FRACCIONES",
    "PROBLEMAS DIVERSOS DE RAZONAMIENTO NUMÉRICO",
    "POTENCIACIÓN Y RADICACIÓN",
]

ALGEBRA_TOPICS = [
    "LÓGICA",
    "CONJUNTOS",
    "NÚMEROS REALES Y PROPIEDADES DE DESIGUALDAD",
    "ECUACIONES E INECUACIONES",
    "RADICALES Y VALOR ABSOLUTO",
    "TEORÍA DE POLINOMIOS",
    "FUNCIONES",
    "FUNCIÓN EXPONENCIAL Y LOGARÍTMICA",
    "MATRICES Y DETERMINANTES",
    "SISTEMAS DE ECUACIONES",
    "PROGRAMACIÓN LINEAL",
    "SUCESIONES, LÍMITES Y SERIES",
]

TRIGONOMETRY_NAMES = [
    "Ángulo trigonométrico",
    "Razones trigonométricas de ángulos agudos",
    "Resolución de triángulos rectángulos y ángulos verticales",
    "Longitud de arco, sector y trapecio circular",
    "Introducción a la geometría analítica",
    "La recta y sus ecuaciones",
    "Razones trigonométricas de ángulos de cualquier medida",
    "Reducción de arcos al primer cuadrante",
    "Circunferencia trigonométrica 1",
    "Identidades trigonométricas de arco simple",
    "Identidades de arcos compuestos",
    "Identidades de arco doble y arco mitad",
    "Identidades del arco triple",
    "Transformaciones trigonométricas",
    "Funciones trigonométricas reales: seno y coseno",
    "Funciones secante y cosecante",
    "Teoría de periodos y funciones generalizadas",
    "Funciones trigonométricas inversas",
    "Ecuaciones e inecuaciones trigonométricas",
    "Resolución de triángulos y semiángulos",
    "Área de regiones triangulares",
]


def pdf_text(path: Path) -> str:
    return "\n".join(page.extract_text() or "" for page in PdfReader(str(path)).pages)


def find_pdf(source_dir: Path, course: str) -> Path:
    matches = list(source_dir.glob(f"*{course}*UNIVERSE.pdf"))
    if len(matches) != 1:
        raise RuntimeError(f"Se esperaba un PDF para {course}; encontrados: {len(matches)}")
    return matches[0]


def sentence_case(value: str) -> str:
    value = " ".join(value.split())
    if any(character.islower() for character in value):
        return value[:1].upper() + value[1:]
    value = value[:1].upper() + value[1:].lower()
    return value.replace("Mcd y mcm", "MCD y MCM")


def numbered_subtopics(text: str) -> list[dict[str, int | str]]:
    lines = [line.strip() for line in text.splitlines()]
    topics: list[dict[str, int | str]] = []
    index = 0
    while index < len(lines):
        line = lines[index]
        if not re.match(r"^\d+\.\d+\s+", line):
            index += 1
            continue
        combined = line
        lookahead = index + 1
        while not re.search(r"\((\d+)\)\s*$", combined) and lookahead < len(lines) and lookahead <= index + 3:
            combined += " " + lines[lookahead]
            lookahead += 1
        match = re.match(r"^\d+\.\d+\s+(.+?)\s+\((\d+)\)\s*$", combined)
        if match:
            topics.append({"name": sentence_case(match.group(1)), "total": int(match.group(2))})
        index += 1
    return topics


def topic_intervals(text: str, headings: list[str]) -> list[dict[str, int | str]]:
    positions = sorted((text.find(heading), heading) for heading in headings if text.find(heading) >= 0)
    topics: list[dict[str, int | str]] = []
    for index, (start, heading) in enumerate(positions):
        end = positions[index + 1][0] if index + 1 < len(positions) else len(text)
        count = len(re.findall(r"\bPregunta\s*\d+", text[start:end], flags=re.IGNORECASE))
        topics.append({"name": sentence_case(heading), "total": count})
    return topics


def geometry_topics(text: str) -> list[dict[str, int | str]]:
    matches = re.findall(
        r"SESIÓN\s+(\d+)\.\s+(.+?)\s*\((\d+)\s+preguntas?\)",
        text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    rows = sorted(((int(session), " ".join(name.split()), int(count)) for session, name, count in matches))
    return [{"name": sentence_case(name), "total": count} for _, name, count in rows]


def trigonometry_topics(text: str) -> list[dict[str, int | str]]:
    starts = list(re.finditer(r"(?m)^S(?:\d+(?:\.\d+)?)(?:\s*/\s*S?\d+(?:\.\d+)?)?\s*-\s*", text))
    if len(starts) != len(TRIGONOMETRY_NAMES):
        raise RuntimeError(f"Se esperaban {len(TRIGONOMETRY_NAMES)} temas de Trigonometría; encontrados: {len(starts)}")
    topics: list[dict[str, int | str]] = []
    for index, start in enumerate(starts):
        end = starts[index + 1].start() if index + 1 < len(starts) else len(text)
        count = len(re.findall(r"\bPregunta\s*\d+", text[start.start():end], flags=re.IGNORECASE))
        topics.append({"name": TRIGONOMETRY_NAMES[index], "total": count})
    return topics


def build(source_dir: Path) -> dict:
    physics = numbered_subtopics(pdf_text(find_pdf(source_dir, "FÍSICA")))
    chemistry = numbered_subtopics(pdf_text(find_pdf(source_dir, "QUÍMICA")))
    arithmetic = topic_intervals(pdf_text(find_pdf(source_dir, "ARITMÉTICA")), ARITHMETIC_TOPICS)
    algebra = topic_intervals(pdf_text(find_pdf(source_dir, "ÁLGEBRA")), ALGEBRA_TOPICS)
    geometry = geometry_topics(pdf_text(find_pdf(source_dir, "GEOMETRÍA")))
    trigonometry = trigonometry_topics(pdf_text(find_pdf(source_dir, "TRIGONOMETRÍA")))

    courses = [
        {"slug": "fisica", "name": "Física", "category": "Ciencias", "topics": physics},
        {"slug": "quimica", "name": "Química", "category": "Ciencias", "topics": chemistry},
        {"slug": "aritmetica", "name": "Aritmética", "category": "Matemática", "topics": arithmetic},
        {"slug": "algebra", "name": "Álgebra", "category": "Matemática", "topics": algebra},
        {"slug": "geometria", "name": "Geometría", "category": "Matemática", "topics": geometry},
        {"slug": "trigonometria", "name": "Trigonometría", "category": "Matemática", "topics": trigonometry},
    ]
    expected_totals = {
        "Física": 135,
        "Química": 132,
        "Aritmética": 118,
        "Álgebra": 116,
        "Geometría": 117,
        "Trigonometría": 109,
    }
    for course in courses:
        actual = sum(int(topic["total"]) for topic in course["topics"])
        if actual != expected_totals[course["name"]]:
            raise RuntimeError(f"Total incorrecto en {course['name']}: {actual} != {expected_totals[course['name']]}")

    topic_count = sum(len(course["topics"]) for course in courses)
    appearance_count = sum(expected_totals.values())
    return {
        "id": "seleccion",
        "label": "Prueba de selección",
        "aggregateOnly": True,
        "range": "2011-2 a 2026-2",
        "examCount": 19,
        "questionCount": appearance_count,
        "periods": [],
        "summary": {"courseCount": 6, "topicCount": topic_count, "appearanceCount": appearance_count},
        "courses": courses,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    exam = build(args.source_dir)
    payload = "window.UNIVERSE_CEPRE_SELECTION_FIXED = " + json.dumps(
        exam, ensure_ascii=False, separators=(",", ":")
    ) + ";\n"
    args.output.write_text(payload, encoding="utf-8")
    print(json.dumps(exam["summary"], ensure_ascii=False))
    for course in exam["courses"]:
        print(course["name"], len(course["topics"]), sum(topic["total"] for topic in course["topics"]))


if __name__ == "__main__":
    main()
