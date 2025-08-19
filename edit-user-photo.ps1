param(
  [string]$originalFilepath,
  [string]$editedFilepath,
  [string]$figureFolder,
  [string]$editedReviewPageFolder
)

# With comic effect:
# gmic input $originalFilepath -crop 236,0,843,1079 -resize 1080,1920 -cl_comic 6,3,0,0,0.8225,7.353,39,1,0,20,3,0,0,0,0,0,0,0,50,50 -input $cutoutPath -blend alpha -output $editedFilepath

gmic $originalFilepath -rotate -90 -expand x,108 -expand y,192 -shift 0,24 $figureFolder\overlay.png -blend alpha -output $editedFilepath
gmic $figureFolder\selfie_review.png $editedFilepath rescale2d[1] 1080,1920 resize[1] 2160,3600,1,4,0 shift[1] 883,862,0,0,2 blend alpha $editedReviewPageFolder\latest_qr.png resize[1] 2160,3600,1,4,0 shift[1] 995,2912,0,0,2 blend alpha output $editedReviewPageFolder\editedReviewPage.png
