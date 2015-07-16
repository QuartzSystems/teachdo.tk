(function() {
    //NAMESPACE POSTS
    var posts = {};
    posts.siteID = postsSite;
    posts.loadPosts = function(trm) {
        tD.getView("linkView", function(linkView) {
            tD.getView("listView", function(listView) {
                tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + posts.siteID + "/postIndex").once("value", function(userWsSnap) {
                    var wsPage = [];
                    if(!trm) {
                        var _wsPage = userWsSnap.val();
                        for(var page in _wsPage) {
                            wsPage.push({
                                content: Mustache.render(linkView, {
                                    "content": _wsPage[page].title,
                                    "hr": "#/dash/" + posts.siteID + "/" + _wsPage[page].id
                                }) + "<br><p>" + _wsPage[page].preview + "</p><br> <b>Tags:</b><a href='#/dash/" + posts.siteID + "/posts'><span class='badge'>" + (_wsPage[page].tags.split(",").join("</span>&nbsp;<span class='badge'>")) + "</span></a>",
                                ts: _wsPage[page].ts
                            });
                            console.log(_wsPage[page].ts)
                        }
                        $('#posts-postListView-container').html(Mustache.render(listView, {
                            items: wsPage.sort(function(a, b) {
                                console.log(a, b);
                                console.log(a.ts > b.ts)
                                return(a.ts > b.ts ? -1 : 1);
                            })
                        }));
                    } else {
                        if(userWsSnap.val()) {
                            var q = [];
                            for(var s in userWsSnap.val()) {
                                q.push(userWsSnap.val()[s]);
                            }
                            var options = {
                                keys: ['title', 'preview', 'tags']
                            }
                            var f = new Fuse(q, options);
                            window.f = f;
                            var res = f.search($('#posts-searchTerm').val());
                            console.log($('#posts-searchTerm').val())
                            console.log(res);
                            for(var i in res) {
                                wsPage.push({
                                    content: Mustache.render(linkView, {
                                        "content": tD.hE(res[i].title),
                                        "hr": "#/dash/" + posts.siteID + "/" + res[i].id
                                    }) + "<br><p>" + tD.hE(res[i].preview) + "</p><br> <b>Tags:</b><a href='#/dash/" + posts.siteID + "/posts'><span class='badge'>" + (res[i].tags.split(",").join("</span><span class='badge'>")) + "</span></a>"
                                });
                            }
                        }
                        $('#posts-postListView-container').html(Mustache.render(listView, {
                            items: wsPage
                        }));
                    }
                    $('.noItemsLoaded').html("It seems as though you haven't made any posts!<br> Press the + button to make one.");
                });
            });
        });
    };
    posts.addUI = function() {
        var $btn = $('#posts-newButton');
        $btn.click(function() {
            window.newPageSiteID = posts.siteID;
            $.getScript("/js/newPage.js");
        });
        $('#posts-searchTerm').keyup(function() {
            if($(this).val() != "") {
                posts.loadPosts(true);
            } else {
                posts.loadPosts();
            }
        });
    };
    posts.start = function() {
        posts.loadPosts();
        posts.addUI();
    };
    posts.start();
})();