(function() {
    //NAMESPACE NEWWEBSITE
    var newWebsite = {};
    newWebsite.validate = function() {
        var disabled = $('#newWebsite-submit').attr("disabled") == "disabled",
            red = $('#newWebsite-submit').hasClass("btn-danger"),
            green = $('#newWebsite-submit').hasClass("btn-success"),
            name = $('#newWebsite-name').val().split(" ").join("") != "",
            url = ($('#newWebsite-url').val().split(" ").join("") != "" && /^[a-zA-Z0-9_-]+$/.test($('#newWebsite-url').val()));
        if(name && url) {
            if(disabled) $('#newWebsite-submit').removeAttr("disabled");
            if(red) $('#newWebsite-submit').removeClass("btn-danger");
            $('#newWebsite-submit').addClass("btn-success");
        } else if(name || url) {
            if(disabled) $('#newWebsite-submit').removeAttr("disabled");
            if(green) $('#newWebsite-submit').removeClass("btn-success");
            $('#newWebsite-submit').addClass("btn-danger");
        } else {
            if(red) $('#newWebsite-submit').removeClass("btn-danger");
            if(green) $('#newWebsite-submit').removeClass("btn-success");
            $('#newWebsite-submit').attr("disabled", "disabled");
        }
    };
    newWebsite.validateSubmission = function(url, name) {
        tD.fb.child("data/url/" + url).once("value", function(currS) {
            var curr = currS.val();
            if(curr) {} else {
                tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + url).set({
                    title: name,
                    sett: {
                        privacyLevel: 0,
                        useMicroCards: true,
                        subtitle: "",
                        navColour: "#FFF"
                    }
                }, function() {
                    tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/meta/ws").push({
                        name: name,
                        id: url
                    }, function() {
                        console.log("Meta write succeeded.");
                    });
                    console.log("Data write succeeded. Initiating registry write.");
                    tD.fb.child("data/url/" + url).set(tD.fb.getAuth().uid, function() {
                        $.snackbar({
                            content: "Good job! Your website has been created."
                        });
                        location.hash = "#/dash/" + url;
                    });
                });
            }
        });
    };
    newWebsite.submit = function(e) {
        e.preventDefault();
        var disabled = $('#newWebsite-submit').attr("disabled") == "disabled",
            red = $('#newWebsite-submit').hasClass("btn-danger"),
            green = $('#newWebsite-submit').hasClass("btn-success"),
            name = $('#newWebsite-name').val().split(" ").join("") != "",
            url = ($('#newWebsite-url').val().split(" ").join("") != "" && /^[a-zA-Z0-9_-]+$/.test($('#newWebsite-url').val()));
        if(red) {
            if(!url) $.snackbar({
                content: "URL can only contain A-Z, a-z, 0-9, _, and -."
            });
            if(!name) $.snackbar({
                content: "Sorry, your site has to have a name."
            });
        } else {
            newWebsite.validateSubmission($('#newWebsite-url').val(), $('#newWebsite-name').val());
        }
    };
    $('input').keyup(newWebsite.validate);
    $('form').submit(newWebsite.submit);
})();