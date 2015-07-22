(function() {
    var lib = {};
    lib.oL = function(o) {
        return Object.keys(o).length;
    };
    lib.smoothHide = function($el, cb) {
        $($el).slideUp(500, function() {
            if(cb) {
                cb(function() {
                    $($el).slideDown(500);
                });
            } else {
                $($el).slideDown(500);
            }
        });
    };
    lib.isEmail = function(email) {
        return /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x22([^\x0d\x22\x5c\x80-\xff]|\x5c[\x00-\x7f])*\x22))*\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff]+|\x5b([^\x0d\x5b-\x5d\x80-\xff]|\x5c[\x00-\x7f])*\x5d))*$/.test(email);
    };
    lib.hE = function(s) {
        //HTML escape
        var el = document.createElement("div");
        el.innerText = el.textContent = s;
        s = el.innerHTML;
        return s;
    };
    lib.lOD = function(colour) {
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
            console.log("l");
        } else {
            console.log("d")
        }
    };
    lib.npS = NProgress.start;
    lib.npF = function() {
        NProgress.inc();
        setTimeout(function() {
            NProgress.done();
        }, 200);
    };
    lib.pL = {
        SHORT: 10,
        MED: 15,
        LONG: 20
    };
    lib.generateTextPreview = function(text, pL) {
        if(!pL) pL = pL.short;
        var letters = pL * 5;
        var pr;
        if(text.split(" ").slice(0, pL).join(" ").split("").length > letters) {
            pr = text.split("").slice(0, letters).join("");
        } else {
            pr = text.split(" ").slice(0, pL).join(" ");
        }
        if(pr == text) {
            return text;
        } else {
            return pr + "...";
        }
    };
    lib.setTitle = function(title) {
        $('title').html(title + " | teachDo | QZ");
    };
    lib.fb = new Firebase("https://teachdo.firebaseio.com/");
    lib.loadPage = function(name, cb) {
        $('body').animate({
            scrollTop: 0
        });
        lib.npS();
        $.get("/ajax/page/" + name + ".html", function(d) {
            $('#main').html(d);
            lib.setTitle($('#title').val());
            lib.npF();
            if(window.regFbE && window.regFbE.length > 0) {
                for(var e in window.regFbE) {
                    window.regFbE[e].off("value");
                }
            }
            window.regFbE = [];
            if(window.pDBI) clearInterval(window.pDBI)
            if($('#meta-loginRequired').get().length > 0 && !lib.fb.getAuth()) {
                location.hash = "#/signup";
            }
            if(location.hash == "#/" || name == "home") {
                $('#backLink').fadeOut();
            } else {
                $('#backLink').fadeIn();
            }
            if(cb) cb();
        });
    };
    lib.getView = function(view, cb) {
        if(!lib._c) {
            lib._c = {};
        }
        if(lib._c[view]) {
            if(cb) cb(lib._c[view]);
        } else {
            $.get("/ajax/inc/" + view + ".html", function(d) {
                lib._c[view] = d;
                if(cb) cb(d);
            });
        }
    };
    lib.regIT = function($btn) {
        $($btn).mouseenter(function() {
            $(this).children("span").css({
                display: "inline",
                scale:0,
                fontSize:0
            }).transition({
                scale: 1,
                fontSize:"1em"
            });
        }).mouseleave(function() {
            $(this).children("span").transition({
                scale:0,
                fontSize:0
            }, function() {
                $(this).hide();
            });
        });
    };
    window.tD = lib;
})();