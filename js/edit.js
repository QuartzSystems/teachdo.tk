(function() {
    //NAMESPACE EDIT
    var edit = {};
    //
    //
    edit.developerKey = "AIzaSyA1R-udkJcLPiBA7E_jqXsXHRTMpvB1FMI"; // The Client ID obtained from the Google Developers Console. Replace with your own Client ID.
    edit.clientId = "422024787105-vgoh3tm6btt7noccav67lnuub8s79ds1.apps.googleusercontent.com"
    edit.appId = "422024787105";
    edit.scope = ['https://www.googleapis.com/auth/drive'];
    edit.pickerApiLoaded = false;
    edit.oauthToken;
    edit.onAuthApiLoad = function() {
        $('#edit-attachButton').click(function() {
            window.gapi.auth.authorize({
                'client_id': edit.clientId,
                'scope': edit.scope,
                'immediate': false
            }, edit.handleAuthResult);
        });
    };
    edit.onPickerApiLoad = function() {
        edit.pickerApiLoaded = true;
        edit.createPicker();
    };
    edit.handleAuthResult = function(authResult) {
        if(authResult && !authResult.error) {
            edit.oauthToken = authResult.access_token;
            edit.createPicker();
        }
    };
    edit.createPicker = function() {
        if(edit.pickerApiLoaded && edit.oauthToken) {
            var view = new google.picker.View(google.picker.ViewId.DOCS);
            //view.setMimeTypes("image/png,image/jpeg,image/jpg");
            var picker = new google.picker.PickerBuilder().enableFeature(google.picker.Feature.NAV_HIDDEN).setAppId(edit.appId).setOAuthToken(edit.oauthToken).addView(view).addView(new google.picker.DocsUploadView()) /*.setDeveloperKey(edit.developerKey)*/ .setCallback(edit.pickerCallback).build();
            picker.setVisible(true);
        }
    };
    edit.cP = {};
    edit.pickerCallback = function(data) {
        if(data.action == google.picker.Action.PICKED) {
            var fileId = data.docs[0].id;
            var fileURL = data.docs[0].url;
            var fileName = data.docs[0].name;
            edit.cP.attachment = {
                url: fileURL,
                name: fileName
            };
            $('#edit-attachedFile').addClass("vis").removeClass("unvis");
            $('#edit-removeAttachedFile').addClass("vis").removeClass("unvis");
            $('#edit-attachedFile').text(fileName);
            edit.populateDB();
            console.log(data.docs[0]);
        }
    };
    $('#edit-removeAttachedFile').click(function() {
        edit.cP.attachment = null;
    });
    //
    //
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
    var lO = false;
    edit.loadContent = function(postS) {
        var post = postS.val();
        edit.cP = post;
        var time = new Date();
        time.setTime((edit.cP.lastTs ? edit.cP.lastTs : edit.cP.ts));
        $('time').text(moment(time.getTime()).fromNow());
        $('#creSav').text("Last saved ").addClass("vis").removeClass("unvis");
        var $el = $('#edit-postEditor');
        var $elT = $('#edit-postTitle');
        var $elTa = $('#edit-postTags');
        $el.val(post.content);
        if(!lO) {
            $elT.val(post.title);
            $elTa.val(post.tags);
        }
        if(edit.cP.attachment) {
            $('#edit-attachedFile').text(edit.cP.attachment.name);
            $('#edit-removeAttachedFile, #edit-attachedFile').removeClass("unvis").addClass("vis");
        } else {
            $('#edit-attachedFile, #edit-removeAttachedFile').removeClass("vis").addClass("unvis");
            setTimeout(function() {
                $('#edit-attachedFile').text("");
            }, 400);
        }
        lO = true;
        if(edit.cP.up) {
            $('#edit-publishRetractPost').removeClass("btn-success").addClass("btn-danger").html("Retract <span class=\"hidden-xs\">Post</span>");
        } else {
            $('#edit-publishRetractPost').removeClass("btn-danger").addClass("btn-primary").html("Publish <span class=\"hidden-xs\">Post</span>");
        }
    };
    edit.onPopulate = function() {
        edit.getPaths().postIndexPath.set({
            title: edit.cP.title,
            preview: tD.generateTextPreview(edit.cP.content, tD.pL.SHORT),
            id: edit.pageID,
            ts: edit.cP.ts,
            tags: edit.cP.tags,
            up: edit.cP.up,
            hasAttachment: (edit.cP.attachment ? true : false)
        }, function() {
            if($('#creSav').text() != "Saved ") $('#creSav').text("Saved ");
            var time = new Date();
            $('time').text(moment(time.getTime()).fromNow());
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
        edit.cP.lastTs = new Date().getTime();
        if(!edit.cP.attachment) edit.cP.attachment = null;
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
                $('#edit-removeAttachedFile').click(function() {
                    edit.cP.attachment = null;
                    $.snackbar({
                        content: "Attachment removed."
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
    window.edit = edit;
    edit.start();
})();