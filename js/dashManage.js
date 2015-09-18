(function() {
    //NAMESPACE DASHMANAGE
    var dashManage = {};
    dashManage.page = window.dashManageSite;
    dashManage.getSitePath = function() {
        return tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + dashManage.page);
    };
    dashManage.loadSiteData = function(cb) {
        dashManage.getSitePath().once("value", function(siteSnap) {
            if(cb) cb(siteSnap);
        });
    };
    dashManage.sett = function() {
        tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + dashManage.page + "/sett").once("value", function(settS) {
            var sett = settS.val();
            if(!sett) {
                sett = {};
            }
            //COLOUR
            if(!sett.navColour) sett.navColour = "#000000";
            $('#dashManage-navColour').val(sett.navColour);
            //TITLE
            $('#dashManage-siteTitle').val(dashManage.data.title);
            //CARD STYLE
            if(sett.useMicroCards == undefined) sett.useMicroCards = true;
            $('#dashManage-useMicroCards').attr("checked", sett.useMicroCards);
            $('#dashManage-usePreviewCards').attr("checked", !sett.useMicroCards);
            //SUBTITLE
            if(!sett.subtitle) sett.subtitle = "";
            $('#dashManage-siteSubtitle').val(sett.subtitle);
            //PRIVACY
            if(dashManage.data.privacyLevel == undefined) dashManage.data.privacyLevel = 0;
            $('#dashManage-privacyLevel1').attr("checked", dashManage.data.privacyLevel == 1);
            $('#dashManage-privacyLevel0').attr("checked", dashManage.data.privacyLevel == 0);
            //SAVE BUTTON
            $('#dashManage-saveSett').click(function() {
                if($('#dashManage-siteTitle').val().split(" ").join("") != "") {
                    //Get values
                    sett.navColour = $('#dashManage-navColour').val();
                    sett.useMicroCards = $('#dashManage-useMicroCards').is(":checked");
                    sett.subtitle = $('#dashManage-siteSubtitle').val();
                    //Set settings on server
                    tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + dashManage.page + "/sett").set(sett, function() {
                        //Set site title
                        tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + dashManage.page + "/title").set($('#dashManage-siteTitle').val(), function() {
                            tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + dashManage.page + "/privacyLevel").set(($('#dashManage-privacyLevel1').is(":checked") ? 1 : 0));
                            //Set title in meta D:
                            tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/meta/ws").once("value", function(wsMetaS) {
                                var wsMeta = wsMetaS.val();
                                for(var prop in wsMeta) {
                                    if(wsMeta[prop].id == dashManage.page) {
                                        var p = prop;
                                        break;
                                    }
                                }
                                if(!p) console.log("WAT");
                                if(p) tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/meta/ws/" + p + "/name").set($('#dashManage-siteTitle').val(), function() {
                                    bootbox.alert("Settings saved.", function() {
                                        location.reload();
                                    });
                                });
                            });
                        });
                    });
                } else {
                    bootbox.alert("You can't have an empty name.");
                }
            });
            $('#dashManage-deleteButton').click(function() {
                bootbox.confirm("Are you sure you would like to delete your site and all content? You can not recover any data once you've done this!", function(a) {
                    if(a) {
                        tD.fb.child("data/url/" + dashManage.page).remove(function() {
                            tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + dashManage.page).remove(function() {
                                tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/meta/ws").once("value", function(metaS) {
                                    var meta = metaS.val();
                                    var sI;
                                    for(var s in meta) {
                                        if(meta[s].id == dashManage.page) {
                                            sI = s;
                                        }
                                    }
                                    if(!sI) bootbox.alert("Error in deleting meta.");
                                    tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/meta/ws/" + sI).remove(function() {
                                        bootbox.alert("All done.", function() {
                                            location.hash = "#/dash";
                                        });
                                    });
                                });
                            });
                        });
                    }
                });
            });
        });
    };
    dashManage.populateUI = function() {
        dashManage.loadSiteData(function(siteSnap) {
            if(siteSnap.val()) {
                $('#dashManage-embedSite').val('<script src="http://tchd.tk/' + dashManage.page + '/embed.js"></script>');
                dashManage.data = siteSnap.val();
                $('.dashManage-wsName').text(dashManage.data.title);
                $('#dashManage-postsLink').attr("href", "/#dash/" + dashManage.page + "/posts");
                $('#dashManage-newPostLink').click(function(e) {
                    e.preventDefault();
                    $(this).transition({
                        scale: 0
                    });
                    window.newPageSiteID = dashManage.page;
                    $.getScript("/js/newPage.js");
                });
                //tD.regIT("#dashManage-newPostLink");
                $('#dashManage-siteLink').attr("href", "http://s.teachdo.tk/" + dashManage.page);
                if(dashManage.data.privacyLevel != 1) {
                    $('#dashManage-apprUsersLink').hide();
                } else {
                    $('#dashManage-apprUsersLink').attr("href", "#/dash/" + dashManage.page + "/approvedUsers");
                }
                dashManage.sett();
                $('[data-toggle="tooltip"]').tooltip();
            } else {
                location.hash = "#/404";
            }
        });
    };
    dashManage.populateUI();
})();