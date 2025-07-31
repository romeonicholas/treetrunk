param(
  [string]$originalFilepath,
  [string]$editedFilepath,
  [string]$cutoutPath
)

# Command to run: 
gmic input $originalFilepath -cl_comic 6,3,0,0,0.8225,7.353,39,1,0,20,3,0,0,0,0,0,0,0,50,50 -input $cutoutPath -blend alpha -output $editedFilepath