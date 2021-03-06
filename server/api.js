const express = require('express');
// const passport = require('passport');
const logger = require('./log/logHelper').helper;
const router = express.Router();
const db = require('./db');
const utils = require('./util/tableUtil');
const util = require('./util/util');
// 子进程（child_process）
const exec = require('child_process').exec;

/**
 * API implacement
 * 接口符合RESTful风格
 */
var n = 0;


/**
 * 根据name(源文件目录名字)获取对象数据
 */
router.get('/getAll/tables', function (req, res, next) {
    var obj;
    var start = process.uptime();
    const code = req.query.code.trim();
    const comment = req.query.comment.trim();
    const tableSpace = req.query.tableSpace.trim();

    logger.writeDebug('code: ' + code + '  comment: ' + comment + '   tableSpace: ' + tableSpace);

    var result = db.readFile('tables');
    var tableRes = new Array();

    if (util.isArray(result) && result.length > 0) {
        result.forEach(function (table, index, tables) {
            logger.writeDebug('table:  ' + JSON.stringify(table));
            if (util.isNotNull(code)) {
                if ((table.code).indexOf(code) > 0) {
                    tableRes.push(table);
                }
            }
            if (util.isNotNull(comment)) {
                if ((table.comment).indexOf(comment) > 0) {
                    tableRes.push(table);
                }
            }

            if (util.isNotNull(tableSpace)) {
                logger.writeDebug('table.table_space: ' + table.table_space);
                logger.writeDebug('-------------' + (table.table_space).indexOf(tableSpace) > 0);
                if ((table.table_space).indexOf(tableSpace) > 0) {
                    logger.writeDebug('包含 tableSpace: ' + tableSpace);
                    tableRes.push(table);
                }
            }

        });
    }

    if (tableRes.length > 0) {
        obj = tableRes;
    } else {
        obj = result;
    }

    logger.writeDebug('API JSON:   ' + JSON.stringify(obj));
    var end = process.uptime();
    logger.writeDebug('查询 tables 执行时间： ' + (end - start) + '  start: ' + start + ' end: ' + end);
    res.status(200).send(obj).end();
});

/**
 * 获取domains
 */
router.get('/getAll/domains', function (req, res, next) {

    var start = process.uptime();

    var result = db.readFile('domains');
    logger.writeDebug('API JSON:   ' + JSON.stringify(result));

    var end = process.uptime();
    logger.writeDebug('查询 domains 执行时间： ' + (end - start) + '  start: ' + start + ' end: ' + end);

    res.status(200).send(result).end();
});

/**
 * 获取表空间
 */
router.get('/getAll/table_spaces', function (req, res, next) {

    var start = process.uptime();
    logger.writeDebug('params: ' + req.params);

    var result = db.readFile('table_spaces');
    logger.writeDebug('API JSON:   ' + JSON.stringify(result));

    var end = process.uptime();
    logger.writeDebug('查询 table_spaces  执行时间： ' + (end - start) + '  start: ' + start + ' end: ' + end);

    res.status(200).send(result).end();
});


/**
 * 根据name(源文件目录名字)获取对象数据
 */

router.get('/getTable/:code', function (req, res, next) {
    var result = db.getTable(req.params.code);
    logger.writeDebug('API JSON:   ' + JSON.stringify(result));
    res.status(200).send(result).end();
});

/**
 * 根据name(源文件目录名字)获取对象数据
 */

router.get('/getDomain/:code', function (req, res, next) {
    var result = db.getDomain(req.params.code);
    logger.writeDebug('API JSON:   ' + JSON.stringify(result));
    res.status(200).send(result).end();
});


/**
 * 保存table数据
 */
router.post('/saveTable', function (req, res, next) {
    var errors = new Array();
    // 后台接收的参数
    const data = req.body.data;
    logger.writeDebug('后台接收的数据： ' + JSON.stringify(data));
    if (!data) {
        return res.status(301).send('数据不能为空').end();
    }

    // 服务端数据验证 表名唯一，表中字段不可重复
    var flag = checkTableCode('tables',data.code);
    logger.writeDebug('flag: ' + flag);
    if (flag) {
        errors.push('表名 ' + data.code + ' 已存在');
    }

    if (errors.length > 0) {
        logger.writeErr(errors);
        return res.status(301).send(errors).end();
    } else {
        db.writeSourceFile('tables', data.code, JSON.stringify(data, null, 4));
        res.status(200).send('保存成功').end();
    }

});


/**
 * domain
 */
