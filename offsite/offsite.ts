import { spawn } from 'child_process'

const server = process.argv[2]
if (!server) {
	exitWith(`Usage: bun offsite.ts root@1.2.3.4 [test]`)
}
const test = process.argv[3] === 'test'

const HOME = "/home/joppe"
const BACKUP_DIR = `${HOME}/files`

// Copy ssd folders to big hdd
// await rsync(`${HOME}/server1/runtimeGenerated`, `${BACKUP_DIR}/sync/server1`)
// 	.catch(() => console.log('Failed to sync server1'))

await rsync(`${HOME}/git`, `${BACKUP_DIR}/sync`)
	.catch(() => console.log('Failed to sync git'))

await restic(`${HOME}/extended/restic`, `${HOME}/files`)
	.catch(() => console.log('Failed to backup files'))

// helpers
async function makeRoomOnDisk(path: string, minGB: number, sshCmd: string | undefined = undefined) {
	while (true) {
		const free = await getDisk(path, 'available', sshCmd)
		if (free >= minGB) break
		const out = await exec(`${sshCmd ?? ''} find "${path}" -type f -printf "%p\\n" | head -n 10`, false)
		const oldestFiles = out.split('\n').filter(Boolean).sort()
		if (oldestFiles.length === 0) break
		let filesJoined = oldestFiles.reduce((acc, cur) => acc + ' ' + `"${cur}"`, '')
		await exec(`${sshCmd ?? ''} rm -rf ${filesJoined}`)
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
	return await new Promise(resolve => {
		if (log) {
			console.log(`=======\n${cmd}\n=======`)
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

async function rsync(from: string, to: string) {
	// TODO: --exclude-from= is not working
	return exec(`rsync --exclude-from='${HOME + '/server1/offsite/ignore.txt'}' --archive --no-links --human-readable --partial --progress --one-file-system --delete-excluded "${from}" "${to}"`)
}

async function restic(repoPath: string, directory: string) {
	return exec(`restic -r ${repoPath} --password-file ${HOME}/server1/restic/password.txt --verbose backup ${directory}`)
}

async function getDisk(path: string, type: 'size' | 'available', sshCmd: string | undefined = undefined) {
	const fsSizeGbOut = await exec(`${sshCmd ?? ''} df -BG ${path}`, false, true)
	const i = type === 'size' ? 1 : 3
	const fsSizeGB = Number(fsSizeGbOut?.split('\n')?.[1]?.split(' ',)?.filter(Boolean)?.[i]?.replace('G', ''))
	if (!Number.isFinite(fsSizeGB)) {
		exitWith(`Could not get fs size: ${fsSizeGbOut}`)
	}
	return fsSizeGB
}
