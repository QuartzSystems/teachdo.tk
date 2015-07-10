(function() {
    if(!tD) {
        throw "loadingError: tD not defined.";
    }
    var routes = {
        '/': function() {
            tD.loadPage("home");
        },
        '/signup': function() {
            tD.loadPage("signup");
        },
        '/logout': function() {
            tD.fb.unauth();
            location.hash = "#/";
        },
        '/dash': function() {
            tD.loadPage("dash");
        },
        '/dash/new': function() {
            tD.loadPage("newWebsite");
        },
        '/dash/:site': function(site) {
            window.dashManageSite = site;
            tD.loadPage("dashManage");
        },
        '/dash/:site/posts': function(site) {
            window.postsSite = site;
            tD.loadPage("posts");
        },
        '/dash/:site/approvedUsers': function(site) {
            window.approvedUsersSiteID = site;
            tD.loadPage("approvedUsers");
        },
        '/dash/:site/:post': function(site, post) {
            window.editSiteID = site;
            window.editPageID = post;
            console.log(site, post);
            tD.loadPage("edit");
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
    }
    router.init();
})();