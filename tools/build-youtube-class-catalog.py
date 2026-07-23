#!/usr/bin/env python3
"""Construye el catálogo estático de Clases desde los canales autorizados."""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

from yt_dlp import YoutubeDL


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "class-videos"
CHANNELS = (
    ("@universepre_official", "https://www.youtube.com/@universepre_official/videos"),
    ("@TODOPRE", "https://www.youtube.com/@TODOPRE/videos"),
    ("@bastet1490", "https://www.youtube.com/@bastet1490/videos"),
)

COURSES = {
    "razonamiento-verbal": ("Razonamiento verbal", "Humanidades"),
    "razonamiento-matematico": ("Razonamiento matemático", "Matemática"),
    "aritmetica": ("Aritmética", "Matemática"),
    "algebra": ("Álgebra", "Matemática"),
    "geometria": ("Geometría", "Matemática"),
    "trigonometria": ("Trigonometría", "Matemática"),
    "fisica": ("Física", "Ciencias"),
    "quimica": ("Química", "Ciencias"),
    "biologia": ("Biología", "Ciencias"),
    "psicologia": ("Psicología", "Humanidades"),
    "geografia": ("Geografía", "Humanidades"),
    "historia": ("Historia", "Humanidades"),
    "literatura": ("Literatura", "Humanidades"),
    "lenguaje": ("Lenguaje", "Humanidades"),
    "economia": ("Economía", "Humanidades"),
    "filosofia": ("Filosofía", "Humanidades"),
    "ingles": ("Inglés", "Humanidades"),
    "civica": ("Cívica y DPCC", "Humanidades"),
    "otros": ("Otros videos educativos", "Recursos"),
}

MATCHERS = (
    ("razonamiento-verbal", r"\b(HABILIDAD|RAZONAMIENTO|RAZ\.?)\s+VERBAL\b|\bRV\s*S?\d"),
    ("razonamiento-matematico", r"\b(HABILIDAD|RAZONAMIENTO)\s+MATEM[ÁA]TIC|\bRM\s*S?\d"),
    ("aritmetica", r"\bARITM[ÉE]TICA\b|\bARI\s*(S|UNI|REF|QUIZ|\d)"),
    ("algebra", r"\b[ÁA]LGEBRA\b|\bALG\s*(S|Q|REF|\d)"),
    ("geometria", r"\bGEOMETR[ÍI]A\b|\bGEOM\s*(S|R|REF|\d)"),
    ("trigonometria", r"\bTRIGONOMETR[ÍI]A\b|\bTRI\s*(S|REF|\d)"),
    ("fisica", r"\bF[ÍI]SICA\b|\bFIS\s*(S|REF|IV|\d)"),
    ("quimica", r"\bQU[ÍI]MICA\b|\bQUI\s*(S|REF|\d)"),
    ("biologia", r"\bBIOLOG[ÍI]A\b|\bBIO\s*(S|REF|\d)"),
    ("psicologia", r"\bPSICOLOG[ÍI]A\b|\bPSICOLOGY\b|\bPSYCHOLOGY\b"),
    ("geografia", r"\bGEOGRAF[ÍI]A\b|\bGEOGRAPHY\b"),
    ("historia", r"\bHISTORIA\b|\bHISTORY\b"),
    ("literatura", r"\bLITERATURA\b|\bLITERATURE\b"),
    ("lenguaje", r"\bLENGUAJE\b|\bLANGUAGE\b"),
    ("economia", r"\bECONOM[ÍI]A\b|\bECONOMICS\b"),
    ("filosofia", r"\bFILOSOF[ÍI]A\b|\bPHILOSOPHY\b"),
    ("ingles", r"\bINGL[ÉE]S\b|\bENGLISH\b|\bING\s*S?\d"),
    ("civica", r"\bC[ÍI]VICA\b|\bDPCC\b|\bCIUDADAN[ÍI]A\b"),
)

