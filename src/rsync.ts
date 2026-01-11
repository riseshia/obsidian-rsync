import {RsyncPluginSettings} from "./settings";

export interface RsyncCommandOptions {
	settings: RsyncPluginSettings;
	operation: 'pull' | 'push' | 'force-push';
}

function convertWindowsPathToWSL(path: string): string {
	// Convert Windows path (C:\Users\...) to WSL mount path (/mnt/c/Users/...)
	const windowsPathRegex = /^([A-Za-z]):[/\\]/;
	const match = path.match(windowsPathRegex);

	if (match?.[1]) {
		const driveLetter = match[1].toLowerCase();
		const remainingPath = path.slice(2).replace(/\\/g, '/');
		return `/mnt/${driveLetter}${remainingPath}`;
	}

	return path;
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

	// Check if we're using WSL rsync and need to convert paths
	const isWSLRsync = rsyncBinary.toLowerCase().includes('wsl');

	// Base rsync options
	parts.push('-avz', '--progress', '--stats', '--no-links', '--delete', '--no-perms', '--no-group', '--no-owner');

	// SSH options
	let sshCommand = `ssh -p ${sshPort} -o StrictHostKeyChecking=accept-new`;
	if (privateKeyPath) {
		const keyPath = isWSLRsync ? convertWindowsPathToWSL(privateKeyPath) : privateKeyPath;
		sshCommand += ` -i ${keyPath}`;
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
	} else if (operation === 'push') {
		// Push: exclude pullPaths
		for (const path of pullPaths) {
			parts.push(`--exclude='${path}'`);
		}
	}
	// force-push: no pullPaths exclusion - overwrites everything

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
		const logPath = isWSLRsync ? convertWindowsPathToWSL(logFilePath) : logFilePath;
		parts.push(`--log-file='${logPath}'`);
	}

	// Source and destination
	const remoteLocation = sshPassword
		? `sshpass -p '${sshPassword}' ${sshUsername}@${remoteIP}:${remoteDirPath}/`
		: `${sshUsername}@${remoteIP}:${remoteDirPath}/`;

	// Convert local path if using WSL
	const localPath = isWSLRsync ? convertWindowsPathToWSL(localDirPath) : localDirPath;

	if (operation === 'pull') {
		parts.push(remoteLocation, `${localPath}/`);
	} else {
		parts.push(`${localPath}/`, remoteLocation);
	}

	return parts.join(' ');
}

export interface SyncProgress {
	percentage: number;
	operation: 'pull' | 'push';
}

export type ProgressCallback = (progress: SyncProgress) => void;
