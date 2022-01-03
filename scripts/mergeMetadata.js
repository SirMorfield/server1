const fs = require('fs')

var walk = function (dir) {
	var results = [];
	var list = fs.readdirSync(dir);
	list.forEach(function (file) {
		file = dir + '/' + file;
		var stat = fs.statSync(file);
		if (stat && stat.isDirectory()) {
			/* Recurse into a subdirectory */
			results = results.concat(walk(file));
		} else {
			/* Is a file */
			results.push(file);
		}
	});
	return results;
}


function getSafeNewFilePath(filePath, filename, formattedTime, ext) {
	let newFilePath = filePath.replace(filename, `${formattedTime}.${ext}`)
	let i = 1
	while (fs.existsSync(newFilePath)) {
		newFilePath = filePath.replace(filename, `${formattedTime} ${i}.${ext}`)
		i++
	}
	return newFilePath
}

if (!process.argv[2])
	console.log('staging')

const files = walk('.').filter((name) => !name.endsWith('.json') && !name.match('.DS_Store'))
for (const filePath of files) {
	try {
		const metadataPath = filePath + '.json'
		if (!fs.existsSync(metadataPath))
			continue
		const metadata = JSON.parse(fs.readFileSync(metadataPath).toString())
		const d = new Date(parseInt(metadata.photoTakenTime.timestamp * 1000)) // seconds to ms
		const formattedTime = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate() + 1).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}.${String(d.getSeconds()).padStart(2, '0')}`
		const ext = filePath.split('.').pop().toLowerCase()
		const filename = filePath.split('/').pop()
		const newFilePath = getSafeNewFilePath(filePath, filename, formattedTime, ext)
		console.log(filePath, '-->', newFilePath)
		if (process.argv[2]) {
			fs.renameSync(filePath, newFilePath)
			fs.unlinkSync(metadataPath)
		}
	} catch (e) {
		console.log(e)
	}
}
