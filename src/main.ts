import {Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, RsyncPluginSettings, RsyncSettingTab} from "./settings";
import {SyncExecutor} from "./sync-executor";
import {RsyncModal} from "./modal";

export default class RsyncPlugin extends Plugin {
	settings: RsyncPluginSettings = DEFAULT_SETTINGS;
	syncExecutor: SyncExecutor = new SyncExecutor();
	private scheduleIntervalId: number | null = null;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon('sync', 'Rsync', () => {
			new RsyncModal(this.app, this).open();
		});

		this.addSettingTab(new RsyncSettingTab(this.app, this));

		if (this.settings.scheduleInterval > 0) {
			this.scheduleSync();
		}
	}

	onunload() {
		this.clearSchedule();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<RsyncPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);

		// Reschedule if interval changed
		if (this.settings.scheduleInterval > 0) {
			this.scheduleSync();
		} else {
			this.clearSchedule();
		}
	}

	runSync(): void {
		this.syncExecutor.executeSync(this.settings).catch(error => {
			console.error('Sync failed:', error);
		});
	}

	private scheduleSync(): void {
		this.clearSchedule();

		if (this.settings.scheduleInterval > 0) {
			this.scheduleIntervalId = window.setInterval(
				() => this.runSync(),
				this.settings.scheduleInterval * 60 * 1000
			);
			this.registerInterval(this.scheduleIntervalId);
		}
	}

	private clearSchedule(): void {
		if (this.scheduleIntervalId !== null) {
			window.clearInterval(this.scheduleIntervalId);
			this.scheduleIntervalId = null;
		}
	}
}
