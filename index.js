'use strict';

var async = require('async');
var commander = require('commander');
var fs = require('fs-extra');
var gm = require('gm');
var path = require('path');


commander
  .usage('<srcImg> <iconsetDir>')
  .arguments('<srcImg> <iconsetDir>')
  .action(function(srcImage, dir) {
    gSrcImage = srcImage;
    gDataDir = dir;
  })
  .parse(process.argv);

var gDataDir;
var gSrcImage;

if (typeof gDataDir === 'undefined') {
  commander.help();
}

var contentsPath = path.resolve(gDataDir, 'Contents.json');
console.log(gSrcImage);

function resizeImage(imgSet, cb) {
  console.log('Writing image: ' + imgSet.filename);
  var imgOutputFile = path.resolve(gDataDir, imgSet.filename);
  var size = imgSet.size.split('x');
  var scale = imgSet.scale ? imgSet.scale.split('x')[0] : 1;
  gm(gSrcImage)
  .resize(size[0] * scale, size[1] * scale)
  .write(imgOutputFile, function(err) {
    if (err) {
      console.error('Failure to write image file ' + imgOutputFile + ': ' + err);
      process.exit();
    }
    cb();
  });
}

fs.readJson(contentsPath, function (err, contents) {
  if (err || !contents || !contents.images) {
    console.error(gDataDir + ' invalid iconset directory. Should contain Contents.json with an images object.')
    process.exit();
  }
  var q = async.queue(resizeImage, 8);
  for (var i=0; i < contents.images.length; ++i) {
    var imgSet = contents.images[i];
    var filename = imgSet.filename;
    if (!imgSet.idiom || !imgSet.size) {
      console.error('Could not find idiom or size for image ' + i);
      process.exit();
    }
    if (!filename) {
      filename = imgSet.idiom || 'unknown';
      filename += '-' + imgSet.size;
      if (!imgSet.scale || imgSet.scale !== '1x') {
        filename += '@' + imgSet.scale;
      }
      filename += '.png';
      imgSet.filename = filename;
    }
    q.push(imgSet);
  }
  q.drain = function() {
    console.log('All done, writing Contents.json');
    fs.writeJson(contentsPath, contents, function(err) {
      if (err) {
        console.error(err);
        process.exit();
      }
      console.log('Success.');
    });
  };
});
