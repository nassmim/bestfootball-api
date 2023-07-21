# Script to generate thumbnails of a video and combine into one tile image.
#
# CAUTION:
# FFprobe might fail to extract duration info from a MKV container. Use
#     ffmpeg -i video.mkv -c:v copy -c:a copy video.mp4
# to swap to an MP4 container.
#
# Dependencies:
# 1. ffmpeg
# 2. ImageMagick
#
# Usage:
# ./thumbnails.sh NFRAMES TILE SIZE INPUT OUTPUT
#
# NFRAMES is the number of frames (thumbnails) to generate, e.g., 16;
# TILE is in the form "MxN" (where M * N should match NFRAMES), e.g., 4x4;
# SIZE is the length of the longer side of the output, e.g., 1920 if you want
# to get an 1920*1080 output image;
# INPUT is the path to the input file;
# OUTPUT is the path to the output file (make sure intermediate directories
# exist).
#
# Example:
# ./thumbnail.sh 16 4x4 1920 video.mp4 thumbnails.png
#
# Credit:
# http://goo.gl/vzXW1b (FFmpeg wiki: generate thumbnails)
# http://stackoverflow.com/q/7395343 (extract video length)
# http://apple.stackexchange.com/q/52879 (combine images)

if [[ $# != 5 ]]; then
    echo "wrong number of arguments
Usage:
./thumbnails.sh NFRAMES TILE SIZE INPUT OUTPUT
NFRAMES is the number of frames (thumbnails) to generate, e.g., 16;
TILE is in the form 'MxN' (where M * N should match NFRAMES), e.g., 4x4;
SIZE is the length of the longer side of the output, e.g., 1920 if you want
to get an 1920*1080 output image;
INPUT is the path to the input file;
OUTPUT is the path to the output file (make sure intermediate directories
exist).
Example:
./thumbnail.sh 16 4x4 1920 video.mp4 thumbnails.png
"
    return 1
fi

NFRAMES=$1
TILE=$2
SIZE=$3
INPUT=$4
OUTPUT=$5

DURATION=$(ffprobe -loglevel error -show_streams $INPUT | grep duration= | cut -f2 -d= | head -1)
FPS=$(echo "$NFRAMES / $DURATION" | bc -l)
OFFSET=$(echo "$DURATION / $NFRAMES / 2" | bc -l)

# generate thumbnails in the /tmp folder
TMPDIR=/tmp/thumbnails-${RANDOM}/
mkdir $TMPDIR
ffmpeg -i $INPUT -f image2 -q:v 0 -vf fps=fps=$FPS ${TMPDIR}thumb%04d.jpg
montage ${TMPDIR}thumb*.jpg -background white -geometry +5+5 -tile $TILE ${TMPDIR}output.jpg
convert ${TMPDIR}output.jpg -resize ${SIZE}x${SIZE} $OUTPUT