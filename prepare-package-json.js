const copyfiles = require('copyfiles');
const editJsonFile = require("edit-json-file");

copyfiles(['./package.json', './lambda/dist/'], {}, () => {
    console.log('Copied package.json');

    let file = editJsonFile(`${__dirname}/lambda/dist/package.json`);
    file.unset('devDependencies');
    file.save();
    console.log('Edited package.json');
});