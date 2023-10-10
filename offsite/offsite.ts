import { spawn } from 'child_process'

const server = process.argv[2]
if (!server) {
	exitWith(`Usage: bun offsite.ts root@1.2.3.4 [staging]`)
}
const staging: boolean = process.argv[3] === 'staging'

const HOME = "/home/joppe"
const BACKUP_DIR = `${HOME}/files`
const SSHCMD="ssh -p 10001"
const REMOTE_MOUNT_PASSWORD = "Misschien1"
const REMOTE_MOUNT_PATH = "/root/files"
const REMOTE_TRASH_DIR = `${REMOTE_MOUNT_PATH}/deleted`
const REMOTE_DRIVE_UUID = "5b328bfd-528f-4e46-9974-5f86ca196011" // Use blkid to find this
const REMOTE_LUKS_NAME = "volume1"
const EXCLUDE = "--exclude={'**/node_modules','**/.DS_Store'}"

while (true) {
	const free = await getDisk('available')
	if (free > 300) break
	const oldestFiles = (await execRemote(`find "${REMOTE_TRASH_DIR}" -type f -printf "%p\\n" | head -n 10`, false)).split('\n').filter(Boolean).sort()
	if (oldestFiles.length === 0) break
	let filesJoined = oldestFiles.reduce((acc, cur) => acc + ' ' + `"${cur}"`, '')
	await execRemote(`rm -rf ${filesJoined}`)
}


// Copy ssd folders to big hdd
await rsyncLocal(`${HOME}/server1/runtimeGenerated`, `${BACKUP_DIR}/sync/server1`)
await rsyncLocal(`${HOME}/git`, `${BACKUP_DIR}/sync`)

await execRemote(`mkdir -p ${REMOTE_MOUNT_PATH}`)
await execRemote(`mkdir -p ${REMOTE_TRASH_DIR}`)

await execRemote(`echo "${REMOTE_MOUNT_PASSWORD}" | cryptsetup luksOpen /dev/disk/by-uuid/${REMOTE_DRIVE_UUID} ${REMOTE_LUKS_NAME} -d=- || true`, false)
await execRemote(`mount /dev/mapper/${REMOTE_LUKS_NAME} ${REMOTE_MOUNT_PATH} || true`, false)
if (await getDisk('size') < 100) {
	exitWith(`Remote disk was not mounted`)
}

await rsyncRemote(`${BACKUP_DIR}`, `${server}:${REMOTE_MOUNT_PATH}`)
await execRemote(`umount ${REMOTE_MOUNT_PATH}`)
await execRemote(`cryptsetup luksClose /dev/mapper/${REMOTE_LUKS_NAME}`)

//
// HELPERS
//
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

async function exec(cmd: string, log = true): Promise<string> {
	return await new Promise((resolve, reject) => {
		if (log) {
			console.log('=======', cmd, '=======')
		}
		if (staging) {
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
			resolve(out)
		})
	})
}

async function execRemote(cmd: string, log = true) {
	return exec(`${SSHCMD} ${server} '${cmd}'`, log)
}

async function rsyncLocal(from: string, to: string) {
	await exec(`rsync --archive --no-links --human-readable --partial --progress --one-file-system --delete-excluded ${EXCLUDE} "${from}" "${to}"`)
}

async function rsyncRemote(from: string, to: string) {
	await exec(`rsync --archive --no-links --human-readable --partial --progress --one-file-system --delete-excluded -e "${SSHCMD}" --backup-dir "${REMOTE_TRASH_DIR}" "${from}" "${to}"`)
}

async function getDisk(type: 'size' | 'available') {
	const fsSizeGbOut = await execRemote(`df -BG ${REMOTE_MOUNT_PATH}`, false)
	const i = type === 'size' ? 1 : 3
	const fsSizeGB = Number(fsSizeGbOut.split('\n')[1].split(' ',).filter(Boolean)[i].replace('G', ''))
	if (!Number.isFinite(fsSizeGB)) {
		exitWith(`Could not get fs size: ${fsSizeGbOut}`)
	}
	return fsSizeGB
}
