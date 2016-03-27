/**
 * Created by agirmar on 20.3.2016.
 */
hfpApp.constant('API_URL', 'http://hfp.northeurope.cloudapp.azure.com:4000/');
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
hfpApp.constant('CHART_TEXT_COLOR', '#dadada');
hfpApp.constant('MONTHS', [
    "Veldu",
    "Janúar",
    "Febrúar",
    "Mars",
    "Apríl",
    "Maí",
    "Júní",
    "Júlí",
    "Ágúst",
    "September",
    "Október",
    "Nóvember",
    "Desember"
]);
hfpApp.constant('YEARS', [
    "2010",
    "2011",
    "2012",
    "2013",
    "2014"
]);
hfpApp.constant('QUARTERS', [
    "Veldu",
    "Fyrsti",
    "Annar",
    "Þriðji",
    "Fjórði"
]);
hfpApp.constant('INITIAL_VALUES', {
    'TYPE': 'expenses',
    'PERIOD': '2014-0',
    'LEVEL': 0
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