PHYSICS_TOPICS = (
    ("analisis-dimensional-vectores", "Análisis dimensional y vectores", r"AN[ÁA]LISIS\s+DIMENSIONAL.*VECTORES|VECTORES.*AN[ÁA]LISIS\s+DIMENSIONAL"),
    ("sistema-internacional", "Sistema Internacional y análisis dimensional", r"SISTEMA\s+INTERNACIONAL|AN[ÁA]LISIS\s+DIMENSIONAL|CANTIDADES?\s+F[ÍI]SICAS?"),
    ("vectores", "Vectores", r"\bVECTORES?\b"),
    ("cinematica", "Cinemática", r"\bCINEM[ÁA]TICA\b|\bMRU\b|\bMRUV\b|MOVIMIENTO\s+UNIDIMENSIONAL"),
    ("movimiento-circular", "Movimiento circular", r"MOVIMIENTO\s+CIRCULAR|\bMCU\b|\bMCUV\b"),
    ("dinamica", "Dinámica y leyes de Newton", r"\bDIN[ÁA]MICA\b|LEYES?\s+DE\s+NEWTON|FRICCI[ÓO]N"),
    ("gravitacion", "Gravitación", r"GRAVITACI[ÓO]N|LEYES?\s+DE\s+KEPLER|MOVIMIENTO\s+PLANETARIO"),
    ("trabajo-energia", "Trabajo, energía y potencia", r"\bTRABAJO\b|\bENERG[ÍI]A\b|\bPOTENCIA\b"),
    ("impulso-colisiones", "Impulso y colisiones", r"\bIMPULSO\b|CANTIDAD\s+DE\s+MOVIMIENTO|COLISION"),
    ("movimiento-armonico", "Movimiento armónico simple", r"ARM[ÓO]NICO|\bMAS\b"),
    ("ondas", "Ondas mecánicas", r"ONDAS?\s+MEC[ÁA]NIC|MOVIMIENTO\s+ONDULATORIO"),
    ("fluidos", "Fluidos", r"\bFLUIDOS?\b|HIDROST[ÁA]TICA|HIDRODIN[ÁA]MICA"),
    ("calor-temperatura", "Calor y temperatura", r"\bCALOR\b|\bTEMPERATURA\b|DILATACI[ÓO]N"),
    ("termodinamica", "Termodinámica", r"TERMODIN[ÁA]MICA|GASES?\s+IDEALES?"),
    ("electrostatica", "Electrostática", r"ELECTROST[ÁA]TICA|LEY\s+DE\s+COULOMB|CAMPO\s+EL[ÉE]CTRICO|POTENCIAL\s+EL[ÉE]CTRICO"),
    ("capacitores", "Capacitores", r"CAPACITANCIA|CAPACITORES?|CONDENSADORES?"),
    ("corriente-circuitos", "Corriente y circuitos", r"CORRIENTE\s+EL[ÉE]CTRICA|LEY\s+DE\s+OHM|KIRCHHOFF|CIRCUITOS?\s+EL[ÉE]CTRIC"),
    ("magnetismo", "Magnetismo", r"MAGNETISMO|CAMPO\s+MAGN[ÉE]TICO|FUERZA\s+MAGN[ÉE]TICA"),
    ("induccion-electromagnetica", "Inducción electromagnética", r"INDUCCI[ÓO]N\s+ELECTROMAGN[ÉE]TICA|LEY\s+DE\s+FARADAY|LEY\s+DE\s+LENZ|TRANSFORMADORES?"),
    ("ondas-electromagneticas", "Ondas electromagnéticas", r"ONDAS?\s+ELECTROMAGN[ÉE]TICAS?"),
    ("optica", "Óptica", r"\b[ÓO]PTICA\b|\bLENTES?\b|\bESPEJOS?\b"),
    ("fisica-moderna", "Física moderna", r"F[ÍI]SICA\s+MODERNA|PLANCK|FOTOEL[ÉE]CTRICO|RAYOS?\s+X"),
)


