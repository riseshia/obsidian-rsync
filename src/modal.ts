import {App, Modal, Setting} from 'obsidian';
import type RsyncPlugin from './main';

export class RsyncModal extends Modal {
	plugin: RsyncPlugin;
	pullProgressBar: HTMLProgressElement | null = null;
	pushProgressBar: HTMLProgressElement | null = null;
	settingsContainer: HTMLElement | null = null;

	constructor(app: App, plugin: RsyncPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen(): void {
		const {contentEl} = this;
		contentEl.empty();

		contentEl.createEl('h2', {text: 'Rsync'});

		// Progress section
		this.createProgressSection(contentEl);

		// Sync button
		new Setting(contentEl)
			.setName('')
			.addButton(button => button
				.setButtonText('Start sync')
				.onClick(() => this.startSync())
			);

		// Settings toggle
		this.createSettingsToggle(contentEl);
	}

	onClose(): void {
		const {contentEl} = this;
		contentEl.empty();
	}

	private createProgressSection(containerEl: HTMLElement): void {
		const progressContainer = containerEl.createDiv({cls: 'rsync-progress-container'});

		// Pull progress
		const pullSection = progressContainer.createDiv({cls: 'rsync-progress-section'});
		pullSection.createEl('div', {text: 'Pull progress:', cls: 'rsync-progress-label'});
		this.pullProgressBar = pullSection.createEl('progress', {
			attr: {max: '100', value: '0'},
			cls: 'rsync-progress-bar'
		});

		// Push progress
		const pushSection = progressContainer.createDiv({cls: 'rsync-progress-section'});
		pushSection.createEl('div', {text: 'Push progress:', cls: 'rsync-progress-label'});
		this.pushProgressBar = pushSection.createEl('progress', {
			attr: {max: '100', value: '0'},
			cls: 'rsync-progress-bar'
		});
	}

	private createSettingsToggle(containerEl: HTMLElement): void {
		const toggleButton = containerEl.createEl('button', {
			text: 'Show more',
			cls: 'rsync-settings-toggle'
		});

		this.settingsContainer = containerEl.createDiv({cls: 'rsync-settings-container rsync-settings-hidden'});

		let settingsVisible = false;

		toggleButton.onclick = () => {
			settingsVisible = !settingsVisible;
			if (this.settingsContainer) {
				if (settingsVisible) {
					this.settingsContainer.removeClass('rsync-settings-hidden');
				} else {
					this.settingsContainer.addClass('rsync-settings-hidden');
				}
			}
			toggleButton.setText(settingsVisible ? 'Hide' : 'Show more');
		};

		this.createQuickSettings(this.settingsContainer);
	}

	private createQuickSettings(containerEl: HTMLElement): void {
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
			.setName('Pull paths')
			.setDesc('Paths to pull from remote (comma-separated)')
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
	}

	private startSync(): void {
		// Reset progress bars
		if (this.pullProgressBar) {
			this.pullProgressBar.value = 0;
		}
		if (this.pushProgressBar) {
			this.pushProgressBar.value = 0;
		}

		// Execute sync with progress callbacks
		this.plugin.syncExecutor.executeSync(
			this.plugin.settings,
			(progress) => {
				if (progress.operation === 'pull' && this.pullProgressBar) {
					this.pullProgressBar.value = progress.percentage;
				} else if (progress.operation === 'push' && this.pushProgressBar) {
					this.pushProgressBar.value = progress.percentage;
				}
			}
		).catch(error => {
			console.error('Sync failed:', error);
		});
	}
}
