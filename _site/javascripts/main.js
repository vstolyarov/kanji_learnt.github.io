$(function () {
    "use strict";
    var i, sortedData, dataSet = {};

    function addToSet(kana, kanji) {

        if (!(dataSet.hasOwnProperty(kana))) {
            dataSet[kana] = [kanji];
        }
        if (dataSet.hasOwnProperty(kana) && (dataSet[kana].indexOf(kanji) === -1)) {
            dataSet[kana].push(kanji);
        }
    }

    function hiragana2katakana(text) {
        var i, c, newText = "";

        for (i = 0; i < text.length; i += 1) {
            c = parseInt(text.charCodeAt(i) + 96, 10);
            newText += String.fromCharCode("0x" + c.toString(16));
        }
        return newText;
    }

    function draw_chart(data) {
        $('#history_chart').highcharts({
            chart: {type: 'spline'},
            title: {text: 'History chart'},
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    month: '%e. %b',
                    year: '%b'

                },
                title: {text: 'Date'}
            },
            yAxis: {
                title: {text: 'Number of Kanji'},
                min: 0
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x:%e-%b}: {point.data}'
            },
            series: [{
                name: 'Kanji learnt',
                data: data
            }]
        });
    }


    $('#main_content').append('<table cellpadding="0" cellspacing="0" border="0" class="display" id="kanji_learnt"></table>');

    // 1. Fetch data
    $.getJSON('data/kanji_learnt.json').done(function (data) {
        // 2. Manipulate data
        $.map(data, function (el) {
            for (i = 0; i < el.onyomi.length; i += 1) {
                if (el.onyomi[i] !== "") {
                    addToSet(el.onyomi[i], el.kanji);
                }
            }
            for (i = 0; i < el.kunyomi.length; i += 1) {
                if (el.kunyomi[i] !== "") {
                    addToSet(el.kunyomi[i], el.kanji);
                }
            }
        });

        // 3. Display data
        $('#total_kanji').html(data.length);
        $('#kanji_learnt').dataTable({
            paging: false,
            data: $.map(dataSet, function (values, key) {
                return {"Kana": key, "Kanji": values};
            }),
            columns: [
                { "data": "Kana", "title": "Kana" },
                { "data": "Kanji", "title": "Kanji" }
            ]
        });

        // 4. Set most recently learnt kanjis
        sortedData = data.sort(function (a, b) {
            a = new Date(a.added);
            b = new Date(b.added);
            return a > b ? -1 : a < b ? 1 : 0;
        });
        sortedData.slice(0, 13).forEach(function (obj) {
            var i, date, kanji, details, katakana = [];
            for (i = 0; i < obj.onyomi.length; i += 1) {
                katakana.push(hiragana2katakana(obj.onyomi[i]));
            }

            date = $(document.createElement('span'))
                .html("[" + obj.added + "] ")
                .css('font-style', 'oblique');
            kanji = $(document.createElement('span'))
                .html(obj.kanji)
                .css('font-weight', 'bold');
            details = $(document.createElement('span'))
                .html(" (" + katakana.join() + ", " +
                      obj.kunyomi + "): "  + obj.english);

            $(document.createElement('li'))
                .append(date)
                .append(kanji)
                .append(details)
                .appendTo('#latest_kanji>ul');
        });

        // 5. Set history chart
        var sumKanji = 0;
        draw_chart(_.map(
            _.groupBy(data.reverse(), function (obj) {return obj.added; }),
            function (obj, key) {
                sumKanji += _.reduce(obj, function (nbKanji, element) {
                    return parseInt(nbKanji, 10) + 1;
                }, 0);
                var d = new Date(key);
                return {
                    x: Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()),
                    y: sumKanji,
                    data: _.map(obj, function (el) { return el.kanji; })
                };
            }
        ));
    });
});