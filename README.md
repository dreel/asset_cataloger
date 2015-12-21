# asset_cataloger

Tool for taking a src image and creating all needed smaller images for an xcode iconset. To use:

1. In XCode, create the iconset you want (Editor -> Add Assets).
2. Find the corresponding directory (usually something like: $projname/Images.xcassets/$set.appiconset)
3. Create your source icon, ideally as large as your largest required image. 1024x1024 is a good starting point.
4. Run asset_cataloger: Usage: asset_cataloger <srcImg> <iconsetDir>
