import {Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, RsyncPluginSettings, RsyncSettingTab} from "./settings";

export default class RsyncPlugin extends Plugin {
	settings: RsyncPluginSettings = DEFAULT_SETTINGS;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new RsyncSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<RsyncPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
