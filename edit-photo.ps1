param(
  [string]$originalFilepath,
  [string]$editedFilepath,
  [string]$cutoutPath
)

# With comic effect:
# gmic input $originalFilepath -crop 236,0,843,1079 -resize 1080,1920 -cl_comic 6,3,0,0,0.8225,7.353,39,1,0,20,3,0,0,0,0,0,0,0,50,50 -input $cutoutPath -blend alpha -output $editedFilepath

# Without comic effect:
gmic input $originalFilepath -crop 236,0,843,1079 -resize 1080,1920 -input $cutoutPath -blend alpha -output $editedFilepath