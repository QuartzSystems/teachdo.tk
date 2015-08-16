(function() {
    //NAMESPACE SIGNUP
    var signup = {};
    signup.fixData = function() {
        tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/meta/inf").once("value", function(infS) {
            var inf = infS.val();
            var name, em, emE, pic;
            if(inf) {
                name = inf.name;
                em = inf.em;
                emE = inf.emE;
                pic = inf.img;
            } else {
                inf = {};
            }
            if(!name) {
                inf.name = tD.fb.getAuth().google.displayName;
            }
            if(!em) {
                inf.em = tD.fb.getAuth().google.email;
            }
            if(!emE) {
                inf.emE = inf.em.split(".").join(",");
            }
            if(!pic || (pic != "https://lh3.googleusercontent.com/-CzWv1rLfZy8/AAAAAAAAAAI/AAAAAAAAAAA/qt2U_sJAC3w/photo.jpg" && pic != tD.fb.getAuth().google.cachedUserProfile.picture)) {
                inf.img = (tD.fb.getAuth().google.cachedUserProfile.picture ? tD.fb.getAuth().google.cachedUserProfile.picture : "https://lh3.googleusercontent.com/-CzWv1rLfZy8/AAAAAAAAAAI/AAAAAAAAAAA/qt2U_sJAC3w/photo.jpg");
            }
            tD.fb.child("data/usr/" + tD.fb.getAuth().uid + "/meta/inf").set(inf, function() {
                inf.uid = tD.fb.getAuth().uid;
                tD.fb.child("data/em/" + inf.emE).set(inf, function() {
                    location.hash = "#/dash";
                });
            });
        });
    };
    signup.makeLogin = function() {
        if(!tD.fb.getAuth()) {
            tD.fb.authWithOAuthPopup("google", function(error, authData) {
                if(error) {
                    console.log("Login Failed!", error);
                    tD.fb.authWithOAuthRedirect("google", function(error, authData) {
                        if(!error) {
                            console.log("Authenticated successfully with payload:", authData);
                            $('#signup-loginButton').off("click");
                            signup.fixData();
                        }
                    });
                } else {
                    console.log("Authenticated successfully with payload:", authData);
                    $('#signup-loginButton').off("click");
                    signup.fixData();
                }
            }, {
                scope: ["email"]
            });
        } else {
            signup.fixData();
        }
    };
    $('#signup-loginButton').click(signup.makeLogin);
    if(tD.fb.getAuth()) {
        signup.fixData();
    }
})();