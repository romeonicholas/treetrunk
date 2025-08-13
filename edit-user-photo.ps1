param(
  [string]$originalFilepath,
  [string]$editedFilepath,
  [string]$overlayPath
)

# With comic effect:
# gmic input $originalFilepath -crop 236,0,843,1079 -resize 1080,1920 -cl_comic 6,3,0,0,0.8225,7.353,39,1,0,20,3,0,0,0,0,0,0,0,50,50 -input $cutoutPath -blend alpha -output $editedFilepath

# Without comic effect:
# gmic input $originalFilepath -shadow[1] 20,0,80,0,0,0,0,255,1 -crop 236,0,843,1079 -resize 1080,1920 -input $cutoutPath -blend alpha -output $editedFilepath

# gmic $originalFilepath -rotate -90 -rescale2d 1800,3200 -output $editedFilepath
# gmic $framePath $editedFilepath -blend alpha,1,180,360 -output $editedFilepath

gmic $originalFilepath -rotate -90 -expand x,108 -expand y,192 -shift 0,22 $overlayPath -blend alpha -output $editedFilepath