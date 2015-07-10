(function() {
    var newPage = {};
    newPage.siteID = newPageSiteID;
    newPage.generateEmptyPage = function() {
        tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + newPage.siteID + "/postIndex").once("value", function(postIndexS) {
            var postIndex = postIndexS.val();
            var postID = btoa((postIndex ? tD.oL(postIndex) : 0)).split("+").join("-").split("/").join("_").split("=").join("");
            var post = {};
            post.title = "New Post";
            post.id = postID;
            post.content = "Some content here, some content there";
            post.tags = newPage.siteID;
            post.ts = new Date().getTime();
            post.up = false;
            var indexValue = {
                id: postID,
                preview: tD.generateTextPreview(post.content, tD.pL.LONG),
                title: post.title,
                tags: post.tags,
                up: false,
                ts: new Date().getTime()
            };
            tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + newPage.siteID + "/post/" + postID).set(post, function() {
                tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + newPage.siteID + "/postIndex/" + postID).set(indexValue, function() {
                    $.snackbar({content:"Post created."})
                    location.hash = "#/dash/" + newPage.siteID + "/" + postID;
                });
            });
        });
    };
    newPage.generateEmptyPage();
})();