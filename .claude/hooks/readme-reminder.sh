#!/usr/bin/env bash
# Hook Claude Code (PreToolUse / Bash) : rappelle de mettre à jour README.md
# quand un `git commit` embarque des fichiers « structurants » sans modifier le README.
# Non bloquant : émet juste un rappel (systemMessage + contexte modèle) puis exit 0.
#
# Déclencheurs :
#   - modification de : front/src/app/model/distinction-rules.ts, front/src/app/app.routes.ts,
#     front/src/app/services/firestore.service.ts, front/package.json
#   - ajout (nouveau fichier) d'un *.component.ts sous front/src/app/
#
# Testabilité : README_HOOK_STATUS_OVERRIDE peut fournir une sortie
# `git diff --cached --name-status` simulée (une entrée "STATUT\tchemin" par ligne).

set -uo pipefail

input="$(cat 2>/dev/null || true)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null || true)"

# N'agit que pour un git commit (gère les commandes composées : `git add ... && git commit ...`)
case "$cmd" in
  *"git commit"*) : ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null || exit 0

status="${README_HOOK_STATUS_OVERRIDE:-$(git diff --cached --name-status 2>/dev/null || true)}"
[ -z "$status" ] && exit 0

# README.md déjà dans le commit → rien à signaler
if printf '%s\n' "$status" | awk -F'\t' '{print $2}' | grep -qx 'README.md'; then
  exit 0
fi

# Fichiers structurants explicites (toute modification)
explicit="$(printf '%s\n' "$status" | awk -F'\t' '{print $2}' | grep -E \
  '^(front/src/app/model/distinction-rules\.ts|front/src/app/app\.routes\.ts|front/src/app/services/firestore\.service\.ts|front/package\.json)$' \
  || true)"

# Nouveaux composants (statut ajouté « A »)
newcomp="$(printf '%s\n' "$status" | awk -F'\t' '$1 ~ /^A/ && $2 ~ /^front\/src\/app\/.*\.component\.ts$/ {print $2}' || true)"

triggers="$(printf '%s\n%s\n' "$explicit" "$newcomp" | grep -v '^[[:space:]]*$' | sort -u || true)"
[ -z "$triggers" ] && exit 0

msg="📝 Rappel README : ce commit touche des fichiers structurants sans modifier README.md — pense à vérifier/mettre à jour le README."

jq -n --arg m "$msg" --arg files "$triggers" '{
  systemMessage: ($m + "\n" + $files),
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: ($m + "\nFichiers concernés :\n" + $files + "\nSi le README a besoin d'\''être mis à jour, propose-le après ce commit.")
  }
}'
exit 0
