(async () => {
	const fs = require('fs').promises
	const files = await fs.readdir(__dirname)

	async function rename(file, regex, newStr, rename) {
		if (file == __filename) return null

		const stat = await fs.lstat(file);
		if (stat.isDirectory()) file = file + '/'
		let newName = file.replace(regex, newStr)
		if (newName !== file) {
			if (rename) await fs.rename(file, newName)
			return [file, newName]
		}
	}

	let todo = []

	const flags = process.argv[2].replace(/.*\/([gimy]*)$/, '$1');
	const pattern = process.argv[2].replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
	const regex = new RegExp(pattern, flags);

	const newStr = process.argv[3]
	const proceedRename = process.argv[4]
	for (let file of files) {
		todo.push(rename(file, regex, newStr, proceedRename))
	}

	let changes = await Promise.all(todo)
	changes = changes.filter((change) => change != null)
	if (changes.length == 0) return

	let longestName = changes.sort((a, b) => b[0].length - a[0].length)
	longestName = longestName[0][0].length
	changes = changes.map((file) => [file[0].padEnd(longestName, ' '), file[1]])

	for (const change of changes) {
		console.log(`${change[0]}  ${change[1]}`)
	}
})()

