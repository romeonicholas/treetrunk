param(
  [string]$figureFolder
)

magick $figureFolder\cutout.webp $figureFolder\cutout.png
magick $figureFolder\selfie_frame.webp $figureFolder\selfie_frame.png
gmic $figureFolder\cutout.png expand x,248 expand y,-128 shift 360,500 drop_shadow -20,0,20,0,0,0 $figureFolder\selfie_frame.png blend alpha output $figureFolder\overlay.png