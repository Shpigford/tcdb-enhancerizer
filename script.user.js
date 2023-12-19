// ==UserScript==
// @name         TCDb Enhancerizer
// @namespace    https://tcdb.com/
// @version      0.3
// @description  Adds new tools to get more out of Trading Card Database!
// @author       Shpigford
// @match        https://www.tcdb.com/*
// @match        https://tcdb.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=tcdb.com
// @homepageURL  https://github.com/Shpigford/tcdb-enhancerizer
// @supportURL   https://github.com/Shpigford/tcdb-enhancerizer/issues
// @grant        GM_xmlhttpRequest
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js
// @updateURL    https://raw.githubusercontent.com/Shpigford/tcdb-enhancerizer/main/script.user.js
// @downloadURL  https://raw.githubusercontent.com/Shpigford/tcdb-enhancerizer/main/script.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Limit to Transaction pages
  if (window.location.href.indexOf("YourTransactions.cfm") > -1) {
    // Make main content area full width.

    $('#content > div.col-md-9.nopadding').removeClass('col-md-9').addClass('col-md-12');
    $('#content > div.col-md-3.nopadding').remove();

    // Add bottom border to table rows
    $('#content > div > div:nth-child(1) > table.table.table-bordered > tbody > tr:nth-child(2) > td:nth-child(1) > table.table.table-borderless.table-sm > tbody > tr').css('border-bottom', '1px solid #ddd');
    $('#content > div > div:nth-child(1) > table.table.table-bordered > tbody > tr:nth-child(2) > td:nth-child(2) > table.table.table-borderless.table-sm > tbody > tr').css('border-bottom', '1px solid #ddd');

    // Alternate row colors
    $('#content > div > div:nth-child(1) > table.table.table-bordered > tbody > tr:nth-child(2) > td:nth-child(1) > table.table.table-borderless.table-sm > tbody > tr:nth-child(even)').css('background-color', '#eee');
    $('#content > div > div:nth-child(1) > table.table.table-bordered > tbody > tr:nth-child(2) > td:nth-child(2) > table.table.table-borderless.table-sm > tbody > tr:nth-child(even)').css('background-color', '#eee');

    // Build totals
    var total1 = 0;
    var total2 = 0;

    var tableRows1 = $('#content > div.col-md-12.nopadding > div:nth-child(1) > table.table.table-bordered > tbody > tr:nth-child(2) > td:nth-child(1) > table.table.table-borderless.table-sm > tbody > tr');
    var tableRows2 = $('#content > div.col-md-12.nopadding > div:nth-child(1) > table.table.table-bordered > tbody > tr:nth-child(2) > td:nth-child(2) > table.table.table-borderless.table-sm > tbody > tr');

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

            // Get the price element link/url
            var priceLink = priceElement.attr('href');

            // Remove any non-numeric characters from the price
            price = parseFloat(price.replace(/[^0-9\.]/g, ''));

            // Add the price to the total
            total += price;

            // Wantlist
            var wantlists = parseInt(responseDOM.find('span[title="Wantlists"]').text(), 10);
            wantlists = '<span class="badge bg-danger" title="Wantlists">' + wantlists + '</span>';

            // FSFT
            var fsft = parseInt(responseDOM.find('span[title="For Sale / Trade"]').text(), 10);
            fsft = '<span class="badge bg-success" title="For Sale / Trade">' + fsft + '</span>';

            // Append the price to the current row
            price = price.toFixed(2);

            if (price == 0) {
              row.append('<td style="text-align:right; color:gray;width:80px;">No price<br>' + wantlists + ' ' + fsft + '</td>');
            } else {
              row.append('<td style="text-align:right;width:80px;"><a href="' + priceLink + '" class="text-primary fw-bold">$' + price + '</a><br>' + wantlists + ' ' + fsft + '</td>');
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
  }
})();