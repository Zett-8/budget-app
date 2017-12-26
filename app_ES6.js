////////////////////// ////////////////////// //////////////////////
////////////////////// ////////////////////// //////////////////////

////////////////    View -- Model -- Controller    ////////////////



//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////    View


const View = (function () {

    const DomStrings = {
        titleDate: document.querySelector('.budget__title--month'),
        curBudget: document.querySelector('.budget__value'),
        income: document.querySelector('.budget__income--value'),
        expense: document.querySelector('.budget__expenses--value'),
        percent: document.querySelector('.budget__expenses--percentage'),
        delBtn: document.querySelector('.item__delete--btn'),
        inputBtn: document.querySelector('.add__btn'),
        inputType: document.querySelector('.add__type'),
        inputDescrip: document.querySelector('.add__description'),
        inputValue: document.querySelector('.add__value'),
        incLIst: document.querySelector('.income__list'),
        expLIst: document.querySelector('.expenses__list')
    };

    const formatNum = num => {
        return num = String(num).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    };

    return {
        getDOM: () => {
            return DomStrings;
        },

        displayDate: () => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const year = new Date().getFullYear();
            const month = new Date().getMonth();
            DomStrings.titleDate.textContent = `${months[month]}, ${year} `;
        },

        changeColor: () => {
            Array.from(document.querySelectorAll('.cc')).forEach(value => value.classList.toggle('red-focus'));
            DomStrings.inputBtn.classList.toggle('red');
        },

        getInput: () => {
            const inputItem = [DomStrings.inputType.value, DomStrings.inputDescrip.value, parseInt(DomStrings.inputValue.value, 10)];
            return inputItem;
        },

        clearForm: () => {
            DomStrings.inputDescrip.value = '';
            DomStrings.inputValue.value = '';
            DomStrings.inputDescrip.focus();
        },

        addItem: (id, type, des, value) => {
            value = formatNum(value);
            const texInc = `<div class="item clearfix" id="${type}-${id}"><div class="item__description">${des}</div>
<div class="right clearfix"><div class="item__value">+ ${value}</div><div class="item__delete"><button class="item__delete--btn">
<i class="ion-ios-close-outline"></i></button></div></div></div>`;

            const texExp = `<div class="item clearfix" id="${type}-${id}"><div class="item__description">${des}</div>
<div class="right clearfix"><div class="item__value">- ${value}</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn">
<i class="ion-ios-close-outline"></i></button></div></div></div>`;

            if (type === 'inc') {
                DomStrings.incLIst.insertAdjacentHTML('beforeend', texInc);
            } else {
                DomStrings.expLIst.insertAdjacentHTML('beforeend', texExp);
            }
        },

        displayBudget: (totals) => {
            if(totals.cur > 0){
                DomStrings.curBudget.textContent = '+ ' + formatNum(totals.cur);
            } else {
                DomStrings.curBudget.textContent = formatNum(totals.cur);
            }
            DomStrings.income.textContent = '+ ' + formatNum(totals.inc);
            DomStrings.expense.textContent = '- ' + formatNum(totals.exp);
            if (totals.per === 0) {
                DomStrings.percent.textContent = '--';
            } else {
                DomStrings.percent.textContent = totals.per + '%';
            }
        },

        displayPercent: (percent) => {
            const els = document.querySelectorAll('.item__percentage');
            els.forEach((value, index) => {
                value.textContent = percent[index];
            });
        },

        delItem: (type, id) => {
            const el = document.getElementById(type + '-' + id);
            el.parentNode.removeChild(el);
        }

    };


})();








//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////     model

const Model = (function () {

    let allData = {
        items: {
            inc: [],
            exp: []
        },

        totals: {
            cur: 0,
            inc: 0,
            exp: 0,
            per: 0
        }

    };

    class Item {
        constructor(id, type, des, value){
            this.id = id;
            this.type = type;
            this.des = des;
            this.value = value;
        }

    }

    return {

        addItem: (type, des, val) => {
            let id = 0;
            if (allData.items[type] == '') {
                id = 0;
            } else {
                id = allData.items[type][allData.items[type].length - 1].id + 1;
            }
            allData.items[type].push(new Item(id, type, des, val));

            return id;
        },

        delItem: (type, id) => {
            allData.items[type].forEach((value, index, array) => {
                if (value.id === id) {
                    array.splice(index, 1);
                }
            });
        },

        calBudget: () => {
            let incSum = 0, expSum = 0;
            allData.items['inc'].forEach((value) => {
                incSum += value.value;
            });
            allData.totals['inc'] = incSum;

            allData.items['exp'].forEach((value) => {
                expSum += value.value;
            });
            allData.totals['exp'] = expSum;

            allData.totals['cur'] = allData.totals['inc'] - allData.totals['exp'];

            if (allData.totals['inc'] !== 0 && allData.totals['exp'] !== 0){
                allData.totals['per'] = Math.round(allData.totals['exp'] / allData.totals['inc'] * 100);
            } else {
                allData.totals['per'] = 0;
            }

            return allData.totals;
        },

        calPercent: () => {
            let percents;
            if(allData.totals.inc > 0) {
                percents = allData.items['exp'].map(value => {
                    return Math.round(value.value / allData.totals.inc * 100)+'%';
                });
            } else {
                percents = allData.items['exp'].map(() => {
                    return '--';
                });
            }
            return percents;
        },

        // for testing
        showData: () => {
            return allData;
        }

    };





})();






//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////    Controller

const Controller = (function (viewCtrl, modelCrtl) {

    const DOM = viewCtrl.getDOM();

    const setEvent = () => {
        DOM.inputBtn.addEventListener('click', addItem);
        DOM.inputType.addEventListener('change', viewCtrl.changeColor);
        document.querySelector('.container').addEventListener('click', delItem);
        document.addEventListener('keypress', event => {
            if (event.keyCode === 13) {
                addItem();
            }
        });
    };

    const addItem = () => {
        let inputItem = viewCtrl.getInput();

        if (inputItem[1] && inputItem[2]) {

            viewCtrl.clearForm();

            // store to database and get ID
            inputItem.unshift(modelCrtl.addItem(...inputItem));

            // update UI
            viewCtrl.addItem(...inputItem);

            // update budget　& each percent
            updateBudget();
            updatePercent();
        }

    };

    const updateBudget = () => {
        const totals = modelCrtl.calBudget();
        viewCtrl.displayBudget(totals);
    };

    const updatePercent = () => {
        const percents = modelCrtl.calPercent();
        viewCtrl.displayPercent(percents);
    };

    const delItem = event => {
        let delID = (event.target.parentNode.parentNode.parentNode.parentNode.id).split('-');
        if (delID == '') {
            delID = (event.target.parentNode.parentNode.parentNode.id).split('-');
        }

        modelCrtl.delItem(delID[0],parseInt(delID[1], 10));

        viewCtrl.delItem(delID[0], delID[1]);

        updateBudget();

        updatePercent();
    };


    return {

        init: () => {
            setEvent();
            updateBudget();
            viewCtrl.displayDate();
        }

    };


})(View, Model);

Controller.init();
