import fs, { mkdir } from 'fs'
import { execSync } from 'child_process'

const downloadedTorrentsPath = 'downloaded/'
const compressedPath = 'films_compressed/'
const originalPath = 'films_original/'
const deliveryPath = 'films_delivery/'
const filmFileExtensions = ['.mp4', '.mkv']


const staging = !process.argv[2]
console.log(staging ? 'STAGING' : 'REAL')

const safe = {
	copyFileSync: (src: string, dst: string) => {
		console.log('COPY  \t', src, '-->\n     \t', dst)
		if (!staging)
			fs.copyFileSync(src, dst)
	},
	execSync: (cmd: string) => {
		console.log('EXEC  \t', cmd)
		if (!staging)
			execSync(cmd)
	},
	mkdirSync: (path: string, opt: fs.MakeDirectoryOptions) => {
		console.log('MKDIR \t', path)
		if (!staging)
			fs.mkdirSync(path, opt)
	},
	renameSync: (src: string, dst: string) => {
		console.log('RENAME\t', src, '-->', dst)
		if (!staging)
			fs.renameSync(src, dst)
	},
}

function baseName(path: string) {
	return path.split('/').at(-1)
}

function renameRecursive(oldPath: string, newPath: string) {
	if (newPath.includes('/')) {
		const newDirs = newPath.split('/').slice(0, -1).join('/')
		// console.log('newDirs', newPath, newDirs)
		if (!fs.existsSync(newDirs))
			safe.mkdirSync(newDirs, { recursive: true })
	}
	safe.renameSync(oldPath, newPath)
}

function copySafe(oldPath: string, newPath: string) {
	const newDirs = newPath.split('/').slice(0, -1).join('/')
	// console.log('newDirs', newPath, newDirs)
	if (!fs.existsSync(newDirs))
		safe.mkdirSync(newDirs, { recursive: true })
	safe.copyFileSync(oldPath, newPath)
}

function walk(dir: string): string[] {
	let results: string[] = []
	let list = fs.readdirSync(dir)
	for (let file of list) {
		file = dir + '/' + file
		let stat = fs.statSync(file)
		if (stat && stat.isDirectory()) // Recurse into a subdirectory
			results = results.concat(walk(file))
		else // Is a file
			results.push(file);
	}
	return results
}

function getSmallestPath(path1: string, path2: string): string | null {
	if (!fs.existsSync(path1))
		return fs.existsSync(path2) ? path2 : null
	if (!fs.existsSync(path2))
		return fs.existsSync(path1) ? path1 : null
	const size1 = (fs.statSync(path1)).size
	const size2 = (fs.statSync(path2)).size
	return size1 < size2 ? path1 : path2
}

function isDir(path: string) {
	return fs.statSync(path).isDirectory()
}

function isFilmFile(path: string) {
	if (path.startsWith('.'))
		return false
	const stat = fs.statSync(path)
	if (stat.isDirectory() || stat.size <= 4096)
		return false
	for (const ext of filmFileExtensions)
		if (path.endsWith(ext))
			return true
	return false
}

function getFilmFileInDir(dir: string): string | null {
	const files = walk(dir)
	const films = files.filter(f => isFilmFile(f))
	if (!films.length)
		return null
	const sizes = films.map(film => ({ path: film, size: (fs.statSync(film).size) }))
	const biggest = sizes.sort((a, b) => b.size - a.size)[0]
	return biggest.path
}

function mergeAndCopy(filmDir: string) {
	const files = walk(filmDir)
	const filmFilePath = getFilmFileInDir(filmDir)
	if (!filmFilePath) {
		// console.log('NOFILM\t', filmDir)
		return
	}
	const filmFileName = filmFilePath.split('/').at(-1)
	if (fs.existsSync(originalPath + filmFileName)) {
		console.log('SKIP  \t', filmFilePath)
		return
	}
	const srts = files.filter(file => file.endsWith('.srt'))
	if (!srts.length)
		copySafe(filmFilePath, originalPath + filmFileName)
	else
		safe.execSync(`mkvmerge -o ${deliveryPath + filmFileName} ${filmFilePath} ${srts}`) // TODO

}

// executing part

const torrents = fs.readdirSync(downloadedTorrentsPath).filter(f => !f.startsWith('.'))
// console.log('torrents', torrents)
for (const torrentFile of torrents) {
	if (isFilmFile(downloadedTorrentsPath + torrentFile) && !fs.existsSync(originalPath + torrentFile))
		copySafe(downloadedTorrentsPath + torrentFile, originalPath + torrentFile)
	if (isDir(downloadedTorrentsPath + torrentFile))
		mergeAndCopy(downloadedTorrentsPath + torrentFile)
}
console.log('\n')
const originalFilmFiles = fs.readdirSync(originalPath).filter(f => isFilmFile(originalPath + f))
console.log('originals', originalFilmFiles)
for (const originalFilmFile of originalFilmFiles) {
	const compressedFilmPath = compressedPath + originalFilmFile
	if (fs.existsSync(compressedFilmPath)) {
		console.log('SKIP \t', originalFilmFile)
		continue
	}
	safe.execSync(`ffmpeg -vcodec h264 -i '${originalPath + originalFilmFile}' '${compressedFilmPath}'`)
}

for (const originalFilmPath of originalFilmFiles) {
	const compressedFilmPath = originalFilmPath.replace(originalPath, compressedPath)
	const smallest = getSmallestPath(originalFilmPath, compressedFilmPath)
	if (!smallest)
		continue
	const newPath = deliveryPath + smallest.split('/').slice(1).join('/')
	renameRecursive(smallest, newPath)
}
