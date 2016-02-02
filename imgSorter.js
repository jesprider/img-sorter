function processFile(file){if(!isCorrectFileExtension(file))return void console.info("Incorrect file's extension: "+file+". Jpeg and tiff are allowed.");var buffer=fs.readFileSync(config.src+"/"+file),tags=parser.create(buffer).parse().tags;if(!Object.keys(tags).length)return void console.info("No tags available: "+file);var date=new Date(1e3*tags.CreateDate),path=[config.dist,date.getFullYear(),date.getMonth()+1,date.getDate()].join("/");pathCache[path]?copyFile(config.src+"/"+file,path+"/"+file):(pathCache[path]=!0,mkdirp(path,{},function(){copyFile(config.src+"/"+file,path+"/"+file)}))}function copyFile(file,target){var readStream=fs.createReadStream(file),writeStream=fs.createWriteStream(target);readStream.on("error",onError),writeStream.on("error",onError),writeStream.on("open",function(){readStream.pipe(writeStream)}),console.info("File "+file+" was successfully copied to "+target)}function isCorrectFileExtension(fileName){var ext=fileName.split(".").pop().toLowerCase();return"jpg"===ext||"jpeg"===ext||"tiff"===ext}function onError(err){console.error("The error was occurred during the copying the file:"+err)}var fs=require("fs"),mkdirp=require("mkdirp"),parser=require("exif-parser"),config={dist:"./dist",src:"./test"},pathCache={};fs.readdir(config.src,function(err,files){if(err)return void console.error("Can't read direcotry "+config.src+": "+err);for(var l=files.length;l--;)processFile(files[l])});