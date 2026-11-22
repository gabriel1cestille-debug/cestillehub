#!/usr/bin/env python3
import datetime
import json
import os
import re
import subprocess
import sys

M1 = "/* === [SEC: COLONIA_DATA_ECONOMY] === */"
M2 = "/* === [SEC: DRAGOES_SISTEMA_CRUZAMENTO] === */"
M3 = "/* === [SEC: WAR_DEFESA_3D] === */"
M4 = "/* ===== cortex/36l-world-recovery.js:"

MOD_FILES = [
    "src/colony/01-buildings-3d.js",
    "src/colony/02-dragons-arena.js",
    "src/colony/03-war-ui.js",
]

def sync_colony_modules():
    hub_path = "Cestille-Hub.html"
    if not os.path.exists(hub_path):
        return
    with open(hub_path, "r", encoding="utf-8") as f:
        hub_text = f.read()

    if not all(os.path.exists(p) for p in MOD_FILES):
        os.makedirs("src/colony", exist_ok=True)
        i1, i2, i3, i4 = hub_text.index(M1), hub_text.index(M2), hub_text.index(M3), hub_text.index(M4)
        for p, chunk in zip(MOD_FILES, [hub_text[i1:i2], hub_text[i2:i3], hub_text[i3:i4]]):
            with open(p, "w", encoding="utf-8") as f:
                f.write(chunk)
        print("✔ Módulos src/colony/*.js inicializados.")
        return

    # Canonical colony sources are src/colony/*.js. A timestamp from editing
    # authentication in the HTML must never erase newer module changes.
    i1 = hub_text.index(M1)
    i4 = hub_text.index(M4)
    parts = []
    for p in MOD_FILES:
        with open(p, "r", encoding="utf-8") as f:
            parts.append(f.read())
    new_hub = hub_text[:i1] + "".join(parts) + hub_text[i4:]
    if new_hub != hub_text:
        with open(hub_path, "w", encoding="utf-8") as f:
            f.write(new_hub)
        hub_text = new_hub
        print("⚡ src/colony/*.js -> Cestille-Hub.html sincronizado.")

    # Sincronizar Cestille-Hub.html -> deploy/index.html preservando o BUILD atual
    with open("deploy/index.html", "w", encoding="utf-8") as f:
        f.write(hub_text)
    print("✔ Cestille-Hub.html -> deploy/index.html sincronizado.")

def main():
    sync_colony_modules()
    if "--sync-only" in sys.argv:
        return

    now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    print(f'=== CST DEPLOY: Carimbo {now} ===')

    # 1. Update deploy/version.json
    with open('deploy/version.json', 'w', encoding='utf-8') as f:
        json.dump({'build': now}, f, indent=2)
    print('✔ deploy/version.json atualizado.')

    # 2. Update deploy/index.html & Cestille-Hub.html BUILD stamp
    for target in ['deploy/index.html', 'Cestille-Hub.html']:
        with open(target, 'r', encoding='utf-8') as f:
            content = f.read()
        pattern = r"const BUILD = ['\"][^'\"]*['\"];"
        new_content, count = re.subn(pattern, f"const BUILD = '{now}';", content)
        if count == 1:
            with open(target, 'w', encoding='utf-8') as f:
                f.write(new_content)
    print(f'✔ deploy/index.html e Cestille-Hub.html carimbados com BUILD = {now}.')

    # 3. Executar wrangler deploy
    print('🚀 Publicando no Cloudflare Workers (npx wrangler deploy)...')
    res = subprocess.run(['npx', 'wrangler', 'deploy'], capture_output=True, text=True)
    if res.returncode != 0:
        print('❌ Erro no deploy:', res.stderr)
        sys.exit(res.returncode)
    print(res.stdout)
    print(f'🎉 Deploy concluído com sucesso! Versão no ar: {now}')

if __name__ == '__main__':
    main()
