'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-10-29T14:11:59.604Z',
    '2022-11-02T17:01:17.194Z',
    '2022-11-03T23:36:17.929Z',
    '2022-11-04T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-11-02T14:43:26.374Z',
    '2022-11-03T18:49:59.371Z',
    '2022-11-04T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const dispayDate = formatMovementDate(date, acc.locale);
    // time string. We need to convert this strings back into a JS object because we can actually work with that data

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${dispayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount;

// FAKE ALWAYS LOGGED IN
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // // Clear input fields
    // inputLoginUsername.value = inputLoginPin.value = '';
    // inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

// Create current date and time
const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  weekday: 'long',
};
const locale = navigator.language;
// console.log(locale);

labelDate.textContent = new Intl.DateTimeFormat(
  currentAccount.locale, // TRY ACC.LOCALE
  options
).format(now);
// console.log(currentAccount.locale);

// const day = `${now.getDate()}`.padStart(2, 0);
// const month = `${now.getMonth() + 1}`.padStart(2, 0);
// const year = now.getFullYear();
// const hour = `${now.getHours()}`.padStart(2, 0);
// const min = `${now.getMinutes()}`.padStart(2, 0);
// labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

////////////////////////////////////////////////////////////////////
///////////////////////////////LECTURES/////////////////////////////
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
/////////////////////CONVERTING AND CHECKING NUMBER/////////////////
////////////////////////////////////////////////////////////////////
/*
// We have one data-type for all numbers
console.log(23 === 23.0); // true
// Numbers always stored in binary format
// Base 10 - 0 to 9;  1/10 = 0.1. 3/10 = 3.333333
// Binary bbase 2 - 0
console.log(0.1 + 0.2); // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3); // false

// Convert string to a number
console.log(Number(23)); // 23 number
console.log(+'23'); // 23 number

// Parsing (reconverted number from a string). Regex - регулярное выражение
console.log(Number.parseInt('30px', 10)); // 30
console.log(Number.parseInt('e23', 10)); // NaN
console.log(Number.parseInt('30px', 2)); // NaN

// ParseFloat
console.log(Number.parseFloat('  2.5rem   ')); // 2.5
console.log(Number.parseInt('  2.5rem   ')); // 2

// ParseFloat and ParseInt - global functions
console.log(parseFloat('   2.5rem   ')); // 2.5 - Works without Number

// isNaN - for checking if any value is a number. IsNaN not a perfect way for checking if a value is a number
console.log(Number.isNaN(20)); // false (because its not a number, its regular value)
console.log(Number.isNaN('20')); // false
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0)); // false

// IsFinite - BETTER METHOD for checking!!!
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(+'20X')); // false
console.log(Number.isFinite(23 / 0)); // false

// isInteger
console.log(Number.isInteger(23)); // true
console.log(Number.isInteger(23.0)); // true
console.log(Number.isInteger(23 / 0)); // false
*/

////////////////////////////////////////////////////////////////////
//////////////////////////MATH AND ROUNDING/////////////////////////
////////////////////////////////////////////////////////////////////
/*
// Roots!
console.log(Math.sqrt(25)); // 5
console.log(25 ** 1 / 2); // 12,5 square root
console.log(8 ** 1 / 3); // 2 cubic root

// Math.max
console.log(Math.max(5, 18, 23, 11, 2)); // 23
console.log(Math.max(5, 18, '23', 11, 2)); // 23
console.log(Math.max(5, 18, '23px', 11, 2)); // NaN (not work)

// Math.min
console.log(Math.min(5, 18, 23, 11, 2)); // 2

// Math.PI
console.log(Math.PI * Number.parseFloat('10px') ** 2); // How to calculate radius of circle // 314.1592653589793

// Math.random
console.log(Math.trunc(Math.random() * 6) + 1); // Random from 1 to 6

// Function for random mix and max (with Math.floor - work with negative numbers)
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min; // Math.random - between 0 and 1 -> 0...(max-min) -> min... max
console.log(randomInt(10, 20));

// Rounding integers
console.log(Math.trunc(23.3)); // 23 Remove decimal parts always
console.log(Math.round(23.9));

console.log(Math.round(23.3)); // 23 Remove decimal parts always
console.log(Math.round(23.9));

console.log(Math.ceil(23.3)); // 24 Always round up
console.log(Math.ceil(23.9)); // 24 Always round up

console.log(Math.floor(23.3)); // 23 Always round down
console.log(Math.floor('23.9')); // 23 Always round down

console.log(Math.trunc(23.3));

console.log(Math.trunc(-23.3)); // -23
console.log(Math.floor(-23.3)); // -24 math.floor - better!

// Rounding decimals
console.log((2.7).toFixed(0)); // 3 - string!!!
console.log((2.7).toFixed(3)); // 2,700 - string!!!
console.log((2.345).toFixed(2)); // 2,35 - string!!!
console.log(+(2.345).toFixed(2)); // 2,35 - string!!!

// !!! Primitives don't have methods. JS behind the scenes will do boxing, and boxing transform this primitives to a number objects, then call the method on that object !!! -> and converting back to primitive
*/

