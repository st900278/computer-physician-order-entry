$(document).ready(function () {
    var flag = 1;
    var check = $("input:checkbox");
    for (var i = 0; i < check.length; i++) {
        if (!$(check[i]).is(":checked")) flag = 0;
    }
    if (flag == 0) {
        $("#send").prop("disabled", true);
    } else {
        $("#send").prop("disabled", false);
    }

    $("#send").on('click', function () {
        location.href = "/final";
    });

    $("input:checkbox").on('change', function () {
        var flag = 1;
        var check = $("input:checkbox");
        for (var i = 0; i < check.length; i++) {
            if (!$(check[i]).is(":checked")) flag = 0;
        }
        if (flag == 0) {
            $("#send").prop("disabled", true);
        } else {
            $("#send").prop("disabled", false);
        }
    });

    $("#back").on('click', function () {
        console.log("test");
        location.href = "/";
    });

});