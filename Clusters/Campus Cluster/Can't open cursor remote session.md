
# Can’t open Cursor remote session (Campus Cluster)

When Cursor’s Remote-SSH connection to Campus Cluster suddenly stops working, the failure is often not “SSH is broken,” but “Cursor can’t write its remote server into `$HOME` anymore.” The log usually includes an error like `Disk quota exceeded` while creating `~/.cursor-server/bin/...`, and it may also print misleading lines like `Quota not enabled`. The reliable fix is to move Cursor’s remote server install directory off of home (typically onto `/scratch`) and either symlink `~/.cursor-server` to that location or tell Cursor to install the server there directly.

## Symptoms (what you’ll see)

Cursor Remote-SSH fails during “installing server.” The log usually includes `Error creating server install directory ... ~/.cursor-server/bin/...` and `Disk quota exceeded`. You may also see repeated `quota: ... Quota not enabled`, which is typically just the quota-reporting tool failing (not the actual reason Cursor can’t install).

## Quick fix (recommended): symlink `~/.cursor-server` to scratch

1) SSH to the cluster normally (terminal, not Cursor):

```bash
ssh $USER@cc-login.campuscluster.illinois.edu
```

2) Remove the broken Cursor server install in home:

```bash
rm -rf ~/.cursor-server
```

3) Create a per-user directory on scratch and symlink it back to `~/.cursor-server`.

If `/scratch/$USER` exists:

```bash
mkdir -p /scratch/$USER/cursor-server
ln -s /scratch/$USER/cursor-server ~/.cursor-server
```

If your scratch path is instead under `/scratch/users/$USER`:

```bash
mkdir -p /scratch/users/$USER/cursor-server
ln -s /scratch/users/$USER/cursor-server ~/.cursor-server
```

4) Retry the Remote-SSH connection from Cursor.

5) Sanity-check (optional):

```bash
ls -ld ~/.cursor-server
```

You should see `~/.cursor-server` pointing at your scratch directory, and the scratch directory should be owned by you.

## Optional: also relocate VS Code Remote installs (if you use them)

If you also use VS Code Remote-SSH on the cluster, moving that server directory to scratch can avoid similar failures:

```bash
rm -rf ~/.vscode-server
mkdir -p /scratch/$USER/vscode-server
ln -s /scratch/$USER/vscode-server ~/.vscode-server
```

If your scratch path is under `/scratch/users/$USER`, use that instead of `/scratch/$USER`.

## Alternative fix: set Cursor’s server install path (no symlink)

Instead of symlinks, you can tell Cursor where to install its remote server. In Cursor Settings (JSON), set a host-specific install path:

```json
"remote.SSH.serverInstallPath": {
  "cc-login.campuscluster.illinois.edu": "/scratch/<NETID>/cursor-server"
}
```

Replace `<NETID>` with your cluster username (or use the exact scratch path that exists for you).

## If it still fails

If Cursor still errors after relocating `~/.cursor-server`, the remaining issues are usually one of: permissions on the scratch directory, a missing symlink target, or a conflicting install-path setting. Grab (1) the last ~20 lines of Cursor’s Remote-SSH log and (2) the output of:

```bash
ls -ld ~/.cursor-server /scratch/$USER/cursor-server
```

and debug from there.
