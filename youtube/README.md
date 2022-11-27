This script will download all your liked youtube videos:
https://takeout.google.com/takeout/custom/youtube?dnm=false&continue=https://myaccount.google.com/yourdata/youtube&hl=en_GB&utm_source=privacy-advisor-youtube

# Usage
- Get a google takeout of your liked youtube videos
- Replace `$HOME/files/dump/youtube/` with the path you want the videos to be stored at
- At the root of that path, paste the `Liked videos.csv`, straight from the google takeout
```shell
scp "$HOME/Downloads/Takeout/YouTube and YouTube Music/playlists/Liked videos.csv" s1-public:$HOME/files/dump/youtube/
docker build -t youtube-dl-takeout .
docker run -v $HOME/files/dump/youtube/:/youtube/ --name youtube-dl-takeout --restart unless-stopped youtube-dl-takeout
```