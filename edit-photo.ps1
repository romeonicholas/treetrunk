param(
  [string]$originalFilepath,
  [string]$editedFilepath,
  [string]$cutoutPath
)

# Command to run: 
C:\Users\romeo\Downloads\gmic_3.5.5_cli_win64\gmic-3.5.5-cli-win64\gmic.exe input $originalFilepath -cl_comic 6,3,0,0,0.8225,7.353,39,1,0,20,3,0,0,0,0,0,0,0,50,50 -input $cutoutPath -blend alpha -output $editedFilepath