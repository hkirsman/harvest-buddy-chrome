var config = {
    'uid': 960362,
    'minBillablePercent': 0.7,
    'minDayHours': 7.5,
    'workdayEnds': {
      'hour': 18, // 0 - 23.
      'minute': 0 // 0 - 59.
    },
    colorBarOk: '#92CD00',
    colorBarNotOk: 'red'
  },
  times = {
    'month': {
      'billable': 0,
      'nonBillable': 0
    },
    'week': {
      'billable': 0,
      'nonBillable': 0
    },
    'day': {
      'billable': 0,
      'nonBillable': 0
    }
  },
  canvas,
  svgButtonBarMonth,
  svgButtonBarWeek,
  svgButtonBarDay;

/**
 * Round to 2 decimals.
 * @private
 */
var round = function(float) {
  return Math.round(float * 100) / 100;
};

/**
 * Get billable percent for day.
 */
var getBillablePercentDay = function() {
  if (typeof times === 'undefined') {
    var times = chrome.extension.getBackgroundPage().times;
  }
  var totalDayTime = times.day.nonBillable + times.day.billable;
  return totalDayTime > 0 ? round(times.day.billable / totalDayTime) : 0;
};

/**
 * Get billable percent for week.
 */
var getBillablePercentWeek = function() {
  if (typeof times === 'undefined') {
    var times = chrome.extension.getBackgroundPage().times;
  }
  var totalWeekTime = times.week.nonBillable + times.week.billable;
  return totalWeekTime > 0 ? round(times.week.billable / totalWeekTime) : 0;
};

/**
 * Get billable percent for month.
 */
var getBillablePercentMonth = function() {
  if (typeof times === 'undefined') {
    var times = chrome.extension.getBackgroundPage().times;
  }
  var totalMonthTime = times.month.nonBillable + times.month.billable;
  return totalMonthTime > 0 ? round(times.month.billable / totalMonthTime) : 0;
};

/**
 * Get month times from Harvest.
 * @private
 */
var _getTimesMonth = function() {
  var date = new Date(),
      firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10).split('-').join(''),
      lastDayofMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10).split('-').join(''),
      billable,
      nonBillable;
  $.get('https://mearra.harvestapp.com/reports/users/' + config.uid + '?from=' + firstDayOfMonth + '&kind=month&till=' + lastDayofMonth, function(data) {
    $html = $(data);
    if ($html.find('span.billable-percent-key').length) {
      billable = parseFloat($html.find('span.billable-percent-key')[0].nextSibling.nodeValue.replace(',', '.'));
      nonBillable = parseFloat($html.find('span.key-unbillable')[0].nextSibling.nodeValue.replace(',', '.'));
    }
    else {
      billable = 0;
      nonBillable = 0;
    }

    times.month = {
      "billable": billable,
      "nonBillable": nonBillable
    };

    _drawUpdateMonthBar();
  });
};

/**
 * Get week times from Harvest.
 * @private
 */
var _getTimesWeek = function() {
  var curr = new Date, // Get current date.
      first = curr.getDate() - curr.getDay(), // First day is the day of the month - the day of the week
      last = first + 6, // Last day is the first day + 6
      firstday = new Date(curr.setDate(first)).toISOString().slice(0, 10).split('-').join(''),
      lastday = new Date(curr.setDate(last)).toISOString().slice(0, 10).split('-').join(''),
      billable,
      nonBillable;
  $.get('https://mearra.harvestapp.com/reports/users/' + config.uid + '?from=' + firstday + '&kind=custom&till=' + lastday, function(data) {
    $html = $(data);
    if ($html.find('span.billable-percent-key').length) {
      billable = parseFloat($html.find('span.billable-percent-key')[0].nextSibling.nodeValue.replace(',', '.'));
      nonBillable = parseFloat($html.find('span.key-unbillable')[0].nextSibling.nodeValue.replace(',', '.'));
    }
    else {
      billable = 0;
      nonBillable = 0;
    }

    times.week = {
      "billable": billable,
      "nonBillable": nonBillable
    };
  });
};

/**
 * Get day times from Harvest.
 * @private
 */
var _getTimesDay = function() {
  var today = new Date().toISOString().slice(0, 10).split('-').join(''),
      billable,
      nonBillable;

  $.get('https://mearra.harvestapp.com/reports/users/' + config.uid + '?from=' + today + '&kind=custom&till=' + today, function(data) {
    $html = $(data);
    if ($html.find('SPAN.billable-percent-key').length) {
      billable = parseFloat($html.find('SPAN.billable-percent-key')[0].nextSibling.nodeValue.replace(',', '.'));
      nonBillable = parseFloat($html.find('SPAN.key-unbillable')[0].nextSibling.nodeValue.replace(',', '.'));
    }
    else {
      billable = 0;
      nonBillable = 0;
    }
    times.day = {
      "billable": billable,
      "nonBillable": nonBillable
    };
    _drawUpdateDayBar();
  });
};

/**
 * Check if stats for day are ok.
 */
