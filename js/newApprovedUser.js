(function() {
    //NAMESPACE NEWAPPROVEDUSER
    var newApprovedUser = {};
    newApprovedUser.site = newApprovedUserSite;
    newApprovedUser.register = function(em) {
        var sitePath = tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/ws/" + newApprovedUser.site);
        sitePath.child("approvedUsers").once("value", function(aUS) {
            var aU = aUS.val();
            var _u, uD;
            for(var u in aU) {
                if(aU[u].em == em) {
                    _u = true;
                }
            }
            if(!_u) {
                tD.fb.child("data/em/" + em.split(".").join(",")).once("value", function(uDS) {
                    var uD = uDS.val();
                    if(!uD) {
                        $.snackbar({
                            content: "Oh no! That user doesn't exist!"
                        });
                        return false;
                    }
                    var uid = uD.uid;
                    tD.fb.child("data/usr/" + uid + "/meta/inf").once("value", function(mS) {
                        var m = mS.val();
                        sitePath.child("approvedUsers/" + uid).set(m, function() {
                            $.snackbar({content:"User added"});
                        });
                    });
                });
            } else {
                $.snackbar({
                    content: "That user is already approved!"
                });
            }
        });
    };
    newApprovedUser.showPopup = function() {
        bootbox.prompt({
            title: "What is the user's e-mail?",
            callback: function(result) {
                if(result) {
                    if(!tD.isEmail(result)) {
                        $.snackbar({
                            content: "Your e-mail has to be valid."
                        });
                    } else {
                        newApprovedUser.register(result);
                    }
                }
            }
        });
    };
    newApprovedUser.start = function() {
        newApprovedUser.showPopup();
    };
    newApprovedUser.start();
})();