import {RsyncPluginSettings} from "./settings";

export interface RsyncCommandOptions {
	settings: RsyncPluginSettings;
	operation: 'pull' | 'push';
}

export function buildRsyncCommand(options: RsyncCommandOptions): string {
	const {settings, operation} = options;
	const {
		rsyncBinaryPath,
		remoteIP,
		sshPort,
		sshUsername,
		privateKeyPath,
		sshPassword,
		localDirPath,
		remoteDirPath,
		pullPaths,
		dryRun,
		logFilePath,
		excludePatterns
	} = settings;

	const rsyncBinary = rsyncBinaryPath || 'rsync';
	const parts: string[] = [rsyncBinary];

	// Base rsync options
	parts.push('-avz', '--progress', '--stats', '--no-links', '--delete');

	// SSH options
	let sshCommand = `ssh -p ${sshPort}`;
	if (privateKeyPath) {
		sshCommand += ` -i ${privateKeyPath}`;
	}
	parts.push(`-e "${sshCommand}"`);

	// Build include/exclude patterns based on operation
	if (operation === 'pull') {
		// Pull: only include pullPaths
		for (const path of pullPaths) {
			parts.push(`--include='${path}'`);
		}
		if (pullPaths.length > 0) {
			parts.push(`--exclude='*'`);
		}
	} else {
		// Push: exclude pullPaths
		for (const path of pullPaths) {
			parts.push(`--exclude='${path}'`);
		}
	}

	// User-defined exclude patterns (apply to both operations)
	for (const pattern of excludePatterns) {
		parts.push(`--exclude='${pattern}'`);
	}

	// Dry run
	if (dryRun) {
		parts.push('--dry-run');
	}

	// Log file
	if (logFilePath) {
		parts.push(`--log-file='${logFilePath}'`);
	}

	// Source and destination
	const remoteLocation = sshPassword
		? `sshpass -p '${sshPassword}' ${sshUsername}@${remoteIP}:${remoteDirPath}/`
		: `${sshUsername}@${remoteIP}:${remoteDirPath}/`;

	if (operation === 'pull') {
		parts.push(remoteLocation, `${localDirPath}/`);
	} else {
		parts.push(`${localDirPath}/`, remoteLocation);
	}

	return parts.join(' ');
}

export interface SyncProgress {
	percentage: number;
	operation: 'pull' | 'push';
}

export type ProgressCallback = (progress: SyncProgress) => void;
