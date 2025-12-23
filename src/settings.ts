import {App, PluginSettingTab, Setting} from "obsidian";
import type RsyncPlugin from "./main";

export interface RsyncPluginSettings {
	rsyncBinaryPath: string;
	remoteIP: string;
	sshPort: number;
	sshUsername: string;
	sshPassword: string;
	privateKeyPath: string;
	localDirPath: string;
	remoteDirPath: string;
	pullPaths: string[];
	dryRun: boolean;
	logFilePath: string;
	excludePatterns: string[];
	scheduleInterval: number;
}

export const DEFAULT_SETTINGS: RsyncPluginSettings = {
	rsyncBinaryPath: '',
	remoteIP: '',
	sshPort: 22,
	sshUsername: '',
	sshPassword: '',
	privateKeyPath: '',
	localDirPath: '',
	remoteDirPath: '',
	pullPaths: [],
	dryRun: false,
	logFilePath: '',
	excludePatterns: [],
	scheduleInterval: 0,
};

export class RsyncSettingTab extends PluginSettingTab {
	plugin: RsyncPlugin;

	constructor(app: App, plugin: RsyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		new Setting(containerEl).setName('Rsync').setHeading();

		new Setting(containerEl)
			.setName('Rsync binary path')
			.setDesc('Path to the rsync binary')
			.addText(text => text
				.setPlaceholder('/usr/bin/rsync')
				.setValue(this.plugin.settings.rsyncBinaryPath)
				.onChange(async (value) => {
					this.plugin.settings.rsyncBinaryPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Remote IP address')
			.setDesc('IP address of the remote machine')
			.addText(text => text
				.setPlaceholder('192.168.1.100')
				.setValue(this.plugin.settings.remoteIP)
				.onChange(async (value) => {
					this.plugin.settings.remoteIP = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('SSH port')
			.setDesc('SSH port to connect to the remote machine')
			.addText(text => text
				.setPlaceholder('22')
				.setValue(this.plugin.settings.sshPort.toString())
				.onChange(async (value) => {
					const port = parseInt(value, 10);
					if (!isNaN(port)) {
						this.plugin.settings.sshPort = port;
						await this.plugin.saveSettings();
					}
				}));

		new Setting(containerEl)
			.setName('SSH username')
			.setDesc('SSH username for remote connection')
			.addText(text => text
				.setPlaceholder('User')
				.setValue(this.plugin.settings.sshUsername)
				.onChange(async (value) => {
					this.plugin.settings.sshUsername = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('SSH password')
			.setDesc('SSH password for remote connection (not recommended, use private key instead)')
			.addText(text => {
				text.inputEl.type = 'password';
				text
					.setPlaceholder('Password')
					.setValue(this.plugin.settings.sshPassword)
					.onChange(async (value) => {
						this.plugin.settings.sshPassword = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Private key path')
			.setDesc('Path to the SSH private key')
			.addText(text => text
				.setPlaceholder('~/.ssh/id_rsa')
				.setValue(this.plugin.settings.privateKeyPath)
				.onChange(async (value) => {
					this.plugin.settings.privateKeyPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Local directory path')
			.setDesc('Directory in the local machine to sync')
			.addText(text => text
				.setPlaceholder('/path/to/vault')
				.setValue(this.plugin.settings.localDirPath)
				.onChange(async (value) => {
					this.plugin.settings.localDirPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Remote directory path')
			.setDesc('Directory in the remote machine to sync')
			.addText(text => text
				.setPlaceholder('/path/to/remote')
				.setValue(this.plugin.settings.remoteDirPath)
				.onChange(async (value) => {
					this.plugin.settings.remoteDirPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Pull paths')
			.setDesc('Paths to pull from remote (comma-separated). These paths will be excluded from push.')
			.addTextArea(textArea => textArea
				.setPlaceholder('Mobile-notes/, shared/')
				.setValue(this.plugin.settings.pullPaths.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.pullPaths = value
						.split(',')
						.map(p => p.trim())
						.filter(p => p.length > 0);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Exclude patterns')
			.setDesc('Patterns to exclude from sync (comma-separated)')
			.addTextArea(textArea => textArea
				.setPlaceholder('*.log, .git/, node_modules/')
				.setValue(this.plugin.settings.excludePatterns.join(', '))
				.onChange(async (value) => {
					this.plugin.settings.excludePatterns = value
						.split(',')
						.map(p => p.trim())
						.filter(p => p.length > 0);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Dry run')
			.setDesc('Perform a trial run with no changes made')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.dryRun)
				.onChange(async (value) => {
					this.plugin.settings.dryRun = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Log file path')
			.setDesc('File to save sync logs (optional)')
			.addText(text => text
				.setPlaceholder('/path/to/rsync.log')
				.setValue(this.plugin.settings.logFilePath)
				.onChange(async (value) => {
					this.plugin.settings.logFilePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Schedule interval')
			.setDesc('Interval for automatic sync in minutes (0 to disable)')
			.addText(text => text
				.setPlaceholder('0')
				.setValue(this.plugin.settings.scheduleInterval.toString())
				.onChange(async (value) => {
					const interval = parseInt(value, 10);
					if (!isNaN(interval) && interval >= 0) {
						this.plugin.settings.scheduleInterval = interval;
						await this.plugin.saveSettings();
					}
				}));
	}
}
