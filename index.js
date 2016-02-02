var fs = require('fs');
var mkdirp = require('mkdirp');
var parser = require('exif-parser');

// todo: ask for path, that should be proceed
var config = {
    dist: './dist',
    src: './test'
};

var pathCache = {};

fs.readdir(config.src, function (err, files) {
    if (err) {
        console.error('Can\'t read direcotry ' + config.src + ': ' + err);
        return;
    }

    var l = files.length;
    while (l--) {
        processFile(files[l]);
    }
});

//
// Helpers
//

function processFile(file) {
    // Checking for correct file extension
    if (!isCorrectFileExtension(file)) {
        console.info('Incorrect file\'s extension: ' + file + '. Jpeg and tiff are allowed.');
        return;
    }

    var buffer = fs.readFileSync(config.src + '/' + file);

    // Getting tags from exif-parser
    var tags = parser.create(buffer).parse().tags;

    // Check if tags is empty
    if (!Object.keys(tags).length) {
        console.info('No tags available: ' + file);
        return;
    }

    // Get date
    // Note: time in javascript in ms, so multiply by 1000
    var date = new Date(tags.CreateDate * 1000);

    // Build path for the current image
    var path = [
        config.dist,
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate()
    ].join('/');

    // Check dir in pathCache
    if (!pathCache[path]) {
        // Add path to pathCache
        pathCache[path] = true;
        mkdirp(path, {}, function() {
            copyFile(config.src + '/' + file, path + '/' + file);
        });
    } else {
        copyFile(config.src + '/' + file, path + '/' + file);
    }
}

function copyFile(file, target) {
    var readStream = fs.createReadStream(file);
    var writeStream = fs.createWriteStream(target);

    readStream.on('error', onError);
    writeStream.on('error', onError);

    writeStream.on('open', function () {
        readStream.pipe(writeStream);
    });

    console.info('File ' + file + ' was successfully copied to ' + target);
}

function isCorrectFileExtension(fileName) {
    var ext = fileName.split('.').pop().toLowerCase();
    return ext === 'jpg' || ext === 'jpeg' || ext === 'tiff';
}

function onError(err) {
    console.error('The error was occurred during the copying the file:' + err);
}