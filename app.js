

var BudgetController = (function () {

    const Expence = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expence.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expence.prototype.getPercentage = function () {
        return this.percentage;
    }

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (value) {
            sum += value.value;
        });
        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }



    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            // create new
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id +1;
            }else{
                ID = 0;
            }

            // create new item based on 'inc' or 'exp
            if (type === 'exp') {
                newItem = new Expence(ID, des, val);
            } else if (type === 'inc')  {
                newItem = new Income(ID, des, val);
            }
            // push it into our data structure
            data.allItems[type].push(newItem);
            // return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            let ids, index;
            ids = data.allItems[type].map(function (value, index) {
                return value.id;
            });
            index = ids.indexOf(id);

            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {

            // calculate total income and expenses
            calTotal('inc');
            calTotal('exp');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            }else{
                data.percentage = -1;
            }

        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (value, index, array) {
                value.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function () {
            let allPerc = data.allItems.exp.map(function (value, index, array) {
                return value.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percent: data.percentage
            }
        },
        
        testing: function () {
            console.log(data);
        }
    }
})();



var UIcontroller = (function () {

    const formatNumber = function (num, type) {
        let numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        // put a ',' after every three numbers
        int = String(numSplit[0]).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    const nodeLIstForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPerLavel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    return {
        getInput: function () {
            return{
                type: document.querySelector(DOMstrings.inputType).value, // inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },


        addListItem: function (obj, type) {
            let html, newHtml, element;
            // create html strings with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type == 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div><div class="item__delete">' +
                    '<button class="item__delete--btn"><div class="ion-ios-close-outline"></div></button></div></div></div>';

            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue)

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function (value, index, array) {
                value.value = '';
            });

            fieldArr[0].focus();
        },

        deleteListItem: function (selectorID) {
            const element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },


        displayBudget: function (obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');


            if (obj.percent > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percent + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentage: function (percentages) {
            const fields = document.querySelectorAll(DOMstrings.expensesPerLavel);

            nodeLIstForEach(fields, function (value, index) {
                if (percentages[index] > 0) {
                    value.textContent = percentages[index] + '%';
                } else {
                    value.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            let now, year, month, months;
            now = new Date();
            months = ['jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ', ' + year;
            console.log(now);
        },

        changeType: function () {

            let fields = document.querySelectorAll(DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeLIstForEach(fields, function (value) {
                value.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        },

        formatNumber: function(num, type) {
            num = Math.abs(num);
            num = num.toFixed(2);
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();


var contoroller = (function (budgetCtrl, UICtrl) {

    const setupEventListners =  function () {
        const DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    const updateBudget = function () {
        // 6. calculate the budget
        budgetCtrl.calculateBudget();

        // 7. return the budget
        let budget = budgetCtrl.getBudget();

        // 8. display hte budget on the UI
        UICtrl.displayBudget(budget);
    };

    const updatePercentage = function () {
        // 1. Calculate percentage
        budgetCtrl.calculatePercentages();

        // 2. read percentages from the budget controller
        let percentages = budgetCtrl.getPercentage();

        // 3. update the UI with the new percentage
        UICtrl.displayPercentage(percentages);
    }

    const ctrlAddItem = function () {
        var input, newItem;
        // 1. get the field input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0){

            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();
            updatePercentage();
        };

    };

    const ctrlDeleteItem = function (event) {
        let itemID, splitID, type, id;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID === '') {
            itemID = event.target.parentNode.parentNode.parentNode.id;
        }

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
        }

        // 1. delete item from the data structure
        budgetCtrl.deleteItem(type, id);
        // 2. delete the item from the UI
        UICtrl.deleteListItem(itemID);
        // 3. update and show the new budget
        updateBudget();
        updatePercentage();

    };

    return {
        init: function(){
            console.log('init');
            setupEventListners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percent: -1
            });
        }
    };

})(BudgetController, UIcontroller);

contoroller.init();