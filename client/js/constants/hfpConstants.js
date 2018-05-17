/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.constant('API_URL', 'https://hfp.kopavogur.is:4000/');
//hfpApp.constant('API_URL', 'http://localhost:4000/');
hfpApp.constant('COLORS', [
    "#0dad5c",
    "#ff906d",
    "#5594ba",
    "#90e662",
    "#ffbd6d",
    "#f16785",
    "#e6fa6b",
    "#b352bd"
]);
hfpApp.constant('CHART_TEXT_COLOR', '#444e52');
hfpApp.constant('MONTHS', [
    "veldu",
    "janúar",
    "febrúar",
    "mars",
    "apríl",
    "maí",
    "júní",
    "júlí",
    "ágúst",
    "september",
    "október",
    "nóvember",
    "desember",
    "allt"
]);
hfpApp.constant('YEARS', [
    "2014",
    "2015",
    "2016",
    "2017"
]);
hfpApp.constant('QUARTERS', [
    "veldu",
    "fyrsti",
    "annar",
    "þriðji",
    "fjórði",
    "allt"
]);
hfpApp.constant('INITIAL_VALUES', {
    'TYPE': 'expenses',
    'PERIOD': '2017-0',
    'LEVEL_EX': 0,
    'LEVEL_IN': 3
});
hfpApp.constant('LEVELS', {
    0: 'AffairGroup',
    1: 'Affair',
    2: 'DepartmentGroup',
    3: 'Department',
    4: 'PrimaryFinanceKey',
    5: 'SecondaryFinanceKey',
    6: 'FinanceKey',
    7: 'Creditors'
});
hfpApp.constant('URL_PARAMS', {
    "expenses" : [
        'Type',
        'Period',
        'Level',
        'AffairGroup',
        'Affair',
        'DepartmentGroup',
        'Department',
        'FinanceKey',
        'Creditor'
    ],
    "joint-revenue" : [
        'Type',
        'Period',
        'Level',
        'Department',
        'FinanceKey',
        'Creditor'
    ],
    "special-revenue" : [
        'Type',
        'Period',
        'Level',
        'AffairGroup',
        'Affair',
        'DepartmentGroup',
        'Department',
        'FinanceKey',
        'Creditor'
    ]
});
hfpApp.constant('FIREBASE_URL', 'https://hfpnew.firebaseIO.com/');
