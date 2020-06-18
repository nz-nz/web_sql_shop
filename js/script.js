"use strict";

let imageData = [
    './img/computer.jpeg',
    './img/gps.jpg',
    './img/helmet.jpeg',
    './img/bicycle.jpg',
];

let db;

//
// checking compatibility of web sql technology
//


try
{
    db = openDatabase('huw5', '1.0', 'Test DB', 2*1024*1024);
}
catch
{
    alert("У тебя в браузере нет WebSql. =(");
}



//
// sql expressions
//


let goodCreate = `
    create table good(
        id integer primary key autoincrement,
        title varchar(255),
        description varchar(1024)
    );
`;

let goodInsert = `insert into good(title, description) values(?, ?);`;

let customerCartCreate = `
    create table customerCart(
        id integer,
        title varchar(255),
        description varchar(1024)
    );
`;


//
// initiation of tables
//


function initGood()
{
    db.transaction(function(tx){
        tx.executeSql(goodCreate,
            [],
            ()=>{console.log('good table has been created successfully')},
            ()=>{console.log('good table hasn`t been created successfully')});

        tx.executeSql(goodInsert,
            ['велосипед', 'полезен для здоровья'],
            ()=>{console.log('data has been inserted successfully')},
            ()=>{console.log('data hasn`t been inserted successfully')});
    });
}

function initCustomerCart()
{
    db.transaction(function(tx){
        tx.executeSql(customerCartCreate,
            [],
            ()=>console.log('customer cart table has been created successfully'),
            ()=>console.log('customer cart table hasn`t been created successfully')
        );

    });
}


//
// adding goods to cart table
//


function addGood(id) {
    db.transaction(function (tx) {
        tx.executeSql(
            `
            insert into customerCart(id, title, description)
            select id, title, description
            from good
            where id = ?
            
            `
            ,
                [id],
                ()=>console.log('data has been created successfully'),
                ()=>console.log('data hasn`t been created successfully'))

    });
}


//
// remove goods from cart table
//


function removeGood(id) {
    db.transaction(function (tx) {
        tx.executeSql(
            `
            delete from customerCart
            where rowid = (
                select max(rowid)
                from customerCart
                where id = ?
            )
            `
            ,
            [id],
            ()=>console.log('data has been removed successfully'),
            ()=>console.log('data hasn`t been removed successfully'))

    });
}


//
// creating view for table
//

//view goods in cart
function v_cartCreate() {
    db.transaction(function (tx) {
        tx.executeSql(
            `
            drop view v_cart;
            `
            ,
            [],
            ()=>console.log('drop view v_cart ok'),
            ()=>console.log('drop view v_cart error')
        );
        tx.executeSql(
            `
            create view v_cart as
                select
                      id,
                      title,
                      count(*) as amount
                 from customerCart
                 group by id;
                 
            `
            ,
            [],
            ()=>console.log('view has been created successfully'),
            ()=>console.log('view hasn`t been created successfully'))

    });
}

//view sum of goods in cart
function v_cartSumCreate() {
    db.transaction(function (tx) {
        tx.executeSql(
            `
            drop view v_cartSum;
            `
            ,
            [],
            ()=>console.log('drop view v_cartSum ok'),
            ()=>console.log('drop view v_cartSum error')
        );
        tx.executeSql(
            `
            create view v_cartSum as
                select
                      count(*) as total
                 from customerCart;
            `
            ,
            [],
            ()=>console.log('view has been created successfully'),
            ()=>console.log('view hasn`t been created successfully'))

    });
}

// select * from v_cart
// select * from v_cartSum


//
// rendering section
//


function renderCard(list)
{
    let arr = [...list];
    // console.log('---------');
    // console.log(arr[0]);
    // console.log('---------');
    let containerElem = document.createElement("div");
    containerElem.classList.add('container');

    arr.forEach(function(elem){
        // console.log('---------');
        // console.log(elem['id']);
        // console.log('---------');
        let cardElem = document.createElement("div");
        cardElem.classList.add('card');
        let imgElem = document.createElement('div');
        imgElem.id = 'img';
        imgElem.style.backgroundImage = `url(${imageData[elem['id']-1]})`;
        cardElem.appendChild(imgElem);

        for(let key in elem)
        {
            //console.log(key);
            let pElem = document.createElement("p");
            pElem.innerText = elem[key];
            cardElem.appendChild(pElem);
        }
        let btnElem = document.createElement("div");
        btnElem.classList.add('btn');
        btnElem.innerText = 'Добавить';
        btnElem.addEventListener('click', ()=>{

            addGood(elem['id']);

            // delete cart
            deleteCart();

            // invoking view for cart table
            v_cartCreate();
            v_cartSumCreate();

            // select all and render
            selectAllCart();

        });

        cardElem.appendChild(btnElem);
        containerElem.appendChild(cardElem);
    });
    console.log(list);
    document.querySelector("#root").appendChild(containerElem);
}

