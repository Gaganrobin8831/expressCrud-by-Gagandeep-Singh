let first = [
    { "id": 1, "name": "John", "Work": [] },
    { "id": 2, "name": "Jane", "Work": [] }
];

let second = [
    { "id": 1, "WorkName": "John121", "firstID": [] },
    { "id": 2, "WorkName": "Jane121", "firstID": [] }
];

function Update(name, WorkName) {

    const firstEntry = first.find(data => data.name === name);
    const secondEntry = second.find(secdata => secdata.WorkName === WorkName);
    firstEntry.Work.push(secondEntry.id);
    secondEntry.firstID.push(firstEntry.id);

}

Update("John", "Jane121");

console.log(first);
console.log(second);


function delProfile(name) {

   return  firstEntry = first.filter(data => {
        if (data.name != name) { 
          return  first = [data]
            
        } 

           second.filter(data2 => {
                let newdata = data2.firstID.includes(data.id) ? data2.firstID = [] : []
                return newdata


            })

       
    });

}





delProfile("John")
console.log(first);
console.log(second);