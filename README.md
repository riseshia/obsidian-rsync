# Obsidian Rsync Plugin

Sync your Obsidian vault with remote servers using rsync over SSH. This plugin enables bidirectional synchronization between your local vault and a remote server, with support for selective sync paths and automated scheduling.

## Features

- **Bidirectional sync**: Push local changes to remote and pull remote changes to local
- **Selective sync**: Configure specific paths to be pull-only while pushing everything else
- **Scheduled sync**: Automatic synchronization at configurable intervals
- **SSH authentication**: Support for both private key and password authentication
- **WSL support**: Automatic path conversion for Windows Subsystem for Linux
- **Dry-run mode**: Test synchronization without making actual changes
- **Exclude patterns**: Skip specific files or directories from sync
- **SSH host key auto-acceptance**: Automatically accept new SSH host keys for seamless setup

## Requirements

- **Desktop only**: This plugin requires rsync and SSH, which are not available on mobile devices
- **rsync binary**: Must be installed on your system (usually pre-installed on macOS/Linux, available via WSL on Windows)
- **SSH access**: Remote server must have SSH enabled and rsync installed

## Installation

### From Obsidian Community Plugins

1. Open **Settings → Community plugins**
2. Select **Browse** and search for "Rsync"
3. Select **Install** and then **Enable**

### Manual installation

1. Download the latest release files (`main.js`, `manifest.json`, `styles.css`)
2. Create a folder named `obsidian-rsync` in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into the folder
4. Reload Obsidian and enable the plugin in **Settings → Community plugins**

## Usage

### Initial setup

1. Open **Settings → Rsync**
2. Configure your connection settings:
   - **Remote IP address**: IP or hostname of your remote server
   - **SSH port**: Default is 22
   - **SSH username**: Your SSH username
   - **Private key path**: Path to your SSH private key (recommended)
   - **SSH password**: Alternative to private key (not recommended for security)
3. Configure sync paths:
   - **Local directory path**: Use the **Use vault path** button to automatically set your vault path
   - **Remote directory path**: Absolute path on the remote server

### Running sync

Click the sync icon in the ribbon or use the **Run sync** button in settings. The plugin will:

1. Pull changes from remote for paths configured in **Pull paths**
2. Push local changes to remote (excluding pull-only paths)

### Selective sync with pull paths

Use the **Pull paths** setting to specify directories that should only sync from remote to local. For example:

```
Mobile-notes/, shared/
```

These paths will be:
- Pulled from remote to local during sync
- Excluded from push operations (local changes won't overwrite remote)

This is useful for syncing notes created on mobile devices or by other systems without overwriting them from your desktop.

### Automatic sync

Enable scheduled synchronization by setting **Schedule interval** to a value greater than 0 (in minutes). The plugin will automatically sync at the specified interval.

### Exclude patterns

Add patterns to **Exclude patterns** to skip specific files or folders:

```
*.log, .git/, node_modules/, .obsidian/workspace.json
```

## Settings reference

### Connection

- **Rsync binary path**: Custom path to rsync binary (optional, defaults to system rsync)
- **Remote IP address**: IP or hostname of remote server
- **SSH port**: SSH port number (default: 22)
- **SSH username**: Username for SSH connection
- **SSH password**: Password authentication (not recommended, use private key instead)
- **Private key path**: Path to SSH private key file (recommended, e.g., `~/.ssh/id_rsa`)
- **Local directory path**: Local vault directory
- **Remote directory path**: Remote server directory

### Sync

- **Pull paths**: Comma-separated paths to pull from remote (excluded from push)
- **Exclude patterns**: Comma-separated patterns to exclude from all operations

### Advanced

- **Dry run**: Simulate sync without making changes (for testing)
- **Log file path**: Optional file to save sync logs
- **Schedule interval**: Minutes between automatic syncs (0 to disable)

## Security considerations

- **Private key authentication**: Use SSH key-based authentication instead of passwords
- **SSH host keys**: The plugin automatically accepts new SSH host keys (`StrictHostKeyChecking=accept-new`). Ensure you trust the remote server on first connection
- **Password storage**: If using password authentication, passwords are stored in Obsidian's plugin data (not encrypted). Use private keys for better security
- **Network access**: This plugin requires network access to connect to remote servers via SSH
- **Local file access**: The plugin reads and writes files in your vault directory

## Troubleshooting

### rsync command not found

Install rsync on your system:
- **macOS**: Pre-installed
- **Linux**: `sudo apt install rsync` or `sudo yum install rsync`
- **Windows**: Install via WSL and set **Rsync binary path** to `wsl rsync`

### SSH connection fails

- Verify remote server is accessible: `ssh user@remote-ip`
- Check SSH port is correct
- Ensure private key has correct permissions: `chmod 600 ~/.ssh/id_rsa`
- Review sync logs if **Log file path** is configured

### Sync not running automatically

- Verify **Schedule interval** is greater than 0
- Check Obsidian is running (sync won't run if app is closed)
- Look for error messages in the developer console (**View → Toggle Developer Tools**)

### Path issues on Windows

If using WSL rsync on Windows, the plugin automatically converts Windows paths to WSL mount paths. Ensure:
- **Rsync binary path** includes `wsl` (e.g., `wsl rsync`)
- Paths use standard Windows format (`C:\Users\...`)

## Development

### Build from source

```bash
npm install
npm run build
```

### Development mode

```bash
npm run dev
```

This starts a watch mode that automatically rebuilds on file changes.

## License

MIT

## Support

Report issues at [GitHub Issues](https://github.com/riseshia/obsidian-rsync/issues)
