#!/bin/bash

# This script converts all cbr and cbz files in the given path to pdf files
# It stores the pdf files in the same folder as the original cbr or cbz file
# The original cbr or cbz files are not deleted.


# set -o xtrace  # Print commands as they are executed
# set -o errexit # Exit on error

# if count of arguments is less than 1
if [ $# -lt 1 ]; then
	echo "Usage: $0 [<path> ...]"
	exit 1
fi

# check if commands are installed
if ! command -v 7z &> /dev/null; then
	echo "command 7z is not installed"
	exit 1
fi

if ! command -v unzip &> /dev/null; then
	echo "command unzip is not installed"
	exit 1
fi

if ! command -v img2pdf &> /dev/null; then
	echo "command img2pdf is not installed"
	exit 1
fi

if ! command -v convert &> /dev/null; then
	echo "command convert is not installed"
	exit 1
fi

function cbr_or_cbz_to_pdf {
	TMP=$(mktemp -d)
	ORIGINAL_FOLDER=$(dirname "$1")
	FILENAME_WITHOUT_EXTENSION=$(basename "$1" .cbz)
	RESULT="$ORIGINAL_FOLDER/$FILENAME_WITHOUT_EXTENSION.pdf"

	echo "Converting \"$1\" -> \"$RESULT\""

	# extract all images from cbr or cbz file
	if [[ "$1" == *.cbr ]]; then
		7z e "$1" -o "$TMP"
	elif [[ "$1" == *.cbz ]]; then
		unzip -j "$1" -d "$TMP" > /dev/null
	else
		echo "$1 is not a cbr or cbz file"
		exit 1
	fi

	# convert all images that are not .jpg to .jpg
	IMAGES=$(ls -1 "$TMP")
	for IMAGE in $IMAGES; do
		if [[ "$IMAGE" != *.jpg ]]; then
			convert "$TMP/$IMAGE" "$TMP/$(basename "$IMAGE")".jpg
			rm "$TMP/$IMAGE"
		fi
	done

	IMAGES=$(ls -1 "$TMP")
	(cd "$TMP" && img2pdf $IMAGES --output out.pdf)x
	mv "$TMP/out.pdf" "$RESULT"
	rm -rf "$TMP"
}

for IN_PATH in "$@"; do
	find "$IN_PATH" -type f | while read file; do
		if [[ "$file" == *.cbr || "$file" == *.cbz ]]; then
			cbr_or_cbz_to_pdf "$file"
		else
			echo "Ignoring $file, is not a cbr or cbz file"
		fi
	done
done