var _isStatsForDayOk = function() {
  var
    dayOk = false,
    year = new Date().getFullYear(),
    month = new Date().getMonth(),
    day = new Date().getDate(),
    hours = config.workdayEnds.hour,
    minutes = config.workdayEnds.minute,
    seconds = 0,
    milliseconds = 0,
    workdayEndsDate = new Date(year, month, day, hours, minutes, seconds, milliseconds),
    timediff = workdayEndsDate.getTime() - new Date().getTime(),
    totalDayTime = times.day.billable + times.day.nonBillable,
    billableDayPercent = times.day.billable / totalDayTime,
    isBillableOk = billableDayPercent >= config.minBillablePercent,
    isTotalHoursOk;

  if (timediff <= 0) {
    // If workday is over.

    isTotalHoursOk = totalDayTime >= config.minDayHours;
    dayOk = isBillableOk && isTotalHoursOk;
  }
  else {
    // If workday is not over.

    isTotalHoursOk = totalDayTime + (timediff / (1000 * 60 * 60)) >= config.minDayHours;
    dayOk = isBillableOk && isTotalHoursOk;
  }

  return dayOk;
};

/**
 * Check if stats for week are ok.
 * @todo
 */
var _isStatsForWeekOk = function() {

};

/**
 * Check if stats for month are ok.
 */
var _isStatsForMonthOk = function() {
  var dayOk = false,
      businessDays = _businessDays(new Date()),
      totalMonthTime = times.month.billable + times.month.nonBillable,
      isBillableOk = getBillablePercentMonth() >= config.minBillablePercent,
      isTotalHoursOk = totalMonthTime >= businessDays[0] * config.minDayHours;

  if (isBillableOk && isTotalHoursOk) {
    dayOk = true;
  }

  return dayOk;
};

///**
// * Update daybar on icon.
// */
//var _updateDayBar = function() {
//  if (_isStatsForDayOk()) {
//    _drawUpdateDayBar(config.colorBarOk);
//  }
//  else {
//    _drawUpdateDayBar(config.colorBarNotOk)
//  }
//};

/**
 * Update weekbar on icon.
 * @todo
 */
var _updateWeekBar = function() {

};

///**
// * Update weekbar on icon.
// */
//var _updateMonthBar = function() {
//  if (_isStatsForMonthOk()) {
//    _drawUpdateMonthBar(config.colorBarOk);
//  }
//  else {
//    _drawUpdateMonthBar(config.colorBarNotOk)
//  }
//};

/**
 * Draw/update day bar on the icon.
 */
var _drawUpdateDayBar = function(color) {
  if (typeof color === 'undefined') {
    if (_isStatsForDayOk()) {
      color = config.colorBarOk;
    }
    else {
      color = config.colorBarNotOk;
    }
  }

  var context = canvas.getContext('2d');
  context.beginPath();
  context.rect(1, 0, 5, 19);
  context.fillStyle = color;
  context.fill();

  chrome.browserAction.setIcon({
    imageData: context.getImageData(0, 0, 19, 19)
  });
};

/**
 * Draw/update week bar on the icon.
 */
var _drawUpdateWeekBar = function(color) {
  var context = canvas.getContext('2d');
  context.beginPath();
  context.rect(7, 0, 5, 19);
  context.fillStyle = color;
  context.fill();

  chrome.browserAction.setIcon({
    imageData: context.getImageData(0, 0, 19, 19)
  });
};

/**
 * Draw/update month bar on the icon.
 */
var _drawUpdateMonthBar = function(color) {
  if (typeof color === 'undefined') {
    if (_isStatsForMonthOk()) {
      color = config.colorBarOk;
    }
    else {
      color = config.colorBarNotOk;
    }
  }

  var context = canvas.getContext('2d');
  context.beginPath();
  context.rect(13, 0, 5, 19);
  context.fillStyle = color;
  context.fill();

  chrome.browserAction.setIcon({
    imageData: context.getImageData(0, 0, 19, 19)
  });
};

var _drawInitialButton = function() {
  canvas = document.createElement('canvas'); // Create the canvas
  canvas.width = 19;
  canvas.height = 19;

  var context = canvas.getContext('2d');
  context.fillStyle = "#fff";
  context.fillRect(0, 0, 19, 19);

  _drawUpdateDayBar(config.colorBarOk);
  _drawUpdateWeekBar(config.colorBarOk);
  _drawUpdateMonthBar(config.colorBarOk);

  chrome.browserAction.setIcon({
    imageData: context.getImageData(0, 0, 19, 19)
  });
};

/**
 * Calculate business days in a month.
 */
var _businessDays = function(date) {

  // Copy date
  var t = new Date(date);
  // Remember the month number
  var m = date.getMonth();
  var d = date.getDate();
  var daysPast = 0, daysToGo = 0;
  var day;

  // Count past days
  while  (t.getMonth() == m) {
    day = t.getDay();
    daysPast += (day == 0 || day == 6)? 0 : 1;
    t.setDate(--d);
  }

  // Reset and count days to come
  t = new Date(date);
  t.setDate(t.getDate() + 1);
  d = t.getDate();

  while  (t.getMonth() == m) {
    day = t.getDay();
    daysToGo += (day == 0 || day == 6)? 0 : 1;
    t.setDate(++d);
  }
  return [daysPast, daysToGo];
};

var _updateTimes = function() {
  _getTimesMonth();
  _getTimesWeek();
  _getTimesDay();
};

_drawInitialButton();

_updateTimes();
setInterval(_updateTimes, 1000 * 60 * 5);
