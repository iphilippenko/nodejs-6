const fs = require('fs');
const {Transform} = require('stream');
const { StringDecoder } = require('string_decoder');
let os = require('os');

const FILE_NAME = 'text.txt';
const STRINGS_AMOUNT = 10000;

const decoder = new StringDecoder('utf8');

const createTransform = (transform) => {
    return new Transform({encoding: 'utf8', transform: transform})
};

const toUpper = () => {
    const toUpperStream = createTransform((chunk, encoding, callback) => {
        callback(null, chunk.toString().toUpperCase());
    });
    toUpperStream.on('data', (chunk) => console.log('toUpper ', chunk));
    return toUpperStream;
};

const deleteDigits = () => {
    const digitsWritable = fs.createWriteStream('delete-logs.txt', {encoding: 'utf8', flags: 'a'});
    const deleteStream = createTransform((chunk, encoding, callback) => {
        const str = decoder.write(chunk);
        digitsWritable.write(`Delete date: ${new Date().toISOString()}, name: ${os.userInfo().username}, deleted: ${str.match(/\d+/g).join('')}\n`);
        callback(null, str.replace(/\d+/g, ''));
    });
    deleteStream.on('data', (chunk) => console.log('deleteDigits ', chunk));
    return deleteStream;
};

const capitalize = () => {
    const capitalizeStream = createTransform((chunk, encoding, callback) => {
        const str = decoder.write(chunk).toLowerCase();
        callback(null, str.charAt(0).toUpperCase() + str.slice(1));
    });
    capitalizeStream.on('data', (chunk) => console.log('capitalize ', chunk));
    return capitalizeStream;
};

const createFile = (writableStream) => {
    for (let i = 0; i < STRINGS_AMOUNT; i++) {
        writableStream.write(`${i}Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua\n`);
    }
};

const readFile = (readableStream) => {
    readableStream.on('data', (chunk) => {
        console.log(chunk);
    });
    readableStream.on('end', () => {
        console.log('file ended');
    });
    return readableStream;
};

const writeFile = (writableStream, content) => {
    writableStream.write(`${content}\n`);
};

createFile(fs.createWriteStream(FILE_NAME, {'flags': 'a', encoding: 'utf8'}));
readFile(fs.createReadStream(FILE_NAME, 'utf8'));
writeFile(fs.createWriteStream(FILE_NAME, {'flags': 'a', encoding: 'utf8'}), 'some text to add');

fs.createReadStream(FILE_NAME, 'utf8')
    .pipe(toUpper())
    .pipe(deleteDigits())
    .pipe(capitalize());
