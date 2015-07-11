(function() {
    
    var resolveLinks = function() {
        hostname = new RegExp(location.host);
        // Act on each link
        $('a').each(function() {
            $('a').each(function() {
                if(this.host !== location.host) {
                    $(this).removeClass("local").addClass("external");
                } else {
                    $(this).removeClass("external").addClass("local").attr("href", $(this).attr("href").split("#topBarColour")[0] + "#topBarColour=" + $('nav').css('backgroundColor'));
                }
            });
        });
    };
    var fb = new Firebase("https://teachdo.firebaseio.com/");
    var lOD = function(colour) {
        //Light or dark
        var r, b, g, hsp, a = colour;
        if(a.match(/^rgb/)) {
            a = a.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
            r = a[1];
            b = a[2];
            g = a[3];
        } else {
            a = +("0x" + a.slice(1).replace( // thanks to jed : http://gist.github.com/983661
                a.length < 5 && /./g, '$&$&'));
            r = a >> 16;
            b = a >> 8 & 255;
            g = a & 255;
        }
        hsp = Math.sqrt( // HSP equation from http://alienryderflex.com/hsp.html
            0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
        if(hsp > 127.5) {
            return "#000";
        } else {
            return "#FFF";
        }
    };
    if(location.hash.split("=")[0] == "#topBarColour") {
        $('nav').css({
            backgroundColor: location.hash.split("=")[1],
            color: lOD(location.hash.split("=")[1])
        });
    }
    var hE = function(s) {
        //HTML escape
        var el = document.createElement("div");
        el.innerText = el.textContent = s;
        s = el.innerHTML;
        return s;
    };
    var buildPost = function(postS) {
        var post = postS.val();
        var title = hE(post.title);
        var converter = Markdown.getSanitizingConverter();
        var content = converter.makeHtml(post.content.split("script").join("SANITISED"));
        var tags = hE(post.tags);
        var headerSection = "<h1>{{title}}</h1><br>";
        var midSection = "<div class='panel panel-default'><div class='panel-body'>{{{content}}}</div></div><br>";
        var footSection = "<h3>Tags</h3>{{{tagsRendered}}}";
        var headerR = Mustache.render(headerSection, {
            title: title
        });
        var midR = Mustache.render(midSection, {
            content: content
        });
        var tS = tags.split(" ").join("").split(",");
        var tagsRendered = "<h5><span class='label label-default'>" + tS.join("</span><span class='badge'>") + "</span></h5>";
        var footR = Mustache.render(footSection, {
            tagsRendered: tagsRendered
        });
        var assembledSection = headerR + midR + footR;
        $('#main').html(assembledSection);
        resolveLinks();
    };
    var loadSite = function() {
        var sitePath = fb.child("data/usr/" + siteUser + "/ws/" + siteID);
        sitePath.child("title").once("value", function(siteTitleS) {
            var siteTitle = siteTitleS.val();
            $('.siteTitle').text(siteTitle);
            $('.navbar-brand').attr("href", "/" + siteID);
            $('title').html(siteTitle + " - teachDo");
            resolveLinks();
        });
        sitePath.child("sett").once("value", function(siteSettS) {
            var siteSett = siteSettS.val();
            var navbarColour = siteSett.navColour || "#000";
            var usesMicroCards = (siteSett.useMicroCards != null ? siteSett.useMicroCards : true);
            $('nav').css({
                "background-color": navbarColour
            });
            $('.navbar-brand').css({
                "color": lOD(navbarColour)
            });
            if(window.isHome) {
                var cnt = 0;
                $('#main').html("<br><div class='superCentre'><a class='btn btn-info' href='/" + siteID + "/posts'>All Posts</a></div>")
                resolveLinks();
                sitePath.child("postIndex").orderByChild("ts").limitToLast(10).on("child_added", function(ncS) {
                    cnt++;
                    var newChild = ncS.val();
                    var template;
                    if(usesMicroCards) {
                        var template = "{{#up}}<div class='panel panel-default'><div class='panel-body'><a href='/" + siteID + "/post/" + ncS.key() + "/'><h4>{{title}}</h4></a></div></div>{{/up}}";
                    } else {
                        var template = "{{#up}}<div class='panel panel-default'><div class='panel-body'><a href='/" + siteID + "/post/" + ncS.key() + "/'><h3>{{title}}</h3></a><br><p>{{preview}}</div>{{/up}}"
                    }
                    $('#main').prepend(Mustache.render(template, newChild));
                    resolveLinks();
                });
            } else if(window.isPost) {
                sitePath.child("post/" + window.postID).once("value", function(postS) {
                    if(postS.val()) {
                        buildPost(postS);
                    } else {
                        location.assign("/404");
                    }
                });
            } else if(window.isPostList) {
                sitePath.child("postIndex").once("value", function(pIS) {
                    var postIndex = pIS.val();
                    var len = Object.keys(postIndex).length;
                    var cnt = 0;
                    sitePath.child("postIndex").orderByChild("ts").on("child_added", function(ncS) {
                        cnt++;
                        var newChild = ncS.val();
                        var template;
                        if(usesMicroCards) {
                            var template = "{{#up}}<div class='panel panel-default'><div class='panel-body'><a href='/" + siteID + "/post/" + ncS.key() + "/'><h4>{{title}}</h4></a></div></div>{{/up}}";
                        } else {
                            var template = "{{#up}}<div class='panel panel-default'><div class='panel-body'><a href='/" + siteID + "/post/" + ncS.key() + "/'><h3>{{title}}</h3></a><br><p>{{preview}}</div>{{/up}}"
                        }
                        $('#main').prepend(Mustache.render(template, newChild));
                        if(cnt >= len) {
                            $('#main').prepend("<h1>Posts</h1>");
                            resolveLinks();
                        }
                    });
                });
            }
        });
    }
    if(loginRequired && !fb.getAuth()) {
        $('#main').addClass("superCentre").html("<div class='panel panel-default' id='signupContainer'><div class='panel-body'>You need to <button class='btn btn-danger btn-lg' id='loginBtn'>Log in</button> to view this site.</div></div>");
        $('#loginBtn').click(function() {
            fb.authWithOAuthPopup("google", function(error, authData) {
                if(error) {
                    fb.authWithOAuthRedirect("google", function(error, authData) {
                        if(!error) {
                            $('#signup-loginButton').off("click");
                        }
                    });
                } else {
                    $('#loginBtn').off("click");
                    $('#signupContainer').transition({
                        scale: 0
                    }, 600, "cubic-bezier(0,.81,.2,1)", function() {
                        loadSite();
                    });
                }
            }, {
                scope: ["email"]
            });
        });
    } else {
        loadSite();
    }
})();