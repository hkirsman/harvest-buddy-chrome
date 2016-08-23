var background = chrome.extension.getBackgroundPage();
var msg = '' +
    '<h2>Day</h2>' +
    'Total: ' + (background.times.day.billable + background.times.day.nonBillable) + '/' +  background.config.minDayHours + '<br>' +
    'Billable: ' + background.times.day.billable +
    '<h2>Week</h2>' +
    'Total: ' + (background.times.week.billable + background.times.week.nonBillable) + '/' + (background.config.minDayHours * 5) + '<br>' +
    'Billable: ' + background.times.week.billable +
    '<h2>Month</h2>' +
    'Total: ' + (background.times.month.billable + background.times.month.nonBillable) + '/' + (background.config.minDayHours * 5) + '<br>' +
    'Billable: ' + background.times.month.billable;
document.write(msg);
