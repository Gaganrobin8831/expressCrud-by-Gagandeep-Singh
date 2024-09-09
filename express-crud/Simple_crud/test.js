const num = [1,2,4]
const maxId = num.reduce((max, item) => {
    console.log(`this max val ${max} this is item ${item}`);
    console.log(item > max ? item : max);
    
    return item > max ? item : max;
    
}, 0);
const newId = maxId + 1;
console.log(newId);
