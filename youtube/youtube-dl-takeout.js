const { execSync } = require('child_process')
const fs = require('fs')

let urls = ''
let nUrls = 0
const likes = (fs.readFileSync('/videos/Liked videos.csv')).toString().split('\n')

for (const like of likes) {
	if (like.match(/^.*\,\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d\ UTC$/)) {
		const [id, date] = like.split(',')
		if ((new Date(date)).getFullYear() >= 2017) {
			urls += `https://www.youtube.com/watch?v=${id.trim()}\n` // .trim() because the csv sometimes prefixes id with a space id
			nUrls++
		}
	}
}

fs.writeFileSync('/videos/videos.txt', urls)
console.log(`Added ${nUrls} of ${likes.length} urls`)
fs.mkdirSync('/videos', { recursive: true })
execSync(
	`youtube-dl --no-overwrites --ignore-errors --add-metadata --format best -a '/videos/videos.txt' -o '/videos/%(title)s %(id)s.%(ext)s'`,
	{ stdio: 'inherit' }
)
