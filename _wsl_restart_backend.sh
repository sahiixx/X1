#!/usr/bin/env bash
# Restart the NOWHERE.ai (Fixfiz) backend in WSL.
# The live uvicorn's cwd is /mnt/c/Users/sahii/Projects/Fixfiz/backend.
# PLUGINS_DIRECTORY must be set or the server crashes at import (mkdir /app/plugins).
set -e
cd /mnt/c/Users/sahii/Projects/Fixfiz/backend
export PLUGINS_DIRECTORY="$PWD/plugins"
mkdir -p "$PLUGINS_DIRECTORY"
echo "=== killing any running uvicorn server:app ==="
pkill -f "uvicorn server:app" 2>/dev/null || true
sleep 3
pgrep -af "uvicorn server:app" && { echo "STILL_RUNNING_AFTER_KILL"; } || echo "STOPPED_OK"
echo "=== relaunching ==="
nohup /home/xx/fixfiz-venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8001 --log-level info > /tmp/fixfiz-8001.log 2>&1 &
echo "launched pid $!"
sleep 8
echo "=== /api/health ==="
curl -s --noproxy "*" -m 10 http://127.0.0.1:8001/api/health || echo "HEALTH_FAIL"
echo
echo "=== tail log ==="
tail -n 6 /tmp/fixfiz-8001.log