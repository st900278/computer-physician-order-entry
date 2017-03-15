$(document).ready(function(){
    
    $("#send").on('click', function(){
        console.log("test");
        location.href = "/saveDB";
    });
    

    
    $("#back").on('click', function(){
        
        location.href = "/check";
    });
    
});