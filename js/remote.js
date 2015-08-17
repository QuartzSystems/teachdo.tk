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
    var uP = function(url) {
        var sU = url.split(":");
        var ext = sU[0];
        ext = (ext == "http" || ext == "https" ? ext : "http"); //DETERMINE URL PROTOCOL
        var uri = (sU[1] ? sU[1] : sU[0]);
        var s_U = uri.split("/");
        var dom = (s_U[0] == "" && s_U[1] == "" ? s_U[2] : s_U[0]); //DETERMING DOMAIN NAME AND SUBDOMAIN
        return [ext, dom];
    };
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
        var attachment = post.attachment;
        var attachmentName;
        var attachmentURL;
        var hasAttachment = false;
        if(attachment) {
            attachmentName = attachment.name;
            attachmentURL = attachment.url;
            if(uP(attachmentURL)[1] == "drive.google.com" && uP(attachmentURL)[0] == "https") {
                hasAttachment = true;
            }
        }
        var headerSection = "<h1>{{title}}</h1><br>";
        var midSection = "<div class='panel panel-default'><div class='panel-body'>{{{content}}}</div></div><br>";
        var attachmentT = "{{#hasAttachment}}<h3>Attachment</h3><div class='row'><div class='col-md-4 col-xs-12'><a target='_blank' href='{{attachmentURL}}'>{{attachmentName}}</a></div></div><br><br>{{/hasAttachment}}"
        var footSection = "<h3>Tags</h3>{{{tagsRendered}}}<br>{{{attachmentRendered}}}";
        var headerR = Mustache.render(headerSection, {
            title: title
        });
        var midR = Mustache.render(midSection, {
            content: content
        });
        var attachmentR = "";
        if(hasAttachment) {
            attachmentR = Mustache.render(attachmentT, {
                attachmentURL: attachmentURL,
                attachmentName: attachmentName,
                hasAttachment: hasAttachment
            });
        }
        var tS = tags.split(" ").join("").split(",");
        var tagsRendered = "<h5><span class='label label-default'>" + tS.join("</span><span class='badge'>") + "</span></h5>";
        var footR = Mustache.render(footSection, {
            tagsRendered: tagsRendered,
            attachmentRendered: attachmentR
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
                    var srch = (location.search ? location.search.split("?")[1].split("&") : "");
                    var searchTerm = "";
                    for(var s in srch) {
                        if(srch[s].split("=")[0] == "q") {
                            searchTerm = srch[s].split("=")[1];
                        }
                    }
                    $('#main').html("");
                    if(!searchTerm) {
                        sitePath.child("postIndex").orderByChild("ts").on("child_added", function(ncS) {
                            cnt++;
                            console.log(searchTerm);
                            var newChild = ncS.val();
                            var template;
                            if(usesMicroCards) {
                                template = "{{#up}}<div class='panel panel-default'><div class='panel-body'><a href='/" + siteID + "/post/" + ncS.key() + "/'><h4>{{title}}</h4></a></div></div>{{/up}}";
                            } else {
                                template = "{{#up}}<div class='panel panel-default'><div class='panel-body'><a href='/" + siteID + "/post/" + ncS.key() + "/'><h3>{{title}}</h3></a><br><p>{{preview}}</div>{{/up}}"
                            }
                            $('#main').prepend(Mustache.render(template, newChild));
                            if(cnt >= len) {
                                $('#main').prepend("<form class='form-group'><input class='form-control' name='q' required placeholder='Search.'></form><br><h1>Posts</h1>");
                                resolveLinks();
                            }
                        });
                    } else {
                        $.getScript("https://cdn.rawgit.com/krisk/fuse/master/src/fuse.min.js", function() {
                            var q = [];
                            for(var s in postIndex) {
                                var z = postIndex[s];
                                z.k = s;
                                q.push(z);
                            }
                            var options = {
                                keys: ['title', 'preview', 'tags']
                            }
                            var f = new Fuse(q, options);
                            window.f = f;
                            var res = f.search(searchTerm);
                            console.log(res);
                            var len = res.length
                            for(var i in res) {
                                var cnt = i + 1;
                                var template;
                                if(usesMicroCards) {
                                    template = "{{#up}}<div class='panel panel-default'><div class='panel-body'><a href='/" + siteID + "/post/" + res[i].k + "/'><h4>{{title}}</h4></a></div></div>{{/up}}";
                                } else {
                                    template = "{{#up}}<div class='panel panel-default'><div class='panel-body'><a href='/" + siteID + "/post/" + res[i].k + "/'><h3>{{title}}</h3></a><br><p>{{preview}}</div>{{/up}}"
                                }
                                $('#main').prepend(Mustache.render(template, res[i]));
                                if(cnt >= len) {
                                    $('#main').prepend("<form class='form-group'><input class='form-control' name='q' required placeholder='Search.'></form><br><h1>Results for '" + hE(searchTerm) + "'</h1>");
                                    resolveLinks();
                                }
                            }
                            if(len == 0) {
                                $('#main').html("<form class='form-group'><input class='form-control' name='q' required placeholder='Search.'></form><br><h1>No results for '" + hE(searchTerm) + "'</h1>");
                                resolveLinks();
                            }
                        });
                    }
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
                        location.reload();
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