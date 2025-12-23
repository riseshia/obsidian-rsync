import {exec, ChildProcess} from 'child_process';
import {Notice} from 'obsidian';
import {buildRsyncCommand, ProgressCallback} from './rsync';
import {RsyncPluginSettings} from './settings';

export class SyncExecutor {
	private currentProcess: ChildProcess | null = null;

	async executeSync(
		settings: RsyncPluginSettings,
		progressCallback?: ProgressCallback
	): Promise<void> {
		// Execute pull first, then push
		await this.executePull(settings, progressCallback);
		await this.executePush(settings, progressCallback);
	}

	private async executePull(
		settings: RsyncPluginSettings,
		progressCallback?: ProgressCallback
	): Promise<void> {
		if (settings.pullPaths.length === 0) {
			return; // Skip pull if no pull paths configured
		}

		const command = buildRsyncCommand({settings, operation: 'pull'});
		console.debug('[Rsync:Pull]', command);
		await this.runCommand(command, 'pull', progressCallback);
	}

	private async executePush(
		settings: RsyncPluginSettings,
		progressCallback?: ProgressCallback
	): Promise<void> {
		const command = buildRsyncCommand({settings, operation: 'push'});
		console.debug('[Rsync:Push]', command);
		await this.runCommand(command, 'push', progressCallback);
	}

	private runCommand(
		command: string,
		operation: 'pull' | 'push',
		progressCallback?: ProgressCallback
	): Promise<void> {
		return new Promise((resolve, reject) => {
			this.currentProcess = exec(
				command,
				{
					encoding: 'utf8',
					maxBuffer: 10 * 1024 * 1024, // 10MB buffer
					timeout: 5 * 60 * 1000, // 5 minute timeout
				},
				(error, stdout, stderr) => {
					this.currentProcess = null;

					if (error) {
						console.error(`[Rsync:${operation}] Error:`, error.message);
						if (stderr) console.error(`[Rsync:${operation}] stderr:`, stderr);
						new Notice(`Rsync ${operation} failed: ${stderr || error.message}`);
						reject(error);
					} else {
						console.debug(`[Rsync:${operation}] Completed`);
						new Notice(`Rsync ${operation} completed`);
						progressCallback?.({percentage: 100, operation});
						resolve();
					}
				}
			);

			if (this.currentProcess.stdout) {
				this.currentProcess.stdout.on('data', (data: string) => {
					// Try to extract percentage from rsync output
					const match = data.match(/(\d+)%/);
					if (match?.[1] && progressCallback) {
						const percentage = parseInt(match[1], 10);
						progressCallback({percentage, operation});
					}
				});
			}
		});
	}

	cancel(): void {
		if (this.currentProcess) {
			this.currentProcess.kill();
			this.currentProcess = null;
			new Notice('Rsync cancelled');
		}
	}
}
