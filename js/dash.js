(function() {
    //NAMESPACE DASH
    var dash = {};
    dash.checkUserInfo = function(cb) {
        var auth = tD.fb.getAuth();
        if(auth) {
            cb(true);
        }
    };
    dash.getWebsites = function() {
        tD.getView("linkView", function(linkView) {
            tD.getView("listView", function(listView) {
                tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/meta/ws").once("value", function(userWsSnap) {
                    var _userWs = userWsSnap.val();
                    var userWs = [];
                    for(var ws in _userWs) {
                        userWs.push({
                            content: Mustache.render(linkView, {
                                "content": tD.hE(_userWs[ws].name),
                                "hr": "#/dash/" + _userWs[ws].id
                            })
                        });
                    }
                    $('#dash-wsListView-container').html(Mustache.render(listView, {
                        items: userWs
                    }));
                    $('.noItemsLoaded').html("Oh no! You don't have any websites! <br> Create a new one by clicking the + button.")
                });
            });
        });
    };
    dash.getAuth = function() {
        dash.checkUserInfo(function(d) {
            var google = tD.fb.getAuth().google;
            var uP = google.cachedUserProfile;
            var img = uP.picture;
            var name = google.displayName;
            $('.dash-userIcon').attr("src", img);
            $('.dash-userName').text(name);
            dash.getWebsites();
        });
    };
    $('[data-toggle="tooltip"]').tooltip();
    dash.getAuth();
})();