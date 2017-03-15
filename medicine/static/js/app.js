function addslashes(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

$(document).ready(function () {
    var prohibit = [];
    var aler = $(".allergy").html().trim().split(",");
    for (var i = 0; i < aler.length; i++) {
        prohibit.push(aler[i].split("TABLETS")[0].trim() + " TABLETS");
    }
    var pro = $(".prohibit");
    for (var i = 0; i < pro.length; i++) {
        prohibit.push($(pro[i]).html().split("TABLETS")[0].trim() + " TABLETS");
    }
    console.log(prohibit);
    for (var i = 0; i < prohibit.length; i++) {

        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = "li[data-id^='" + prohibit[i] + "'] { background: red; }";
        document.head.appendChild(css);
    }

    var history = []
    var his = $(".history");
    for (var i = 0; i < his.length; i++) {
        history.push($(his[i]).html().split("TABLETS")[0].trim() + " TABLETS");
    }
    console.log(history);


    $('#textarea1').trigger('autoresize');
    var medicine_list;
    var medicine_cache = {};
    var answer = {};
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
    var medicine_template = _.template("<tr class='med_list' data-id='<%= id %>'><td class='med-num'></td><td><%= symptom %></td><td><select class='med-name' value='<%= pre_ans %>'></select></td><td><input type='number' min='0' max='10' step='0.25' value='0' class='med-amount'></td><td><%= unit %></td><td><%= amount_per_day %></td><td><%= days %></td></tr>");
    /*
    $(document).on('keydown', '.med-name', function (e) {
        var symptom = $(e.target).parent().parent().attr("data-id");
        $("#singleDropdown" + symptom + " li").each(function (idx) {
            if (_.contains(prohibit, $(this).attr("data-id"))) {
                $(this).addClass("back-highlight");;
            }
        });
    });
    */
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

                var symptom_num = sym2num[e.id].symptom;
                console.log(answer);
                var x = Math.floor((Math.random() * answer[symptom_num].length));

                var intersection = _.intersection(answer[symptom_num], history);

                var diff = _.difference(intersection, prohibit);

                if (diff.length != 0) var pre = diff[0];
                else var pre = _.difference(answer[symptom_num], prohibit)[0];
                
                console.log(prohibit);

                $("#medicine").append(medicine_template({
                    id: e.id,
                    pre_ans: pre,
                    symptom: e.text,
                    unit: "錠",
                    amount_per_day: 3,
                    days: 3
                }));
                for(var i=0;i<answer[symptom_num].length;i++){
                    $("tr[data-id='" + e.id + "'] select").append("<option value='"+answer[symptom_num][i]+"'>"+answer[symptom_num][i]+"</option>");
                }
                $("select").material_select();
                $("li span").each(function(){
                    var p = $(this).html();
                    for(var i=0;i<prohibit.length;i++){
                        if(p.indexOf(prohibit[i])!=-1){
                            $(this).css("background-color", "red");
                        }
                    }
                    console.log($(this).html()); 
                });
                $("tr[data-id='" + e.id + "'] div.med-name input").val(pre);
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
            medicine_list = e.res;
            console.log(medicine_list);

            for (var key in medicine_list) {
                if (!medicine_cache.hasOwnProperty(key)) {
                    medicine_cache[key] = {}
                }
                for (var i = 0; i < medicine_list[key].length; i++) {
                    for (var j = 0; j < medicine_list[key][i].length; j++) {
                        var tmp = medicine_list[key][i].slice(0, j + 1);
                        if (!medicine_cache[key].hasOwnProperty(tmp)) {
                            medicine_cache[key][tmp] = [];
                        }
                        medicine_cache[key][tmp].push({
                            'text': medicine_list[key][i].replace(/"/g, '&quot;'),
                            id: medicine_list[key][i].replace(/"/g, '&quot;')
                        });
                    }
                }
                //console.log(medicine_cache);
            }
            $.ajax('/answer_med', {
                dataType: 'json',
                success: function (e) {
                    answer = e.ans;
                    console.log(answer);
                }
            });

            $.ajax('/now_med', {
                dataType: 'json',
                success: function (e) {
                    for (var i = 0; i < e.length; i++) {

                        multiple.append({
                            'id': e[i].symptom,
                            'text': sym2num[e[i].symptom].alias
                        });
                        $("tr[data-id='" + e[i].symptom + "'] div.med-name input").val(e[i].med);
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
                    }
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
            var tar = $(data[i]).find('div.med-name input')[0];
            var amnt = $(data[i]).find('input.med-amount')[0];
            send['ill'].push({
                symptom: $(data[i]).attr("data-id"),
                med: $(tar).val(),
                amount: $(amnt).val()
            });
        }
        console.log(send);
        $.ajax('/save', {
            data: JSON.stringify(send),
            method: 'post',
            success: function (e) {
                location.href = "/check";
            }
        });
    });
});