////////////////////////////////////////////////////////////////////
////////////////////////THE REMAINDER OPERATOR//////////////////////
////////////////////////////////////////////////////////////////////
/*
// Remainder - остаток
console.log(5 % 2); // 1
console.log(5 / 2); // 2.5 (5 = 2 * 2 + 1) - 1 is remainder

console.log(8 % 3); // 2
console.log(8 / 3); // 8 = 2 * 3 + 2 - remainder

console.log(6 % 2); // remainder 0
console.log(6 / 2); // 6 = 2 * 3

console.log(7 % 2); // 7 = 2 * 3 + 1 - remainder
console.log(7 / 2); // 3.5

const isEven = n => n % 2 === 0;
console.log(isEven(8)); // true
console.log(isEven(23)); // false
console.log(isEven(514)); // true

// Nth (каждый)
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';
    if (i % 3 === 0) row.style.backgroundColor = 'green';
  });
});
*/

////////////////////////////////////////////////////////////////////
////////////////////////NUMERIC SEPARATORS//////////////////////////
////////////////////////////////////////////////////////////////////
/*
// 287,460,000,000
const diameter = 287_460_000_000;
console.log(diameter); // 287460000000

const priceCents = 345_99;
console.log(priceCents); // 34599

// Fee - платеж
const transferFee1 = 15_00;
const transferFee2 = 1_500;

const PI = 3.14_15;
console.log(PI); // 3.1415

const PI2 = 3._1415;
console.log(PI2); // Error

console.log(Number("230_000")); // NaN. JS will not be able to parse the number correctly out of that string
*/

////////////////////////////////////////////////////////////////////
///////////////////////WORKING WITH BIGINT//////////////////////////
////////////////////////////////////////////////////////////////////

/*
// 64 bits(of any number) = only 53 are used to actually store the digits themselves. The rest are for storing the position of decimal point and the sign
// 53 bits for store the digits - that menas that there is a limit for how big number can be

console.log(2 ** 53 - 1); // 9007199254740991 (biggest number in JS) (2 - only zeors and ones). Any integer that is large than this, is not safe
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1); // 9007199254740992. If we do calculations bigger then 9007199254740991, then we might lose precision

// All number bigger then 9007199254740991 - unsafe numbers!
console.log(2 ** 53 + 1); // 9007199254740991
console.log(2 ** 53 + 2); // 9007199254740994
console.log(2 ** 53 + 3); // 9007199254740996
console.log(2 ** 53 + 4); // 9007199254740996
console.log(2 ** 53 + 5); // 9007199254740996

// From IE2020 - BigInt (can be used to store numbers as large as we want)
// Creating some big numbers
console.log(48484848481901903903930930913019039019n); // With ...n - JS can accurately work with this number
console.log(BigInt(484848484819));

// Operations
console.log(10000n + 10000n); // 20000n
console.log(56585484515151548485638978626485138451654815215815n * 100000n);
// console.log(Math.sqrt(16n)); // Cannot convert BigInt value to a number

const huge = 2024944923234324232n;
const num = 23;
// console.log(huge * num); // TypeError: Cannot mix BigInt and other types, use explicit conversions
console.log(huge * BigInt(num)); // works

// Exceptions
console.log(20n > 15); // true
console.log(20n === 20); // false
console.log(typeof 20n); // bigint
console.log(20n == '20');
console.log(huge + '  is REALLY big'); // 2024944923234324232  is REALLY big

// Divisions
console.log(10n / 3n); // 3n (cut all decimal part)
console.log(10 / 3); // 3,3333333335
*/

