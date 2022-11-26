const { execSync } = require('child_process')
const fs = require('fs')
const root = '/youtube'

const likes = (fs.readFileSync(`${root}/Liked videos.csv`)).toString().split('\n')

fs.mkdirSync(`${root}/videos/`, { recursive: true })
const alreadyDownloaded = fs.readdirSync(`${root}/videos/`).map(file => file.split(' ').at(-1).split('.')[0])

const ignoreBefore = 2017
let urls = []
for (const like of likes) {
	if (!like.match(/^.*\,\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d\ UTC$/))
		continue

	let [id, date] = like.split(',')
	id = id.trim() // .trim() because the csv sometimes prefixes id with a space id
	if ((new Date(date)).getFullYear() < ignoreBefore)
		continue
	if (alreadyDownloaded.includes(id))
		continue

	urls.push(`https://www.youtube.com/watch?v=${id}`)
}

console.log('\n')
console.log(`Already downloaded ${alreadyDownloaded.length} videos`)
console.log(`Ignored            ${likes.length - urls.length} videos from before ${ignoreBefore}`)
console.log(`Downloading        ${urls.length} videos`)
console.log('\n')

fs.writeFileSync(`${root}/videos.txt`, urls.join('\n'))

execSync(
	`youtube-dl --no-overwrites --ignore-errors --continue --add-metadata --format best -a '${root}/videos.txt' -o '${root}/videos/%(title)s %(id)s.%(ext)s'`,
	{ stdio: 'inherit' }
)
