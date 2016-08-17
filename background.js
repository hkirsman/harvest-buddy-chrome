
var _getTimesMonth = function() {
  $.get("https://mearra.harvestapp.com/reports/users/960362?from=20160801&kind=month&till=20160831", function(data) {
    $html = $(data);
    var billable = parseFloat($html.find('span.billable-percent-key')[0].nextSibling.nodeValue.replace(',', '.'));
    var nonBillable = parseFloat($html.find('span.key-unbillable')[0].nextSibling.nodeValue.replace(',', '.'));
    console.log({
      "billable": billable,
      "nonBillable": nonBillable
    });
  });
};

function draw() {
  var canvas = document.createElement('canvas'); // Create the canvas
  canvas.width = 19;
  canvas.height = 19;

  var context = canvas.getContext('2d');
  context.fillStyle = "#fff";
  context.fillRect(0, 0, 19, 19);

  context.beginPath();
  context.rect(1, 0, 5, 19);
  context.fillStyle = "red";
  context.fill();

  context.beginPath();
  context.rect(7, 0, 5, 19);
  context.fillStyle = "#92CD00";
  context.fill();

  context.beginPath();
  context.rect(13, 0, 5, 19);
  context.fillStyle = "#92CD00";
  context.fill();

  chrome.browserAction.setIcon({
    imageData: context.getImageData(0, 0, 19, 19)
  });
}

_getTimesMonth();
draw();
