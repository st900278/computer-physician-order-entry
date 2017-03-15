function addslashes(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

$(document).ready(function () {
    $('#textarea1').trigger('autoresize');
    var medicine_list;
    var medicine_cache = {};
    var sym2num = {
        'fever': 1,
        'cough': 2,
        'sputum': 3,
        'rhinitis': 4,
        'nausea': 5,
        'stomachache': 6,
        'flatulence': 7,
        'gastritis': 8,
        'anxiety': 9
    };
    var medicine_template = _.template("<tr data-id='<%= id %>'><td class='med-num'></td><td><input type='text' class='ill-name'></td><td><input type='text' class='med-name'><ul id='singleDropdown<%= id %>' class='dropdown-content ac-dropdown' style='width: auto; position: absolute; opacity: 1; display: none;'></ul></td><td><input type='number' min='0' max='10' step='0.25' value='0' class='med-amount'></td><td><%= unit %></td><td><%= amount_per_day %></td><td><%= days %></td></tr>");

    var complaint = $("#complaint").text()
    complaint = complaint.replace(/{{/g, "<span class='mark'>");
    complaint = complaint.replace(/}}/g, "</span>");
    $("#complaint").html(complaint);
    $('.chips').material_chip();
    var multiple = $('#multipleInput').materialize_autocomplete({
        multiple: {
            enable: true,
            maxSize: 9,
            onAppend: function (e) {
                console.log(e);
                
                 $("#medicine").append(medicine_template({
                    id: e.id,
                    unit: "錠",
                    amount_per_day: 3,
                    days: 3
                }));
                
                var single = $("tr[data-id='" + e.id + "'] input.med-name").materialize_autocomplete({
                    multiple: false,
                    dropdown: {
                        el: '#singleDropdown' + e.id
                    },


                });

                single.resultCache = medicine_cache;

            },
            onRemove: function (e) {
                $("tr[data-id='" + e.id + "']").remove();
            }
        },
        appender: {
            el: '#symptom',
            tagTemplate: '<div class="chip" data-id="<%= item.id %>" data-text="<%= item.text %>"><%= item.text %><i class="material-icons close">close</i></div>',
        },
        dropdown: {
            el: '#multipleDropdown'
        },

    });

    $.ajax('/sym_alias', {
        dataType: "json",
        success: function (e) {
            sym2num = e.alias;
        }
    });



    $.ajax('/medicine', {
        dataType: "json",
        success: function (e) {
            var med = e.res;
            for (var i = 0; i < med.length; i++) {
                for (var j = 0; j < med[i].text.length; j++) {
                    var tmp = med[i].text.slice(0, j + 1);
                    if (!medicine_cache.hasOwnProperty(tmp)) {
                        medicine_cache[tmp] = [];
                    }
                    //console.log(tmp);
                    //console.log(sick[i]);
                    medicine_cache[tmp].push(med[i]);
                }
            }
            for(var i=1;i<=3;i++){
                var single = $("tr[data-id='"+i.toString()+"'] input.med-name").materialize_autocomplete({
                    multiple: false,
                    dropdown: {
                        el: '#singleDropdown' + i.toString()
                    },


                });
                console.log("test");
                single.resultCache = medicine_cache;

            }
            
            $.ajax('/now_med', {
                dataType: 'json',
                success: function (e) {
                    for (var i = 0; i < e.length; i++) {
                        console.log(e[i]);
                        multiple.append({
                            'id': e[i].symptom,
                            'text': sym2num[e[i].symptom].alias
                        });
                        $("tr[data-id='" + e[i].symptom + "'] input.ill-name").val(e[i].symptom_ch);
                        $("tr[data-id='" + e[i].symptom + "'] input.med-name").val(e[i].med);
                        $("tr[data-id='" + e[i].symptom + "'] input.med-amount").val(e[i].amount);
                    }
                }
            });


        }

    });
    $.ajax('/symptom', {
        dataType: "json",
        success: function (e) {
            var wordList = {}
            sick = e.symptom;

            for (var i = 0; i < sick.length; i++) {
                for (var j = 0; j < sick[i].text.length; j++) {
                    var tmp = sick[i].text.slice(0, j + 1);
                    if (!wordList.hasOwnProperty(tmp)) {
                        wordList[tmp] = [];
                        console.log("test");
                    }
                    //console.log(tmp);
                    //console.log(sick[i]);
                    wordList[tmp].push(sick[i]);
                }
            }

            multiple.resultCache = wordList;
        }
    });


    $(".send").on('click', function (e) {
        $(e.target).attr("disabled", "disabled");
        var data = $("#add-medicine").find("tr[data-id]");
        var send = {
            ill: []
        }
        for (var i = 0; i < data.length; i++) {
            var sym = $(data[i]).find('input.ill-name')[0];
            var tar = $(data[i]).find('input.med-name')[0];
            var amnt = $(data[i]).find('input.med-amount')[0];
            send['ill'].push({
                symptom: $(data[i]).attr("data-id"),
                symptom_ch: $(sym).val(),
                med: $(tar).val(),
                amount: $(amnt).val()
            });
        }
        console.log(send);
        
        $.ajax('/save', {
            data: JSON.stringify(send),
            method: 'post',
            success: function (e) {
                location.href = "/final";
            }
        });
        
    });
});