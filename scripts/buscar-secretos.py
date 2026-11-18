#!/usr/bin/env python3
"""Busca claves, tokens y datos personales antes de que lleguen a GitHub. Solo usa la librería estándar.

    python3 scripts/buscar-secretos.py            # lo que vas a commitear (lo usa el hook pre-commit)
    python3 scripts/buscar-secretos.py --todo     # todos los archivos de la carpeta (menos lo ignorado)
    python3 scripts/buscar-secretos.py --historial  # todo el historial de git: pásalo antes del primer push

Si una línea es un falso positivo a propósito, añade al final el comentario «secretos: permitido».
"""
import re
import subprocess
import sys
from pathlib import PurePosixPath

PATRONES = {
    "clave de Anthropic": r"sk-ant-[A-Za-z0-9_-]{20,}",
    "clave de OpenAI": r"\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}",
    "clave de AWS": r"\bAKIA[0-9A-Z]{16}\b",
    "token de GitHub": r"\b(?:gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,})",
    "token de Slack": r"\bxox[abprs]-[A-Za-z0-9-]{10,}",
    "clave de Google": r"\bAIza[0-9A-Za-z_-]{35}\b",
    "clave de Stripe": r"\b[rs]k_live_[0-9A-Za-z]{20,}",
    "clave privada": r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
    "JWT": r"\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}",
    "valor secreto asignado": r"(?i)\b(?:api[_-]?key|secret|token|passw(?:or)?d|auth)\w*\s*[:=]\s*['\"][^'\"\s]{12,}['\"]",
    "ruta personal": r"/(?:Users|home)/[A-Za-z0-9._-]+/",
    "correo": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
}
REGEX = [(nombre, re.compile(p)) for nombre, p in PATRONES.items()]
ARCHIVOS_PROHIBIDOS = re.compile(r"(^|/)(\.env(\..+)?|.*\.pem|.*\.key|id_[rd]sa|id_ed25519|.*\.p12)$")
PERMITIDO = "secretos: permitido"
ESTE_ARCHIVO = "scripts/buscar-secretos.py"


def git(*args: str) -> str:
    return subprocess.run(["git", *args], capture_output=True, text=True, check=True).stdout


def archivo_prohibido(ruta: str) -> bool:
    return bool(ARCHIVOS_PROHIBIDOS.search(ruta)) and PurePosixPath(ruta).name != ".env.example"


def revisar_texto(origen: str, texto: str, hallazgos: list[str]) -> None:
    for n, linea in enumerate(texto.splitlines(), 1):
        if PERMITIDO in linea:
            continue
        for nombre, regex in REGEX:
            if m := regex.search(linea):
                hallazgos.append(f"{origen}:{n}: {nombre}: {m.group(0)[:40]}")


def main() -> int:
    modo = sys.argv[1] if len(sys.argv) > 1 else "--staged"
    hallazgos: list[str] = []

    if modo == "--historial":
        for blob in git("rev-list", "--all", "--objects").splitlines():
            sha, _, ruta = blob.partition(" ")
            if not ruta or git("cat-file", "-t", sha).strip() != "blob":
                continue
            if archivo_prohibido(ruta):
                hallazgos.append(f"{ruta} ({sha[:8]}): este archivo no debería estar en el historial")
            if ruta != ESTE_ARCHIVO:
                revisar_texto(f"{ruta} ({sha[:8]})", git("cat-file", "-p", sha), hallazgos)
    else:
        if modo == "--todo":
            rutas = git("ls-files", "--cached", "--others", "--exclude-standard").splitlines()
            leer = lambda r: open(r, encoding="utf-8", errors="ignore").read()
        else:
            rutas = git("diff", "--cached", "--name-only", "--diff-filter=ACMR").splitlines()
            leer = lambda r: git("show", f":{r}")
        for ruta in rutas:
            if archivo_prohibido(ruta):
                hallazgos.append(f"{ruta}: este archivo no se sube nunca (usa .env.example)")
                continue
            if ruta == ESTE_ARCHIVO:
                continue
            try:
                revisar_texto(ruta, leer(ruta), hallazgos)
            except (OSError, UnicodeDecodeError, subprocess.CalledProcessError):
                pass

    if hallazgos:
        print("✋ Posibles claves o datos personales:\n  " + "\n  ".join(hallazgos))
        print("\nQuítalos (o pon la clave en .env) y vuelve a intentarlo.")
        return 1
    print("✓ Sin claves ni datos personales.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
