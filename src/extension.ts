import * as vscode from 'vscode';
import { spawn } from 'child_process';

function getConfig() {
    return vscode.workspace.getConfiguration('ros2SimPause');
}

function callRosService(service: string): void {
    const config = getConfig();
    // Reuse RDE's rosSetupScript if available
    const setupScript = vscode.workspace.getConfiguration('ROS2').get<string>('rosSetupScript') ?? '';

    const cmd = setupScript
        ? `source "${setupScript}" && ros2 service call ${service} std_srvs/srv/Empty {}`
        : `ros2 service call ${service} std_srvs/srv/Empty {}`;

    spawn('bash', ['-c', cmd], { detached: true, stdio: 'ignore' }).unref();
}

function pauseGazebo(): void {
    const service = getConfig().get<string>('pauseService') ?? '/pause_physics';
    callRosService(service);
}

function resumeGazebo(): void {
    const service = getConfig().get<string>('unpauseService') ?? '/unpause_physics';
    callRosService(service);
}

export function activate(context: vscode.ExtensionContext): void {
    const output = vscode.window.createOutputChannel('ROS 2 Sim Pause');

    // Status bar item
    const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = '$(debug-alt) Sim';
    statusBar.tooltip = 'ROS 2 Sim Pause';
    context.subscriptions.push(statusBar);

    // Show/hide status bar with debug sessions
    context.subscriptions.push(
        vscode.debug.onDidStartDebugSession(session => {
            if (session.type === 'ros2') {
                statusBar.text = '$(play) Sim running';
                statusBar.show();
            }
        }),
        vscode.debug.onDidTerminateDebugSession(session => {
            if (session.type === 'ros2') {
                // Ensure sim is unpaused when session ends
                resumeGazebo();
                statusBar.hide();
            }
        })
    );

    // DAP tracker — observes all ros2 debug sessions
    const trackerFactory: vscode.DebugAdapterTrackerFactory = {
        createDebugAdapterTracker(session: vscode.DebugSession): vscode.DebugAdapterTracker {
            return {
                onDidSendMessage(msg: unknown): void {
                    const m = msg as { type: string; event?: string };
                    output.appendLine(`[DAP ←] ${JSON.stringify(msg)}`);

                    if (m.type === 'event' && m.event === 'stopped') {
                        if (!getConfig().get<boolean>('enabled')) { return; }
                        output.appendLine('[ros2-sim-pause] Breakpoint hit — pausing Gazebo');
                        pauseGazebo();
                        statusBar.text = '$(debug-pause) Sim paused';
                    }
                },
                onWillReceiveMessage(msg: unknown): void {
                    const m = msg as { type: string; command?: string };
                    output.appendLine(`[DAP →] ${JSON.stringify(msg)}`);

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

    context.subscriptions.push(
        vscode.debug.registerDebugAdapterTrackerFactory('ros2', trackerFactory)
    );

    output.appendLine('ROS 2 Sim Pause activated');
}

export function deactivate(): void {}
