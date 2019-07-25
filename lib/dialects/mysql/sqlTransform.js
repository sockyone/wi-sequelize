function sqlTransform(sql) {
    let subString1 = sql.substring(sql.indexOf('(') + 1, sql.indexOf(')'));
    let subString2 = sql.substring(sql.indexOf(')')+1, sql.length);
    subString2 = subString2.substring(subString2.indexOf('(')+1, subString2.lastIndexOf(')'));
    // let arrKey = subString1.split(",");
    // let arrValue = subString2.split("','");
    //
    // console.log('---------');
    // for (let i=0; i < arrKey.length; i++) {
    //     console.log(arrKey[i]);
    // }
    // console.log('---------');
    subString2 = subString2.replace(/'\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d'/g, '');
    let newSql = sql.replace('(DEFAULT', '(' + hash(subString2));
    return newSql;
}


function hash(str) {
    var hash = 5381,
        i    = str.length;

    while(i) {
        hash = (hash * 33) ^ str.charCodeAt(--i);
    }

    return hash;
    //return hash >>> 0;
}

module.exports = sqlTransform;