(function() {
    //NAMESPACE EDIT
    var edit = {};
    edit.wsID = editSiteID;
    edit.pageID = editPageID;
    edit.getPaths = function() {
        var paths = {};
        paths.userID = tD.fb.getAuth().uid;
        paths.userPath = tD.fb.child("data/usr/" + paths.userID);
        paths.sitePath = paths.userPath.child("ws/" + edit.wsID);
        paths.postPath = paths.sitePath.child("post/" + edit.pageID);
        paths.postIndexPath = paths.sitePath.child("postIndex/" + edit.pageID);
        return paths;
    };
    edit.cP = {};
    var lO = false;
    edit.loadContent = function(postS) {
        var post = postS.val();
        edit.cP = post;
        var time = new Date();
        time.setTime(edit.cP.ts);
        var $el = $('#edit-postEditor');
        var $elT = $('#edit-postTitle');
        var $elTa = $('#edit-postTags');
        $el.val(post.content);
        if(!lO) {
            $elT.val(post.title);
            $elTa.val(post.tags);
        }
        lO = true;
        if(edit.cP.up) {
            $('#edit-publishRetractPost').removeClass("btn-success").addClass("btn-danger").html("Retract Post");
        } else {
            $('#edit-publishRetractPost').removeClass("btn-danger").addClass("btn-primary").html("Publish Post");
        }
    };
    edit.onPopulate = function() {
        edit.getPaths().postIndexPath.set({
            title: edit.cP.title,
            preview: tD.generateTextPreview(edit.cP.content, tD.pL.SHORT),
            id: edit.pageID,
            ts: edit.cP.ts,
            tags: edit.cP.tags,
            up: edit.cP.up
        }, function() {
            $('#creSav').text("Saved ");
            var time = new Date();
            $('time').attr('datetime', time.toISOString());
            $('time').timeago();
        });
    };
    edit.populateDB = function() {
        //TODO
        var paths = edit.getPaths();
        edit.cP.title = $('#edit-postTitle').val();
        edit.cP.content = $('#edit-postEditor').val();
        edit.cP.tags = $('#edit-postTags').val();
        if(!edit.cP.up) edit.cP.up = false;
        if(!edit.cP.ts) edit.cP.ts = new Date().getTime();
        paths.postPath.set(edit.cP, edit.onPopulate);
    };
    edit.isPopulatingDB = false;
    edit.registerPop = function() {
        if(edit.isPopulatingDB) return false;
        $('#edit-postTitle').keyup(function() {
            edit.populateDB();
        });
        $('#edit-postEditor').change(function() {
            edit.populateDB();
        });
        window.pDBI = setInterval(function() {
            edit.populateDB();
        }, 10000);
        edit.isPopulatingDB = true;
    };
    edit.isDowRegistered = false;
    edit.registerDow = function() {
        if(edit.isDowRegistered) return false;
        var paths = edit.getPaths();
        paths.postPath.on("value", edit.loadContent);
        window.regFbE.push(paths.postPath);
        edit.isDowRegistered = true;
    };
    edit.start = function() {
        edit.getPaths().postPath.once("value", function(z) {
            if(z.val()) {
                $('#edit-deletePost').click(function() {
                    bootbox.confirm("Are you sure you would like to delete this?", function(a) {
                        if(!a) {
                            return true;
                        }
                        var paths = edit.getPaths();
                        paths.postPath.remove(function() {
                            paths.postIndexPath.remove(function() {
                                location.hash = "#/dash/" + edit.wsID + "/posts";
                                location.reload();
                            });
                        });
                    });
                });
                $('#edit-publishRetractPost').click(function() {
                    if(!edit.cP.up) {
                        $.snackbar({
                            content: "Post published."
                        });
                        edit.getPaths().postPath.child("up").set(true);
                        edit.cP.up = true;
                        edit.getPaths().postIndexPath.child("up").set(true);
                    } else {
                        $.snackbar({
                            content: "Post retracted."
                        });
                        edit.getPaths().postPath.child("up").set(false);
                        edit.cP.up = false;
                        edit.getPaths().postIndexPath.child("up").set(false);
                    }
                });
                $('#edit-savePost').click(function() {
                    $.snackbar({
                        content: "Post saved."
                    });
                    edit.populateDB();
                });
                edit.registerDow();
                edit.registerPop();
            } else {
                location.hash = "#/404";
            }
        });
    };
    edit.start();
})();