cd /mnt/c/Users/sahii/Projects/Fixfiz/backend || exit 1
export PLUGINS_DIRECTORY="$PWD/plugins"
mkdir -p "$PLUGINS_DIRECTORY"
echo "==== syntax check ===="
~/fixfiz-venv/bin/python -m py_compile services/agency_engine.py server.py && echo "PY_OK" || { echo "PY_FAIL — aborting restart"; exit 1; }
echo "==== dotenv installed? ===="
~/fixfiz-venv/bin/python -c "import dotenv; print('dotenv', dotenv.__version__)" 2>&1 | head -1
echo "==== killing old uvicorn :8001 ===="
pkill -f "uvicorn server:app" 2>/dev/null
sleep 2
echo "==== relaunching ===="
nohup ~/fixfiz-venv/bin/python -m uvicorn server:app --host 0.0.0.0 --port 8001 > /tmp/fixfiz-8001.log 2>&1 &
echo "pid=$!"
sleep 8
echo "==== /api/health ===="
curl -s --noproxy "*" --max-time 8 http://127.0.0.1:8001/api/health | head -c 200
echo
echo "==== startup log tail ===="
tail -n 8 /tmp/fixfiz-8001.log