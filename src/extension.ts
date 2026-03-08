import * as vscode from 'vscode';
import { spawn } from 'child_process';

function getConfig() {
    return vscode.workspace.getConfiguration('ros2SimPause');
}

let outputChannel: vscode.OutputChannel = null!;

function callGzService(pause: boolean): void {
    const worldName = getConfig().get<string>('worldName') ?? 'default';
    const service = `/world/${worldName}/control`;
    const req = pause ? 'pause: true' : 'pause: false';

    const cmd = `gz service -s ${service} --reqtype gz.msgs.WorldControl --reptype gz.msgs.Boolean --timeout 1000 --req "${req}"`;

    outputChannel.appendLine(`[ros2-sim-pause] Running: ${cmd}`);

    const proc = spawn('bash', ['-c', cmd], { detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
    proc.stdout?.on('data', (data: Buffer) => outputChannel.appendLine(`[gz] ${data.toString().trim()}`));
    proc.stderr?.on('data', (data: Buffer) => outputChannel.appendLine(`[gz err] ${data.toString().trim()}`));
    proc.on('exit', (code: number | null) => {
        outputChannel.appendLine(`[gz] exit code: ${code}`);
        if (code !== 0) {
            vscode.window.showWarningMessage(
                `ros2-sim-pause: gz service call failed (exit ${code}). Check "ROS 2 Sim Pause" output.`
            );
        }
    });
    proc.unref();
}

function pauseGazebo(): void {
    callGzService(true);
}

function resumeGazebo(): void {
    callGzService(false);
}

export function activate(context: vscode.ExtensionContext): void {
    const output = vscode.window.createOutputChannel('ROS 2 Sim Pause');
    outputChannel = output;

    // Status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = '$(debug-alt) Sim';
    statusBar.tooltip = 'ROS 2 Sim Pause';
    context.subscriptions.push(statusBar);

    // Show/hide status bar with debug sessions
    context.subscriptions.push(
        vscode.debug.onDidStartDebugSession(() => {
            statusBar.text = '$(play) Sim running';
            statusBar.show();
        }),
        vscode.debug.onDidTerminateDebugSession(() => {
            resumeGazebo();
            statusBar.hide();
        })
    );

    // DAP tracker — observes debug sessions
    const trackerFactory: vscode.DebugAdapterTrackerFactory = {
        createDebugAdapterTracker(): vscode.DebugAdapterTracker {
            return {
                onDidSendMessage(msg: unknown): void {
                    const m = msg as { type: string; event?: string };

                    if (m.type === 'event' && m.event === 'stopped') {
                        if (!getConfig().get<boolean>('enabled')) { return; }
                        output.appendLine('[ros2-sim-pause] Breakpoint hit — pausing Gazebo');
                        pauseGazebo();
                        statusBar.text = '$(debug-pause) Sim paused';
                    }
                },
                onWillReceiveMessage(msg: unknown): void {
                    const m = msg as { type: string; command?: string };

                    if (m.type === 'request' &&
                        ['continue', 'next', 'stepIn', 'stepOut'].includes(m.command ?? '')) {
                        if (!getConfig().get<boolean>('enabled')) { return; }
                        output.appendLine('[ros2-sim-pause] Continuing — resuming Gazebo');
                        resumeGazebo();
                        statusBar.text = '$(play) Sim running';
                    }
                }
            };
        }
    };

    // Register tracker for all debug types RDE might use
    for (const debugType of ['ros2', 'cppdbg', 'cppvsdbg', 'debugpy']) {
        context.subscriptions.push(
            vscode.debug.registerDebugAdapterTrackerFactory(debugType, trackerFactory)
        );
    }

    output.appendLine('ROS 2 Sim Pause activated');
}

export function deactivate(): void {}
