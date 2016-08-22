var background = chrome.extension.getBackgroundPage();
var msg = '' +
    '<h2>Day</h2>' +
    (background.times.day.billable + background.times.day.nonBillable) + '/' +  background.config.minDayHours +
    '<h2>Week</h2>' +
    (background.times.week.billable + background.times.week.nonBillable) + '/' + (background.config.minDayHours * 5) +
    '<h2>Month</h2>' +
    (background.times.month.billable + background.times.month.nonBillable) + '/' + (background.config.minDayHours * 5);
document.write(msg);
