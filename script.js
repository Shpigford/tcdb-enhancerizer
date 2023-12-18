// ==UserScript==
// @name         TCDb Enhancer
// @namespace    https://tcdb.com/
// @version      0.1
// @description  Adds new tools to get more out of Trading Card Database!
// @author       Shpigford
// @match        https://www.tcdb.com/*
// @match        https://tcdb.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tcdb.com
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// ==/UserScript==

(function () {
  'use strict';

  var total1 = 0;
  var total2 = 0;

  var tableRows1 = $('#content > div.col-md-9.nopadding > div:nth-child(1) > table.table.table-bordered > tbody > tr:nth-child(2) > td:nth-child(1) > table.table.table-borderless.table-sm > tbody > tr');
  var tableRows2 = $('#content > div.col-md-9.nopadding > div:nth-child(1) > table.table.table-bordered > tbody > tr:nth-child(2) > td:nth-child(2) > table.table.table-borderless.table-sm > tbody > tr');

  function calculateTotal(rows, total, callback) {
    var count = rows.length;

    rows.each(function () {
      var row = $(this); // Save the current row
      var url = row.find('a[href^="/ViewCard"]').attr('href');

      GM_xmlhttpRequest({
        method: "GET",
        url: "https://www.tcdb.com" + url,
        onload: function (response) {
          var responseHTML = response.responseText;
          var responseDOM = $(jQuery.parseHTML(responseHTML));

          var priceElement = $('li > a[href^="/Price.cfm"]', responseHTML);
          var price = priceElement.length > 0 ? priceElement.text() : '0';

          // Remove any non-numeric characters from the price
          price = parseFloat(price.replace(/[^0-9\.]/g, ''));

          // Add the price to the total
          total += price;

          // Append the price to the current row
          price = price.toFixed(2);
          if (price == 0) {
            row.append('<td style="text-align:right; color:gray;width:80px;">No price</td>');
          } else {
            row.append('<td style="text-align:right;color:green;">$' + price + '</td>');
          }

          count--;
          if (count === 0) {
            total = total.toFixed(2);
            callback(total);
          }
        }
      });
    });
  }

  calculateTotal(tableRows1, total1, function (total) {
    $('em:contains("item(s)")').eq(0).after("<strong class='float-end badge text-light bg-success'>Total: $" + total + "</strong>");
  });

  calculateTotal(tableRows2, total2, function (total) {
    $('em:contains("item(s)")').eq(1).after("<strong class='float-end badge text-light bg-success'>Total: $" + total + "</strong>");
  });
})();