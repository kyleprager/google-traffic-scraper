$ = require('jquery');

(function () {
    // Result object that will be created
    var results = [];

    // URLs representing routes on Google Maps
    var urls = [
        'https://maps.google.com/maps?saddr=Auzerais+Ave,+San+Jose,+CA&daddr=37.294157,-121.9698917+to:1601+S+De+Anza+Blvd+%23165,+Cupertino,+CA&hl=en&sll=37.297681,-121.980171&sspn=0.095863,0.158787&geocode=Fel8OQId5-27-CkVGhHIV8uPgDE4sEctF9WxdA%3BFU0QOQIdHeO6-CmbG3l7NTWOgDGdLBv0IhBeGA%3BFfcVOQId2u25-CmV5Mb3IbWPgDHSYGaXGvYtxw&mra=dpe&mrsp=1&sz=13&via=1&t=m&z=13',
        'https://maps.google.com/maps?saddr=Auzerais+Ave,+San+Jose,+CA&daddr=1601+S+De+Anza+Blvd+%23165,+Cupertino,+CA&hl=en&ll=37.315021,-121.978455&spn=0.09584,0.158787&sll=37.306576,-121.965717&sspn=0.095851,0.158787&geocode=Fel8OQId5-27-CkVGhHIV8uPgDE4sEctF9WxdA%3BFfcVOQId2u25-CmV5Mb3IbWPgDHSYGaXGvYtxw&mra=ls&t=m&z=13',
        'https://maps.google.com/maps?saddr=Auzerais+Ave,+San+Jose,+CA&daddr=37.29537,-121.931773+to:37.2941684,-121.9690175+to:1601+S+De+Anza+Blvd+%23165,+Cupertino,+CA&hl=en&sll=37.283682,-121.970387&sspn=0.04794,0.079393&geocode=Fel8OQId5-27-CkVGhHIV8uPgDE4sEctF9WxdA%3BFQoVOQIdA3i7-Ckpr5a3xTSOgDH_UanUSeqAgg%3BFVgQOQIdh-a6-CmbG3l7NTWOgDGdLBv0IhBeGA%3BFfcVOQId2u25-CmV5Mb3IbWPgDHSYGaXGvYtxw&mra=dpe&mrsp=2&sz=14&via=1,2&t=m&z=14',
        'https://maps.google.com/maps?saddr=Auzerais+Ave,+San+Jose,+CA&daddr=37.3234712,-121.9278006+to:37.3231072,-121.9866874+to:37.3229887,-122.0321463+to:1601+S+De+Anza+Blvd+%23165,+Cupertino,+CA&hl=en&ll=37.299593,-121.983089&spn=0.083843,0.145741&sll=37.30246,-121.994934&sspn=0.08384,0.145741&geocode=Fel8OQId5-27-CkVGhHIV8uPgDE4sEctF9WxdA%3BFc-COQIdiIe7-CnJl0QqP8uPgDFLmCqth_i6ig%3BFWOBOQIdgaG6-Cl1jp9chMqPgDHUQgytrDtpVw%3BFeyAOQId7u-5-CkpZMuJrrWPgDFfQ4IFo7NOVw%3BFfcVOQId2u25-CmV5Mb3IbWPgDHSYGaXGvYtxw&mra=dpe&mrsp=3&sz=13&via=1,2,3&t=m&z=13'
    ];

    // List of deferred objects.  Each one represents one URL being fetched and parsed.
    var deferredList = [];

    // Parse each URL and add the returned deferred to the deferredList
    for (var idx in urls) {
        deferredList.push(getRoutes(urls[idx], results));
    }

    // Log or otherwise display the results after all the deferred have been resolved (URLs have been fetched and parsed)
    $.when.apply(this, deferredList).done(function () {
        results = results.sort(sortResultsByName);
        logResults(results);
        printResultsCSV(results);
    });

    /**
     * START HELPER FUNCTIONS - Helper functions to print out results
     */
    function logResults(data) {
        console.log(data);
    }

    function printResultsCSV(data) {
        for (var idx in data) {
            var r = data[idx];
            console.log("\"" + [r.routeName, r.dateTime, r.timeWithTraffic].join("\",\"") + "\"");
        }
    }

    function sortResultsByName(a, b) {
        return a.routeName > b.routeName;
    }
    /**
     * END HELPER FUNCTIONS
     */

    /**
     * This function takes a URL to a Google Maps directions results page with route options and puts the route information
     * into a list of route information objects.  It returns a deferred object (really a promise object) that can be used
     * to chain callbacks to.  You can also call this function looping over multiple URLs and save them all to a list.  Then
     * you apply $.when() to chain an event handler that triggers after all the deferred objects are done executing.
     * @param url Google Maps URL with direction results with route options.
     * @returns {*} returns a promise object that can be used as a deferred.
     */
    function getRoutes(url, resultsList) {
        return $.get(url,function (data) {
            var container = $(data).find(".dir-altroute-inner");
            $.each(container, function (idx, route) {
                route = $(route); // make route a jquery object
                var routeName = route.find('div').eq(2).html();
                var info = route.find('.altroute-info').find('span');
                var distance = info.eq(0).html();
                var timeWithoutTraffic = info.eq(1).html();
                var timeWithTraffic = route.find('.altroute-aux').find('span').html().split(':')[1].trim();
                resultsList.push({
                    routeName: routeName,
                    distance: splitTimeDistanceStrings(distance),
                    timeWithoutTraffic: splitTimeDistanceStrings(timeWithoutTraffic),
                    timeWithTraffic: splitTimeDistanceStrings(timeWithTraffic),
                    dateTime: new Date()
                });
            });
        }).promise();
    }

    function splitTimeDistanceStrings(str) {
        return parseFloat(str.split(' ')[0]);
    }
})();
