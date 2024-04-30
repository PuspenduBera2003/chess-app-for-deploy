function arrayToObject(array, status) {
    let obj = {};
    array.map((val) => {
        obj[parseInt(val.id)] = status;
    })
    return obj;
}
module.exports = arrayToObject;