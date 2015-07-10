(function() {
    //NAMESPACE APPROVEDUSERS
    var approvedUsers = {};
    approvedUsers.site = window.approvedUsersSiteID;
    approvedUsers.populateList = function() {
        tD.getView("responsiveRowView", function(responsiveRowView) {
            tD.getView("listView", function(listView) {
                tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + approvedUsers.site + "/approvedUsers").on("value", function(approvedUsersS) {
                    var _apprU = approvedUsersS.val();
                    var apprU = [];
                    for(var u in _apprU) {
                        apprU.push({
                            content: Mustache.render(responsiveRowView, {
                                col1: "<img src='" + _apprU[u].img + "' class='smallIcon'>\ <b data-toggle='tooltip' title='" + _apprU[u].em + "'>" + _apprU[u].name + "</b>",
                                col3: "<button class='form-control btn btn-danger approvedUsersDelete' data-user='" + u + "'>Remove</button>"
                            })
                        });
                    }
                    $('#approvedUsers-listContainer').html(Mustache.render(listView, {
                        items: apprU
                    }));
                    $('[data-toggle="tooltip"]').tooltip();
                    $('.noItemsLoaded').html("Oh no! You haven't approved any users! <br> Create a new one by clicking the + button.");
                    $('.approvedUsersDelete').off('click').click(function() {
                        var uid = $(this).attr("data-user");
                        tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + approvedUsers.site + "/approvedUsers/" + uid).remove(function() {
                            $.snackbar({
                                content: "User removed."
                            });
                        });
                    });
                });
            });
        });
    };
    approvedUsers.bindButton = function() {
        var $btn = $('#approvedUsers-addButton');
        $btn.click(function() {
            window.newApprovedUserSite = approvedUsers.site;
            $.getScript("/js/newApprovedUser.js");
        });
    };
    approvedUsers.start = function() {
        approvedUsers.populateList();
        approvedUsers.bindButton();
    }
    approvedUsers.start();
})();