def plain(value: str) -> str:
    return "".join(
        char for char in unicodedata.normalize("NFD", value)
        if unicodedata.category(char) != "Mn"
    )


def classify(title: str) -> str:
    normalized = plain(title).upper()
    for course, pattern in MATCHERS:
        if re.search(plain(pattern), normalized, re.I):
            return course
    return "otros"


def week_from_title(title: str) -> str:
    normalized = plain(title).upper()
    match = re.search(r"\b(?:SEMANA|WEEK|CLASE|CLASS|S)\s*0?(\d{1,2})(?:\.\d+)?\b", normalized)
    return match.group(1) if match else ""


def exact_topic(course: str, title: str) -> tuple[str, str]:
    normalized = plain(title).upper()
    if course == "fisica":
        for topic, label, pattern in PHYSICS_TOPICS:
            if re.search(plain(pattern), normalized, re.I):
                return topic, label
    return "", ""


def question_key(course: str, title: str, week: str) -> tuple[str, str]:
    if course == "otros":
        return "", ""
    normalized = plain(title).upper()
    if re.search(r"\b(?:REPASO|REVIEW|TEMARIO\s+COMPLETO|GENERAL|REF\d*|QUIZ(?:IZ)?|BANCO\s+DE\s+PREGUNTAS)\b", normalized):
        return f"{course}/general", "Banco completo del curso"
    topic, label = exact_topic(course, title)
    if topic:
        return f"{course}/{topic}", label
    is_cepreuni = bool(re.search(r"\bCEPRE\s*UNI\b|\bCEPREUNI\b", normalized))
    if is_cepreuni and week:
        return f"{course}/semana-{week}", f"Semana {week} CEPREUNI"
    return "", ""


def slugify(title: str, video_id: str) -> str:
    base = plain(title).lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    base = re.sub(r"-+", "-", base)[:72].rstrip("-")
    return f"{base or 'clase'}-{video_id[:6].lower()}"


def main() -> int:
    ydl_opts = {
        "extract_flat": "in_playlist",
        "ignoreerrors": True,
        "quiet": True,
        "no_warnings": True,
        "playlistend": None,
        "extractor_args": {"youtube": {"lang": ["es"]}},
    }
    grouped: dict[str, list[dict[str, str]]] = defaultdict(list)
    seen: set[str] = set()

    with YoutubeDL(ydl_opts) as ydl:
        for handle, url in CHANNELS:
            info = ydl.extract_info(url, download=False) or {}
            for entry in info.get("entries") or []:
                if not entry:
                    continue
                video_id = str(entry.get("id") or "").strip()
                title = str(entry.get("title") or "").strip()
                if not video_id or not title or video_id in seen:
                    continue
                seen.add(video_id)
                course = classify(title)
                week = week_from_title(title)
                key, topic_label = question_key(course, title, week)
                grouped[course].append({
                    "slug": slugify(title, video_id),
                    "title": title,
                    "videoId": video_id,
                    "channel": handle,
                    "week": week,
                    "questionKey": key,
                    "topicLabel": topic_label,
                    "embedUrl": f"https://www.youtube-nocookie.com/embed/{video_id}?rel=0&modestbranding=1",
                })

    OUT.mkdir(parents=True, exist_ok=True)
    index = []
    for slug, (title, area) in COURSES.items():
        videos = grouped.get(slug, [])
        videos.sort(key=lambda item: (item["channel"].lower(), item["title"].lower()))
        (OUT / f"{slug}.json").write_text(
            json.dumps({"course": slug, "videos": videos}, ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8",
        )
        index.append({"slug": slug, "title": title, "area": area, "videoCount": len(videos)})

    (OUT / "index.json").write_text(
        json.dumps({"courses": index, "totalVideos": len(seen)}, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Catálogo generado: {len(seen)} videos en {len(COURSES)} cursos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