router.post('/saveDomain', function (req, res, next) {
    var errors = new Array();
    // 后台接收的参数
    const data = req.body.data;
    logger.writeDebug('/saveDomain 接收的数据： ' + JSON.stringify(data));
    if (!data) {
        return res.status(301).send('数据不能为空').end();
    }

    // 服务端数据验证 表名唯一，表中字段不可重复
    var flag = checkTableCode('domains',data.code);
    logger.writeDebug('flag: ' + flag);
    if (flag) {
        errors.push('表名 ' + data.code + ' 已存在');
    }

    if (errors.length > 0) {
        logger.writeErr(errors);
        return res.status(301).send(errors).end();
    } else {
        db.writeSourceFile('domains', data.code, JSON.stringify(data, null, 4));
        res.status(200).send('保存成功').end();
    }

});



router.get('/checkTableCode/:code', function (req, res, next) {
    var errors = new Array();
    // 后台接收的参数
    const code = req.params.code;
    logger.writeDebug('后台接收的数据： ' + JSON.stringify(code));
    if (!code) {
        errors.push('请填写表名！');
        logger.writeErr(errors);
        return res.status(301).send(errors).end();
    }

    // 服务端数据验证 表名唯一，表中字段不可重复
    var flag = checkTableCode('tables',code);
    logger.writeDebug('flag: ' + flag);
    if (flag) {
        errors.push('表名 ' + code + ' 已存在');
        logger.writeErr(errors);
        return res.status(301).send(errors).end();
    }

    return res.status(200).send('').end();
});


router.get('/checkDomainCode/:code', function (req, res, next) {
    var errors = new Array();
    // 后台接收的参数
    const code = req.params.code;
    logger.writeDebug('后台接收domain的数据： ' + JSON.stringify(code));
    if (!code) {
        errors.push('请填写domain名称！');
        logger.writeErr(errors);
        return res.status(301).send(errors).end();
    }

    // 服务端数据验证 表名唯一，表中字段不可重复
    var flag = checkTableCode('domains',code);
    logger.writeDebug('flag: ' + flag);
    if (flag) {
        errors.push('domain ' + code + ' 已存在');
        logger.writeErr(errors);
        return res.status(301).send(errors).end();
    }

    return res.status(200).send('').end();
});

/**
 * 检查表code 唯一
 * @param code
 */
function checkTableCode(type,code) {
    // 获取所有的table
    var tables = db.readFile(type);
    var flag = false;
    logger.writeDebug('tables: ' + tables);
    if (null != tables && tables instanceof Array) {
        for (var i in tables) {
            logger.writeDebug('code: ' + code + '   tableCode:' + tables[i].code)
            if (code == tables[i].code) {
                flag = true;
                continue;
            }
        }
    }
    return flag;
};

/**
 * 单表view sql
 */
router.post('/showSQL', function (req, res, next) {
    var errors = new Array();

    const type = req.body.type;
    const db_type = req.body.db_type;
    const code = req.body.code; // 表名字
    var data = req.body.data;
    if (code) {
        if (type.toLowerCase() == 'table') {
            data = db.getTable(code);
        } else if (type.toLowerCase() == 'domain') {

        }
    }

    logger.writeDebug('type: ' + type + ' db_type: ' + db_type + '  data: ' + JSON.stringify(data));
    try {
        const sql = utils.generatorSqlOnline(type, db_type, data);
        return res.status(200).send(sql).end();
    } catch (e) {
        logger.writeErr('生成SQL错误: ' + e)
        errors.push('生成SQL错误，请重试');
    }
    return res.status(301).send(errors).end();

});


/**
 * 生成sql
 */
router.post('/generatorSql', function (req, res, next) {
    var msg = new Array();

    const db_type = req.body.db_type;
    const type = req.body.type;
    logger.writeDebug('db_type: ' + db_type);
    try {
        utils.generatorSql(db_type, type);
        msg.push('生成SQL成功');
        return res.status(200).send(msg).end();
    } catch (e) {
        logger.writeErr('生成SQL错误: ' + e)
        msg.push('生成SQL错误，请重试');
    }
    return res.status(301).send(msg).end();

});

/**
 * 删除源文件
 */
router.post('/deleteFile', function (req, res, next) {
    var msg = new Array();
    const type = req.body.type; // 类型 table、domain、
    const code = req.body.code; // 名字


    try {
        db.delSourceFile(type, code);
        msg.push('表 ' + code + ' 删除成功！');
        return res.status(200).send(msg).end();
    } catch (e) {
        logger.writeErr('删除文件错误: ' + e);
        msg.push('删除文件错误，请重试');
    }
    return res.status(301).send(msg).end();
});


/**
 * 测试使用：
 * 根据name获取数据
 */
router.get('/test', function (req, res, next) {

    // 调用系统命令
    // exec('java -version', function (error, stdout, stderr) {
    //     console.log('标准输出： ' + stdout);
    //     console.log('错误输出： ' + stderr);
    // });


    // var flag = checkTableCcode('user');
    // logger.writeDebug('flag: ' + flag);


    // var result = db.getTable('user');
    utils.generatorSql('mysql', 'table');
    // logger.writeDebug('JSON:   ' + JSON.stringify(result, null, 4));
    res.status(200).send('').end();
});


module.exports = router;
