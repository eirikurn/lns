# Ellen Sync

**Ellen Sync**, or `lns` is a command line tool to manage symlinks for syncing files across computers. The files will
live in one place, like Google Drive, Dropbox or a normal git repository but can be symlinked to anywhere on your
computers.

![CI Status](https://img.shields.io/circleci/project/eirikurn/lns.svg?maxAge=2592000)
![npm](https://img.shields.io/npm/v/lns.svg?maxAge=2592000)

> WARNING: Ellen Sync is still in early development. There is already a growing collection of integration tests. But to
be safe, make sure you have periodic backups of your files.

## Setup

First make sure you have [node.js](https://nodejs.org/en/), then open a terminal and run the following to install `lns`.

```bash
npm install -g lns
```

At this point you need to configure the lns **store**, i.e. where `lns` will store the actual files for syncing.

```bash
lns init
```

You can specify any folder as the store. It's up to you to backup or synchronize that folder any way you wish.
The wizard will suggest local Google Drive or Dropbox folders. Git repositories, file-system mounts and rsynced
folders will work just as well.

## Mapping files

After configurin lns, you can map files to the store from anywhere.

```bash
lns map somefile.json somefolder
```

The files are moved to the store and replaced by a symlink. The mapping will be saved in the store so other computers
can set up the same symlink.

## Updating symlinks

After you have mapped files or folders on one machine, you can easily set up corresponding symlinks on another
computer. Assuming you have configured lns on a new computer and synced the store over, just run:

```bash
lns update
```

This will create symlinks for any path in the store which has at least a parent folder on the local machine.

You can see an overview of all mappings with `lns ls`. This also indicates if mappings are symlinked locally or not.

## Dealing with conflicts

There may be conflicts between local files and the store when you run `lns map` or `lns update`. Both of those
commands take a `--ours` and `--theirs` to use either the local or the store version of conflicting files.

Additionally you can run `lns diff <path>` to compare local files with the store.

## Unmapping files

You can remove a mapping with `unmap`. This will remove the symlinks and restore normal files and folders.

```bash
lns unmap somefile.json somefolder
```

It will also update metadata in the store so other computers are unmapped when they `lns update`.
The actual files are still in the store, so symlinks on other computers don't break before they update. 

