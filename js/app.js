(function() {
    if(!tD) {
        throw "loadingError: tD not defined.";
    }
    var TRANSITS = {
        "BACK":0,
        "FORWARD":1,
        "NONE": 2
    };
    var prev = "";
    var routes = {
        '/': function() {
            tD.loadPage("home", [(prev != ""), (false), (prev == "" || prev == "/")]);
            prev = "/";
        },
        '/signup': function() {
            tD.loadPage("signup", [false, false, true]);
            prev = "/signup";
        },
        '/logout': function() {
            tD.fb.unauth();
            location.hash = "#/";
            prev = "/logout";
        },
        '/dash': function() {
            tD.loadPage("dash", [(prev != "/" && prev != "/signup" && prev != ""), (prev == "/"), (prev == "")]);
            prev = "/dash";
        },
        '/dash/new': function() {
            tD.loadPage("newWebsite", [(prev != "/dash" && prev != ""), (prev == "/dash"), (prev == "")]);
            prev = "/dash/new";
        },
        '/dash/:site': function(site) {
            window.dashManageSite = site;
            tD.loadPage("dashManage", [(prev != "/dash" && prev != "/dash/new" && prev != ""), (prev == "/dash" || prev == "/dash/new"), (prev == "")]);
            prev = "/dash/" + site;
        },
        '/dash/:site/posts': function(site) {
            window.postsSite = site;
            tD.loadPage("posts", [(prev != "/dash/" + site && prev != ""), (prev == "/dash/" + site), (prev == "")]);
            prev = "/dash/" + site + "/posts";
        },
        '/dash/:site/approvedUsers': function(site) {
            window.approvedUsersSiteID = site;
            tD.loadPage("approvedUsers", [(prev != "/dash/" + site && prev != ""), (prev == "/dash/" + site), (prev == "")]);
            prev = "/dash/" + site + "/approvedUsers";
        },
        '/dash/:site/:post': function(site, post) {
            window.editSiteID = site;
            window.editPageID = post;
            console.log(site, post);
            tD.loadPage("edit", [(prev != "/dash/" + site + "/posts" && prev != ""), (prev == "/dash"), (prev == "")]);
            prev = "/dash/" + site + "/" + post;
        },
        '/404': function() {
            tD.loadPage("404");
        }
    };
    var _dL = function() {
        if(tD.fb.getAuth()) {
            $('#dashLink, #lOLink').fadeIn();
        } else {
            $('#dashLink, #lOLink').hide();
        }
    };
    tD.fb.onAuth(_dL);
    _dL();
    var router = Router(routes);
    if(!location.hash) {
        location.hash = "#/";
        prev = "/";
    }
    router.init();
})();