////////////////////////////////////////////////////////////////////
//////////////////////////CREATING DATES////////////////////////////
////////////////////////////////////////////////////////////////////
/*
// Create a date
const now = new Date();
console.log(now); // Sat Nov 05 2022 12:10:40 GMT+0300 (Москва, стандартное время)

console.log(new Date('Sat Nov 05 2022 12:10:40')); // Sat Nov 05 2022 12:10:40 GMT+0300 (Москва, стандартное время)
console.log(new Date('December 24, 2015')); // Thu Dec 24 2015 00:00:00 GMT+0300 (Москва, стандартное время)

console.log(new Date(account1.movementsDates[0])); // Tue Nov 19 2019 00:31:17 GMT+0300 (Москва, стандартное время)
console.log(new Date(2037, 10, 19, 15, 23, 5)); // Thu Nov 19 2037 15:23:05 GMT+0300 (Москва, стандартное время)
console.log(new Date(2037, 10, 31, 15, 23, 5)); // Tue Dec 01 2037 15:23:05 GMT+0300 (Москва, стандартное время) AUTOCORRECT (nov 31)

console.log(new Date(0)); // Thu Jan 01 1970 03:00:00 GMT+0300 (Москва, стандартное время
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // converted to milliseconds (Sun Jan 04 1970 03:00:00 GMT+0300 (Москва, стандартное время)). Timestamp = 3 days (3 * 24 * 60 * 60 * 1000 = 259200000)


// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear()); // 2037
console.log(future.getMonth()); // 10
console.log(future.getDate()); // 19
console.log(future.getDay()); // 4 (day of the week)
console.log(future.getHours()); // 15
console.log(future.getMinutes()); // 23
console.log(future.getSeconds()); // 0
console.log(future.toISOString()); // 2037-11-19T12:23:00.000Z
console.log(future.getTime()); // 2142246180000 (timestamp)

console.log(new Date(2142246180000)); // Thu Nov 19 2037 15:23:00 GMT+0300 (Москва, стандартное время)

console.log(Date.now()); // 1667640236039

future.setFullYear(2040);
console.log(future); // Mon Nov 19 2040 15:23:00 GMT+0300 (Москва, стандартное время)
*/

////////////////////////////////////////////////////////////////////
//////////////////////OPERATION WITH DATES//////////////////////////
////////////////////////////////////////////////////////////////////
/*
// If we convert date to a number, result always is going to be in a milliseconds (timestamp)

const future = new Date(2037, 10, 19, 15, 23);
console.log(Number(future)); // 2142246180000 -timestamp
console.log(+future); // 2142246180000 -timestamp

const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(
  new Date(2037, 3, 4),
  new Date(2037, 3, 14, 10, 8)
);
console.log(days1); // 10 days "(1000 * 60 * 60 * 24) - avoid timestamp"
*/

////////////////////////////////////////////////////////////////////
//////////////////INTERNATIONALIZING NUMBERS (INTL)///////////////////
////////////////////////////////////////////////////////////////////
/*
const num = 3884764.23;

const options2 = {
  style: 'currency', // unit, percent or currency
  unit: 'celsius', // mile-per-hour
  currency: 'EUR',
  // useGrouping: false,
};

console.log('US: ', new Intl.NumberFormat('en-US', options2).format(num)); // US:  US:  3,884,764.23 mph
console.log('Germany: ', new Intl.NumberFormat('de-DE', options2).format(num)); // Germany:  3.884.764,23 mi/h
console.log('Syria: ', new Intl.NumberFormat('ar-SY', options2).format(num)); // Syria:   ٣٬٨٨٤٬٧٦٤٫٢٣
console.log(
  'Browser: ',
  new Intl.NumberFormat(navigator.language, options2).format(num)
); // Browser:   3 884 764,23 ми/ч
*/
