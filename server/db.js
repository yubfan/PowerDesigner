const fs = require("fs");
const path = require("path");
const iconv = require('iconv-lite');
const logger = require("./log/logHelper").helper;
// const validator = require('validator');
const table_name = "tables";
const domain_name = "domains";
const table_space_name = "table_spaces";

// JSON源数据路径
var sourcePath = 'data/source/';
// 生成SQL路径
var targerPath = 'data/target/';


/**
 * 读取目录下的所有文件
 * @param name 源文件目录
 * @returns [Array] 返回数组
 */
const readFile = function (name) {
    const path = sourcePath + name;
    logger.writeInfo('db 读取的 path:  ' + path);
    const objs = new Array();
    const files = fs.readdirSync(path);
    if (files.length > 0) {
        files.forEach(function (file) {
            const filePath = path + '/' + file;

            const statFile = fs.statSync(filePath);
            if (!statFile.isDirectory()) {
                logger.writeInfo('db 读取的文件名:  ' + filePath);
                // 如果是文件，读取文件
                var fileStr = fs.readFileSync(filePath, {encoding: 'binary'});
                var buf = new Buffer(fileStr, 'binary');
                var data = iconv.decode(buf, 'GBK');
                const json = JSON.parse(data);
                // const json = JSON.parse(fs.readFileSync(filePath));
                objs.push(json);
            }
        });
    }
    return objs;
};


const delSourceFile = function (type, name) {
    // 目标路径  eg: data/source/tables/user.json
    var outPath = sourcePath + type;
    outPath = path.join(__dirname, '../', outPath, '/');
    const outFile = outPath + name + '.json'

    if (fs.existsSync(outFile)) {
        logger.writeDebug('删除文件： ' + outFile);
        fs.unlinkSync(outFile);
    }
};

/**
 * 保存源数据文件 json 文件
 * @param type 类型:table\domains\table_spaces
 * @param name 文件名：
 * @param data ? 计划传拼接json数据 是否先用模板格式化?
 */
const writeSourceFile = function (type, name, data) {
    // 目标路径  eg: data/source/tables/user.json
    const outPath = sourcePath + type;
    checkAndCreateDir(outPath);
    const outFile = outPath + '/' + name + '.json';
    logger.writeDebug('要写入的数据： ' + data);
    // 把中文转换成字节数组
    const arr = iconv.encode(data, 'gbk');
    // 如果用writeFile，那么会删除旧文件，直接写新文件
    fs.writeFile(outFile, arr, function (err) {
        if (err) {
            logger.writeErr('写入 ' + type + '  ' + name + '.json 文件错误:  ' + err);
        } else {
            logger.writeInfo('写入 ' + type + '  ' + name + '.json 文件成功');
        }
    });
};


/**
 * 向指定路径写SQL文件
 * @param type 目标文件夹 (table、table_space)
 * @param name 文件名
 * @param data 文件内容
 */
const writeSQLFile = function (type, name, data) {
    const outPath = targerPath + type + '/';
    checkAndCreateDir(outPath);
    const outFile = outPath + name + '.sql';
    // 把中文转换成字节数组
    const arr = iconv.encode(data, 'gbk');
    // 异步写文件 writeFile，如果文件不存在，则创建；如果文件已存在，那么内容会被覆盖
    // writeFileSync 文件同步写接口，是fs.writeFile的同步版本 fs.writeFileSync(filename, data, [options])
    fs.writeFile(outFile, arr, function (err) {
        if (err) {
            logger.writeErr('写入 ' + type + '  ' + name + '.sql 文件错误:  ' + err);
        } else {
            logger.writeInfo('写入 ' + type + '  ' + name + '.sql 文件成功');
        }
    });
};

/**
 * 写文件
 * @param filePath 文件路径
 * @param suffix 后缀
 * @param data 写入的数据
 */
function writeFile(filePath, suffix, data) {
    const arr = iconv.encode(data, 'gbk');
    // 如果用writeFile，那么会删除旧文件，直接写新文件
    fs.writeFile(filePath, arr, function (err) {
        if (err) {
            logger.writeErr('写入 ' + filePath + ' 文件错误:  ' + err);
        } else {
            logger.writeInfo('写入 ' + filePath + ' 文件成功');
        }
    });
}


/**
 * 检查文件夹路径是否存在，不存在则创建
 * @param dir
 */
function checkAndCreateDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}


/**
 * 获取根据code获取表对象
 */
const getTable = function (code) {
    const filePath = sourcePath + 'tables/' + code + '.json';

    var table = {};
    try {
        const statFile = fs.statSync(filePath);

        logger.writeInfo(statFile.isFile())

        if (statFile.isFile()) {
            logger.writeInfo(filePath + ' 文件存在');

            var fileStr = fs.readFileSync(filePath, {encoding: 'binary'});
            var buf = new Buffer(fileStr, 'binary');
            var data = iconv.decode(buf, 'GBK');
            table = JSON.parse(data);

            // table = JSON.parse(fs.readFileSync(filePath));
        } else {
            logger.writeErr(filePath + ' 文件不存在');
        }
    } catch (e) {
        logger.writeErr(filePath + ' 文件不存在');
    }

    return table;
};


/**
 * 获取根据code获取表对象
 */
const getDomain = function (code) {
    const filePath = sourcePath + 'domains/' + code + '.json';

    var domain = {};
    try {
        const statFile = fs.statSync(filePath);

        logger.writeInfo(statFile.isFile())

        if (statFile.isFile()) {
            logger.writeInfo(filePath + ' 文件存在');

            var fileStr = fs.readFileSync(filePath, {encoding: 'binary'});
            var buf = new Buffer(fileStr, 'binary');
            var data = iconv.decode(buf, 'GBK');
            domain = JSON.parse(data);

            // table = JSON.parse(fs.readFileSync(filePath));
        } else {
            logger.writeErr(filePath + ' 文件不存在');
        }
    } catch (e) {
        logger.writeErr(filePath + ' 文件不存在');
    }

    return domain;
};


/**
 * 获取所有domain对象
 */
const getAllDomains = function () {
    return this.readFile(domain_name);
};

/**
 * 获取所有表空间对象
 */
const getAllTableSpaces = function () {
    return this.readFile(table_space_name);
};

/**
 * 获取默认的表空间
 */
const getDefaultTableSpace = function () {
    var defauleTableSpace;
    const allTableSpaces = this.getAllTableSpaces();
    allTableSpaces.forEach(function (tableSpace, index, array) {
        if (tableSpace.D == 'Y') {
            defauleTableSpace = tableSpace;
        }
    });
    return defauleTableSpace;
};

const Models = {
    readFile: readFile,
    writeSQLFile: writeSQLFile,
    writeSourceFile: writeSourceFile,
    delSourceFile: delSourceFile,
    getTable: getTable,
    getDomain: getDomain,
    getAllDomains: getAllDomains,
    getAllTableSpaces: getAllTableSpaces,
    getDefaultTableSpace: getDefaultTableSpace
};

module.exports = Models;