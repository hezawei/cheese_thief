"""
One-click dev restart: kills existing servers on ports 3001/5173, then starts both server and client.
Usage: python dev.py
"""
import subprocess
import sys
import os
import signal
import time

ROOT = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(ROOT, "server")
CLIENT_DIR = os.path.join(ROOT, "client")
PORTS = [3001, 5173]


def kill_port(port: int):
    """Kill whatever process is listening on the given port (Windows)."""
    try:
        result = subprocess.run(
            ["powershell", "-Command",
             f"Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue "
             f"| ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }}"],
            capture_output=True, text=True, timeout=10,
        )
    except Exception:
        pass


def main():
    print("[dev] Stopping existing servers...")
    for port in PORTS:
        kill_port(port)
    time.sleep(0.5)

    print(f"[dev] Starting server in {SERVER_DIR}")
    server_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=SERVER_DIR,
        shell=True,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
    )

    time.sleep(2)

    print(f"[dev] Starting client in {CLIENT_DIR}")
    client_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=CLIENT_DIR,
        shell=True,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == "win32" else 0,
    )

    print()
    print("[dev] Both servers started!")
    print("[dev] Server: http://localhost:3001")
    print("[dev] Client: http://localhost:5173")
    print("[dev] Press Ctrl+C to stop all")
    print()

    try:
        server_proc.wait()
    except KeyboardInterrupt:
        print("\n[dev] Shutting down...")
        for proc in [server_proc, client_proc]:
            try:
                if sys.platform == "win32":
                    proc.send_signal(signal.CTRL_BREAK_EVENT)
                else:
                    proc.terminate()
            except Exception:
                pass
        time.sleep(1)
        for port in PORTS:
            kill_port(port)
        print("[dev] Done.")


if __name__ == "__main__":
    main()
