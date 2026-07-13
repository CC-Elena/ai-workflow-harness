# Architecture

`game-core`, `economy`, `experiments`, `features`, `telemetry`, `config`, and `ui` are separate boundaries. Feature transitions may call economy services but must not call the removed legacy `restartGame` behavior.
