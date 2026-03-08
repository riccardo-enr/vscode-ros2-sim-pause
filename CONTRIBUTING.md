# Contributing

Thank you for your interest in contributing! This is a small focused extension, so contributions should stay aligned with its purpose: pausing/resuming Gazebo simulations in sync with VS Code debugger breakpoints.

## Getting started

```bash
git clone https://github.com/riccardo-enr/vscode-ros2-sim-pause
cd vscode-ros2-sim-pause
npm install
```

Press `F5` in VS Code to launch the Extension Development Host for manual testing.

## What to work on

Check the [issues](https://github.com/riccardo-enr/vscode-ros2-sim-pause/issues) for open bugs and feature requests. If you want to add something not listed, open an issue first to discuss it before writing code.

## Development workflow

1. Fork the repo and create a branch:
   - `feat/...` for new features
   - `fix/...` for bug fixes
   - `chore/...` for maintenance
   - `docs/...` for documentation

2. Make your changes in `src/extension.ts` (all extension logic lives there).

3. Build and verify:
   ```bash
   npm run build   # check it compiles
   npm run lint    # check style
   ```

4. Test manually using the `test_ws/` workspace:
   ```bash
   cd test_ws
   colcon build --symlink-install
   source install/setup.bash
   # Press F5 → open test_ws/ in the Extension Development Host → launch the ROS2 debug config
   ```

5. Open a pull request against `main` with a clear description of what changed and why.

## Commit style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`.
Use `!` before `:` for breaking changes (e.g. `feat!: change service API`).

## Code style

- TypeScript, linted with ESLint (`npm run lint`).
- Keep the extension single-file (`src/extension.ts`) unless there is a strong reason to split.
- Prefer minimal changes — avoid refactoring code unrelated to your fix or feature.

## Simulator compatibility

If you are adding or fixing support for a specific Gazebo version, please document the behavior in `README.md` under the [Simulator compatibility](README.md#simulator-compatibility) section.

## License

By contributing you agree that your changes will be licensed under the [MIT License](LICENSE).
