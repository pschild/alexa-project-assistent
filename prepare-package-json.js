const copyfiles = require('copyfiles');
const editJsonFile = require('edit-json-file');

copyfiles(['./package.json', './src/lambda/dist/'], {}, () => {
    console.log('Copied package.json');

    let file = editJsonFile(`${__dirname}/src/lambda/dist/package.json`);
    file.unset('devDependencies');
    file.save();
    console.log('Edited package.json');
});