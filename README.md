# vscode-ros2-sim-pause

A VS Code extension that **automatically pauses a Gazebo simulation when a debugger breakpoint is hit** and resumes it when execution continues.

Works as a companion to **[RDE (Ranch Hand Robotics)](https://marketplace.visualstudio.com/items?itemName=Ranch-Hand-Robotics.rde-ros-2)** — the ROS 2 debugger for VS Code.

## Why

When debugging a ROS 2 node mid-simulation the world keeps running while you inspect code at a breakpoint. Sensor data drifts, the robot moves, and it becomes hard to reason about what the node was actually seeing at the moment execution paused.

This extension freezes the simulated world in sync with the debugger.

## How it works

VS Code exposes `DebugAdapterTrackerFactory` — a lightweight observer that intercepts DAP messages from a running debug session without replacing the adapter. This extension hooks into RDE's `ros2` debug type and calls `ros2 service call` to pause/unpause Gazebo:

```
stopped event  →  ros2 service call /pause_physics std_srvs/srv/Empty {}
continue/next/stepIn/stepOut  →  ros2 service call /unpause_physics std_srvs/srv/Empty {}
```

No proxy process, no modifications to RDE.

## Requirements

- [RDE — Ranch Hand Robotics](https://marketplace.visualstudio.com/items?itemName=Ranch-Hand-Robotics.rde-ros-2) installed and configured
- A sourced ROS 2 environment (`ros2` on `PATH`, or `ROS2.rosSetupScript` set in settings)
- Gazebo running with `pause_physics` / `unpause_physics` services available (`std_srvs/srv/Empty`)

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `ros2SimPause.enabled` | `true` | Enable automatic pause/resume on breakpoints |
| `ros2SimPause.pauseService` | `/pause_physics` | ROS 2 service to pause the simulation |
| `ros2SimPause.unpauseService` | `/unpause_physics` | ROS 2 service to resume the simulation |

The extension automatically reads `ROS2.rosSetupScript` from RDE's configuration to source the environment before calling `ros2 service call`.

## Usage

1. Install the extension.
2. Start a ROS 2 node + Gazebo session and launch a debug session via RDE.
3. Set a breakpoint — Gazebo will pause when execution stops there.
4. Step or continue — Gazebo resumes automatically.

A status bar item (`Sim running` / `Sim paused`) shows the current simulation state while a debug session is active.

## Development

```bash
npm install
npm run build        # one-shot build → dist/extension.js
npm run watch        # incremental watch build with source maps
```

Press `F5` in VS Code to launch the **Extension Development Host** and test against a live RDE session.

## License

MIT
