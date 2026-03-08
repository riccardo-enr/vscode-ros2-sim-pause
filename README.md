# vscode-ros2-sim-pause

A VS Code extension that **automatically pauses a Gazebo simulation when a debugger breakpoint is hit** and resumes it when execution continues.

Works as a companion to **[RDE (Ranch Hand Robotics)](https://marketplace.visualstudio.com/items?itemName=Ranch-Hand-Robotics.rde-ros-2)** — the ROS 2 debugger for VS Code.

> **Tested with**: Gz Sim 8.x (Gz Harmonic). Other Gazebo versions may require different service names — see [Simulator compatibility](#simulator-compatibility).

## Goal

The primary goal of this extension is to provide seamless Gazebo simulation pause/resume functionality during ROS 2 debugging sessions in VS Code.

Long-term, the intent is to contribute this functionality directly to [RDE (Ranch Hand Robotics)](https://github.com/Ranch-Hand-Robotics/rde-ros-2) so that users get it out of the box without a separate extension. This project serves as a proof of concept and reference implementation for that upstream contribution.

## Why

When debugging a ROS 2 node mid-simulation the world keeps running while you inspect code at a breakpoint. Sensor data drifts, the robot moves, and it becomes hard to reason about what the node was actually seeing at the moment execution paused.

This extension freezes the simulated world in sync with the debugger.

## How it works

VS Code exposes `DebugAdapterTrackerFactory` — a lightweight observer that intercepts DAP messages from a running debug session without replacing the adapter. This extension hooks into RDE's `ros2` debug type and calls `ros2 service call` to pause/unpause Gazebo:

```
stopped event  →  ros2 service call <pauseService> ...
continue/next/stepIn/stepOut  →  ros2 service call <unpauseService> ...
```

No proxy process, no modifications to RDE.

## Requirements

- [RDE — Ranch Hand Robotics](https://marketplace.visualstudio.com/items?itemName=Ranch-Hand-Robotics.rde-ros-2) installed and configured
- A sourced ROS 2 environment (`ros2` on `PATH`, or `ROS2.rosSetupScript` set in settings)
- Gazebo running and reachable via `ros2 service call`
- **Gz Harmonic**: `ros_gz_bridge` must be running to expose the world control service over ROS 2 (see [Simulator compatibility](#simulator-compatibility))

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `ros2SimPause.enabled` | `true` | Enable automatic pause/resume on breakpoints |
| `ros2SimPause.pauseService` | `/pause_physics` | ROS 2 service to pause the simulation |
| `ros2SimPause.unpauseService` | `/unpause_physics` | ROS 2 service to resume the simulation |

The extension automatically reads `ROS2.rosSetupScript` from RDE's configuration to source the environment before calling `ros2 service call`.

## Simulator compatibility

### Gz Harmonic (Gz Sim 8.x) — tested

Gz Harmonic does not expose `/pause_physics` / `/unpause_physics`. Simulation control goes through the `ros_gz_bridge` using `ros_gz_interfaces/srv/ControlWorld`. You need a bridge node running and the service names will follow the world name:

```bash
# Find the available world control services
ros2 service list | grep control
```

Typical service paths (replace `<world>` with your world name, e.g. `default`):

```
/world/<world>/pause    # ros_gz_interfaces/srv/ControlWorld  (pause: true)
/world/<world>/resume   # ros_gz_interfaces/srv/ControlWorld  (pause: false)
```

Set in `settings.json`:
```json
"ros2SimPause.pauseService": "/world/default/pause",
"ros2SimPause.unpauseService": "/world/default/resume"
```

> The message type also differs from `std_srvs/srv/Empty` — see the open issue for progress on making the service type configurable.

### Gazebo Classic — untested

The default `/pause_physics` / `/unpause_physics` (`std_srvs/srv/Empty`) are the Gazebo Classic service names provided by `gazebo_ros`. The defaults should work out of the box, but have not been tested.

## Usage

1. Install the extension.
2. Start a ROS 2 node + Gazebo session and launch a debug session via RDE.
3. Set a breakpoint — Gazebo will pause when execution stops there.
4. Step or continue — Gazebo resumes automatically.

A status bar item (`Sim running` / `Sim paused`) shows the current simulation state while a debug session is active.

## Test workspace

A minimal ROS 2 workspace for end-to-end testing lives in [`test_ws/`](test_ws/). It contains:

| Component | Description |
|-----------|-------------|
| `test_node` | Simple 1 Hz counter — set a breakpoint in the loop |
| `pause_shim` | Exposes `/pause_physics` and `/unpause_physics` (`std_srvs/Empty`), forwards to `/world/<world>/control` |
| `test.launch.py` | Launches Gz Sim + `ros_gz_bridge` + `pause_shim` + `test_node` |
| `.vscode/launch.json` | RDE debug configuration targeting `test_node` |

```bash
cd test_ws
colcon build --symlink-install
source install/setup.bash
# then press F5 in the extension repo to open the Extension Development Host,
# open test_ws/ in that window, and launch the ROS2 debug config
```

## Development

```bash
npm install
npm run build        # one-shot build → dist/extension.js
npm run watch        # incremental watch build with source maps
```

Press `F5` in VS Code to launch the **Extension Development Host** and test against a live RDE session.

## License

MIT
