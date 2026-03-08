# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

VS Code extension that automatically pauses/resumes a Gazebo simulation when the debugger hits a breakpoint. Companion to the RDE (Ranch Hand Robotics) ROS 2 debugger extension.

## Build commands

```bash
npm install              # install dependencies
npm run build            # production build → dist/extension.js (esbuild, minified)
npm run watch            # incremental dev build with source maps
npm run lint             # eslint src/
```

Press F5 in VS Code to launch the Extension Development Host for manual testing.

## Architecture

Single-file extension: all logic lives in `src/extension.ts`.

- **Activation**: triggered by `onDebug` event
- **DAP tracker**: uses `DebugAdapterTrackerFactory` to observe DAP messages (not replace the adapter). Registered for debug types: `ros2`, `cppdbg`, `cppvsdbg`, `debugpy`
- **Pause/resume**: on `stopped` event → calls `gz service` CLI to pause; on `continue`/`next`/`stepIn`/`stepOut` request → calls `gz service` to resume
- **Gazebo communication**: spawns `bash -c "gz service ..."` with detached process (`proc.unref()`). Uses Gz transport directly (not ROS 2 services)
- **Status bar**: shows `Sim running` / `Sim paused` during active debug sessions
- **Configuration**: `ros2SimPause.enabled` (bool) and `ros2SimPause.worldName` (string, used to build `/world/<name>/control` service path)

## Bundling

esbuild bundles to CJS (`dist/extension.js`), `vscode` is external. No test framework is set up.

## Test workspace

`test_ws/` contains a minimal ROS 2 workspace for end-to-end testing (colcon-based, with a test node and Gazebo launch file). Not part of the extension package.
