import { spawn } from 'child_process'

const server = process.argv[2]
if (!server) {
	exitWith(`Usage: bun offsite.ts root@1.2.3.4 [test]`)
}
const test: boolean = process.argv[3] === 'test'

const HOME = "/home/joppe"
const BACKUP_DIR = `${HOME}/files`
const SSHCMD = "ssh -p 10001"
const REMOTE_MOUNT_PASSWORD = "Misschien1"
const REMOTE_MOUNT_PATH = "/root/files"
const REMOTE_TRASH_DIR = `${REMOTE_MOUNT_PATH}/deleted`
const REMOTE_DRIVE_UUID = "5b328bfd-528f-4e46-9974-5f86ca196011" // Use `ls -l /dev/disk/by-uuid/` to find this
const REMOTE_LUKS_NAME = "volume1"
const EXCLUDE = "--exclude={'**/node_modules','**/.DS_Store'}"


// Copy ssd folders to big hdd
// await rsync('local', `${HOME}/server1/runtimeGenerated`, `${BACKUP_DIR}/sync/server1`)
// await rsync('local', `${HOME}/git`, `${BACKUP_DIR}/sync`)


const deleted = `${HOME}/extended/deleted`
await execOn('local', `mkdir -p ${deleted}`)
await makeRoomOnDisk('local', deleted, 300)
await rsync('local', `${HOME}/files`, `${HOME}/extended`, deleted)

await makeRoomOnDisk('remote', REMOTE_TRASH_DIR, 300)
await execOn('remote', `mkdir -p ${REMOTE_MOUNT_PATH}`)
await execOn('remote', `mkdir -p ${REMOTE_TRASH_DIR}`)

await execOn('remote', `echo "${REMOTE_MOUNT_PASSWORD}" | cryptsetup luksOpen /dev/disk/by-uuid/${REMOTE_DRIVE_UUID} ${REMOTE_LUKS_NAME} -d=- || true`, false)
await execOn('remote', `mount /dev/mapper/${REMOTE_LUKS_NAME} ${REMOTE_MOUNT_PATH} || true`, false)
if (await getDisk('remote', REMOTE_MOUNT_PATH, 'size') < 100) {
	exitWith(`Remote disk was not mounted`)
}

await rsync('remote', `${BACKUP_DIR}`, `${server}:${REMOTE_MOUNT_PATH}`)
await execOn('remote', `umount ${REMOTE_MOUNT_PATH}`)
await execOn('remote', `cryptsetup luksClose /dev/mapper/${REMOTE_LUKS_NAME}`)

//
// HELPERS
//

async function makeRoomOnDisk(location: 'remote' | 'local', path: string, minGB: number) {
	while (true) {
		const free = await getDisk(location, path, 'available')
		if (free >= minGB) break
		const out = await execOn(location, `find "${path}" -type f -printf "%p\\n" | head -n 10`, false)
		const oldestFiles = out.split('\n').filter(Boolean).sort()
		if (oldestFiles.length === 0) break
		let filesJoined = oldestFiles.reduce((acc, cur) => acc + ' ' + `"${cur}"`, '')
		await execOn(location, `rm -rf ${filesJoined}`)
	}
}

function exitWith(msg: string) {
	console.error(msg)
	process.exit(1)
}
function split(string: string): string[] {
	const groupsRegex = /[^\s"']+|(?:"|'){2,}|"(?!")([^"]*)"|'(?!')([^']*)'|"|'/g;
	const matches: string[] = [];
	let match: RegExpExecArray | null;

	while ((match = groupsRegex.exec(string))) {
		if (match[2]) {
			// Single quoted group
			matches.push(match[2]);
		} else if (match[1]) {
			// Double quoted group
			matches.push(match[1]);
		} else {
			// No quote group present
			matches.push(match[0]!);
		}
	}

	return matches;
}

async function exec(cmd: string, log = true, safe = false): Promise<string> {
	return await new Promise((resolve, reject) => {
		if (log) {
			console.log('=======', cmd, '=======')
		}
		if (test && !safe) {
			resolve('')
			return
		}
		const executable = split(cmd)[0]
		const args = split(cmd).slice(1)
		const child = spawn(executable, args)
		let out = ''
		child.stdout.on('data', (data) => {
			if (log) {
				process.stdout.write(data.toString())
			}
			out += data.toString()
		});
		child.stderr.on('data', (data) => {
			if (log) {
				process.stdout.write(data.toString())
			}
			out += data.toString()
		});

		child.on('close', (code) => {
			if (code) exitWith(`Failed executing with error code ${code}\n${cmd}\n${out}`)
			resolve(out)
		})
	})
}

async function execOn(location: 'local' | 'remote', cmd: string, log = true, safe = false) {
	return exec(location === 'remote' ? `${SSHCMD} ${server} '${cmd}'` : cmd, log, safe)
}

async function rsync(location: 'local' | 'remote', from: string, to: string, backupDir?: string) {
	const ssh = location === 'remote' ? `-e "${SSHCMD}"` : ''
	const backup = backupDir ? `--backup-dir "${backupDir}"` : ''
	const exclude = location === 'local' ? EXCLUDE : ''

	return exec(`rsync --archive --no-links --human-readable --partial --progress --one-file-system --delete-excluded ${exclude} ${ssh} ${backup} "${from}" "${to}"`)
}

async function getDisk(location: 'local' | 'remote', path: string, type: 'size' | 'available') {
	const fsSizeGbOut = await execOn(location, `df -BG ${path}`, false, true)
	const i = type === 'size' ? 1 : 3
	const fsSizeGB = Number(fsSizeGbOut?.split('\n')?.[1]?.split(' ',)?.filter(Boolean)?.[i]?.replace('G', ''))
	if (!Number.isFinite(fsSizeGB)) {
		exitWith(`Could not get fs size: ${fsSizeGbOut}`)
	}
	return fsSizeGB
}
