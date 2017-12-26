'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////// ////////////////////// //////////////////////
////////////////////// ////////////////////// //////////////////////

////////////////    View -- Model -- Controller    ////////////////


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////    View


var View = function () {

    var DomStrings = {
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

    var formatNum = function formatNum(num) {
        return num = String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
    };

    return {
        getDOM: function getDOM() {
            return DomStrings;
        },

        displayDate: function displayDate() {
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var year = new Date().getFullYear();
            var month = new Date().getMonth();
            DomStrings.titleDate.textContent = months[month] + ', ' + year + ' ';
        },

        changeColor: function changeColor() {
            Array.from(document.querySelectorAll('.cc')).forEach(function (value) {
                return value.classList.toggle('red-focus');
            });
            DomStrings.inputBtn.classList.toggle('red');
        },

        getInput: function getInput() {
            var inputItem = [DomStrings.inputType.value, DomStrings.inputDescrip.value, parseInt(DomStrings.inputValue.value, 10)];
            return inputItem;
        },

        clearForm: function clearForm() {
            DomStrings.inputDescrip.value = '';
            DomStrings.inputValue.value = '';
            DomStrings.inputDescrip.focus();
        },

        addItem: function addItem(id, type, des, value) {
            value = formatNum(value);
            var texInc = '<div class="item clearfix" id="' + type + '-' + id + '"><div class="item__description">' + des + '</div>\n<div class="right clearfix"><div class="item__value">+ ' + value + '</div><div class="item__delete"><button class="item__delete--btn">\n<i class="ion-ios-close-outline"></i></button></div></div></div>';

            var texExp = '<div class="item clearfix" id="' + type + '-' + id + '"><div class="item__description">' + des + '</div>\n<div class="right clearfix"><div class="item__value">- ' + value + '</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn">\n<i class="ion-ios-close-outline"></i></button></div></div></div>';

            if (type === 'inc') {
                DomStrings.incLIst.insertAdjacentHTML('beforeend', texInc);
            } else {
                DomStrings.expLIst.insertAdjacentHTML('beforeend', texExp);
            }
        },

        displayBudget: function displayBudget(totals) {
            if (totals.cur > 0) {
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

        displayPercent: function displayPercent(percent) {
            var els = document.querySelectorAll('.item__percentage');
            els.forEach(function (value, index) {
                value.textContent = percent[index];
            });
        },

        delItem: function delItem(type, id) {
            var el = document.getElementById(type + '-' + id);
            el.parentNode.removeChild(el);
        }

    };
}();

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////     model

var Model = function () {

    var allData = {
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

    var Item = function Item(id, type, des, value) {
        _classCallCheck(this, Item);

        this.id = id;
        this.type = type;
        this.des = des;
        this.value = value;
    };

    return {

        addItem: function addItem(type, des, val) {
            var id = 0;
            if (allData.items[type] == '') {
                id = 0;
            } else {
                id = allData.items[type][allData.items[type].length - 1].id + 1;
            }
            allData.items[type].push(new Item(id, type, des, val));

            return id;
        },

        delItem: function delItem(type, id) {
            allData.items[type].forEach(function (value, index, array) {
                if (value.id === id) {
                    array.splice(index, 1);
                }
            });
        },

        calBudget: function calBudget() {
            var incSum = 0,
                expSum = 0;
            allData.items['inc'].forEach(function (value) {
                incSum += value.value;
            });
            allData.totals['inc'] = incSum;

            allData.items['exp'].forEach(function (value) {
                expSum += value.value;
            });
            allData.totals['exp'] = expSum;

            allData.totals['cur'] = allData.totals['inc'] - allData.totals['exp'];

            if (allData.totals['inc'] !== 0 && allData.totals['exp'] !== 0) {
                allData.totals['per'] = Math.round(allData.totals['exp'] / allData.totals['inc'] * 100);
            } else {
                allData.totals['per'] = 0;
            }

            return allData.totals;
        },

        calPercent: function calPercent() {
            var percents = void 0;
            if (allData.totals.inc > 0) {
                percents = allData.items['exp'].map(function (value) {
                    return Math.round(value.value / allData.totals.inc * 100) + '%';
                });
            } else {
                percents = allData.items['exp'].map(function () {
                    return '--';
                });
            }
            return percents;
        },

        // for testing
        showData: function showData() {
            return allData;
        }

    };
}();

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////    Controller

var Controller = function (viewCtrl, modelCrtl) {

    var DOM = viewCtrl.getDOM();

    var setEvent = function setEvent() {
        DOM.inputBtn.addEventListener('click', addItem);
        DOM.inputType.addEventListener('change', viewCtrl.changeColor);
        document.querySelector('.container').addEventListener('click', delItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13) {
                addItem();
            }
        });
    };

    var addItem = function addItem() {
        var inputItem = viewCtrl.getInput();

        if (inputItem[1] && inputItem[2]) {

            viewCtrl.clearForm();

            // store to database and get ID
            inputItem.unshift(modelCrtl.addItem.apply(modelCrtl, _toConsumableArray(inputItem)));

            // update UI
            viewCtrl.addItem.apply(viewCtrl, _toConsumableArray(inputItem));

            // update budget　& each percent
            updateBudget();
            updatePercent();
        }
    };

    var updateBudget = function updateBudget() {
        var totals = modelCrtl.calBudget();
        viewCtrl.displayBudget(totals);
    };

    var updatePercent = function updatePercent() {
        var percents = modelCrtl.calPercent();
        viewCtrl.displayPercent(percents);
    };

    var delItem = function delItem(event) {
        var delID = event.target.parentNode.parentNode.parentNode.parentNode.id.split('-');
        if (delID == '') {
            delID = event.target.parentNode.parentNode.parentNode.id.split('-');
        }

        modelCrtl.delItem(delID[0], parseInt(delID[1], 10));

        viewCtrl.delItem(delID[0], delID[1]);

        updateBudget();

        updatePercent();
    };

    return {

        init: function init() {
            setEvent();
            updateBudget();
            viewCtrl.displayDate();
        }

    };
}(View, Model);

Controller.init();