function renderCart(list)
{
    let arr = [...list];
    console.log('\n cart');
    console.log(arr);
    let tableRoot = document.createElement('div');
    let tableElem = document.createElement("table");
    let theadElem = document.createElement('thead');
    let tbodyElem = document.createElement('tbody');
    let tfootElem = document.createElement('tfoot');
    tableRoot.classList.add('tableRoot');

    // table name
    let tnameElem = document.createElement('h2');
    tnameElem.classList.add('tableName');
    tnameElem.innerText = 'Cart';
    tableRoot.appendChild(tnameElem);

    tableRoot.appendChild(tableElem);
    tableElem.appendChild(theadElem);
    tableElem.appendChild(tbodyElem);
    tableElem.appendChild(tfootElem);

    // render table head
    (function(){

        let trElem = document.createElement('tr');
        theadElem.appendChild(trElem);
        for(let key in arr[0]){
            let tHeadElem = document.createElement('th');
            tHeadElem.innerText = key;
            trElem.appendChild(tHeadElem);
        }

    }());

    // render table body
    (function () {

        arr.forEach(function (elem, i, array) {
            let trElem = document.createElement('tr');
            tbodyElem.appendChild(trElem);

            // add data
            for(let key in elem){
                let tBodyElem = document.createElement('td');
                // console.log(elem);
                // console.log(key);
                // console.log(elem[key]);
                tBodyElem.innerText = elem[key];
                trElem.appendChild(tBodyElem);
            }

            let addbtnElem = document.createElement('td');
            let subtractionbtnElem = document.createElement('td');
            addbtnElem.classList.add('addbtnElem');
            subtractionbtnElem.classList.add('subtractionbtnElem');
            addbtnElem.innerText = "+";
            subtractionbtnElem.innerText = '-';

            console.log(elem['id']);

            addbtnElem.addEventListener('click', ()=>{
                addGood(elem['id']);

                // delete cart
                deleteCart();

                // invoking view for cart table
                v_cartCreate();
                v_cartSumCreate();

                // select all and render
                selectAllCart();

            });
            subtractionbtnElem.addEventListener('click', ()=>{
                removeGood(elem['id']);

                // delete cart
                deleteCart();

                // invoking view for cart table
                v_cartCreate();
                v_cartSumCreate();

                // select all and render
                selectAllCart();

            });

            trElem.appendChild(addbtnElem);
            trElem.appendChild(subtractionbtnElem);

        });

    }());

    // render table footer
    (function () {
        console.log(getArrCartTotal());
        for (let i = 0; i< arr.length; i++){

        }

    }());

    // arr.forEach(function(elem){
    //     let cardElem = document.createElement("tr");
    //     cardElem.classList.add('t_header');
    //
    //     for(let key in elem)
    //     {
    //         let pElem = document.createElement("p");
    //         pElem.innerText = elem[key];
    //         cardElem.appendChild(pElem);
    //     }
    //     let btnElem = document.createElement("div");
    //
    //     cardElem.appendChild(btnElem);
    //     containerElem.appendChild(cardElem);
    // });
    document.querySelector("#root").appendChild(tableRoot);
}


//
// selecting all goods from table and rendering them (render functions separated)
//


function selectAllGood()
{
    db.transaction(function(tx){
        tx.executeSql("select * from good;",
            [],
            (tx, response)=>{renderCard(response.rows);
                console.log(response);},
            (tx, error)=>{console.log(error.message)});
    });
}

function selectAllCart()
{
    db.transaction(function(tx){
        tx.executeSql('select * from v_cart;',
            [],
            (tx, response)=>{renderCart(response.rows)},
            (tx, error)=>{console.log(error.message)});
    });
}

// sum for cart from v_cartSum view

function getArrCartTotal() {

    let arrCartTotal;

    db.transaction(function(tx){
            tx.executeSql('select * from v_cartSum;',
                [],
                (tx, response)=>{getCartTotalArray(response.rows)},
                (tx, error)=>{console.log(error.message)});
    });

    function getCartTotalArray(list) {
        arrCartTotal = list;
        console.log(arrCartTotal);
    }

    return arrCartTotal;
}


// delete cart
function deleteCart() {
    document.querySelector('.tableRoot').remove();

}


// invoking view for cart table
// v_cartCreate();

// v_cartSumCreate();

// initGood();

// create customer cart table
initCustomerCart();

// select all and render
selectAllGood();

selectAllCart();

// //ВАЖНО ПРО ПЕРЕДАВАЕМЫЕ АРГУМЕНТЫ
//
// function success (){
//     console.log(arguments);
// }
//
// function error (...args){
//     console.log(args);
// }

// function renderTable(list) {
//     let arr = [...list];
//     let tableElem = document.createElement('table');
//
//     arr.forEach(function (elem) {
//         let trElem = document.createElement('tr');
//
//         for (let key in elem){
//             let tdElem = document.createElement('td');
//             tdElem.innerText = elem[key];
//             trElem.appendChild(tdElem);
//         }
//         tableElem.appendChild(trElem);
//     });
//     console.log(list);
//     console.log(arr);
//     document.querySelector('#root').appendChild(tableElem);
// }

// function selectAllGood() {
//     db.transaction(function (tx) {
//         tx.executeSql('select * from good;',
//             [],
//             (tx, response)=>renderTable(response.rows),
//             (tx, error)=>console.log(error.message));
//     });
// }

// try{
//     db = openDatabase('huw5', '1.0', 'Test DB', 2 * 1024 * 1024);
// }catch{
//     alert('У тебя в браузере нет WEBSQL. =(');
// }
//
// let goodCreate = `
//     create table good(
//         id integer primary key autoincrement,
//         title varchar(255),
//         description varchar(1024)
//     );
// `;
//
// let goodInsert = 'insert into good(title, description) values(?, ?)';
//
//
// function initGood() {
//     db.transaction(function (tx) {
//         tx.executeSql(goodCreate,
//             [],
//             ()=>{console.log('good table has been created successfully');},
//             ()=>{console.log('good table hasn`t been created successfully');});
//         tx.executeSql(goodInsert,
//             ['велосипед', "полезен для здоровья"],
//             ()=>{console.log('data has been inserted successfully');},
//             ()=>{console.log('data hasn`t been inserted successfully');});
//     });
// }