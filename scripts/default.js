/**
 * [myApp is basic object which manage variable & functions]
 * @type {Object}
 */
var myApp = {
    id: 0,
    idxOfEtc: "4",
    defaultIdx: 1,
    defaultUrl: "https://endic.naver.com/main.nhn?sLn=kr",
    defaultAlwaysOnTop: false,
    defaultUserAgent: true,
    defaultUserAgentString: "",
    defaultAlwaysNavigation: true,
    mobileUserAgentString: "Mozilla/5.0 (Linux; Android 8.0; Pixel 2 \
        Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) \
        Chrome/71.0.3578.98 Mobile Safari/537.36",
    currentUrl: "",
    OS: "",
    webview: null,

    init: function() {
        var self = this;

        this.doLayout();

        window.onresize = this.doLayout;
        document.addEventListener('keydown', this.getKeyEvent, false);

        var save = document.querySelector("#save");
        var cancel = document.querySelector("#cancel");
        var reset = document.querySelector("#reset");
        var radioList = document.querySelectorAll("input[name='select_dic']");
        var alwaysOnOptions = document.querySelectorAll("input[name='always-on-options']");
        var alwaysMobileUAOptions = document.querySelectorAll("input[name='always-mb-ua']");
        var alwaysNavigationButtons = document.querySelectorAll("input[name='always-navigation']");

        var url = document.querySelector("#url");
        var webview = document.querySelector("#myWebview");
        var setBtn = document.querySelector("#setting-btn");
        var backBtn = document.querySelector("#back-btn");
        var homeBtn = document.querySelector("#home-btn");
        var blockWindow = document.querySelector("#block-window");

        // set default user agent
        this.defaultUserAgentString = webview.getUserAgent();

        //set default dicionary site
        this.getData(function(result) {
            webview.setAttribute("src", result.url);
            myApp.currentUrl = result.url;

            if (typeof result.alwaysOnTop !== "undefined") {
                myApp.setAlwaysOnTop(result.alwaysOnTop);
            }

            if (typeof result.alwaysMobileUA !== "undefined") {
                // Mobile UserAgent 적용해야 할 경우
                if (result.alwaysMobileUA) {
                    webview.setUserAgentOverride(self.mobileUserAgentString);
                }
            }

            if (typeof result.alwaysNavigationButtons !== "undefined") {
                myApp.setAlwaysNavigation(result.alwaysNavigationButtons);
            }
        });

        this.webview = webview;

        save.onclick = this.doSave;
        cancel.onclick = this.doCancel;
        reset.onclick = this.doReset;

        // when user click, set setting items
        setBtn.onclick = function() {
            var storage = chrome.storage.local;

            // Successfully get user data
            storage.get(function(result) {
                if (typeof result.idx === "undefined") {
                    return;
                }

                // if idx is Etc, chage state (input box)
                if (result.idx !== myApp.idxOfEtc) {
                    myApp.setReadOnly(true);
                } else {
                    url.value = result.url;
                    myApp.setReadOnly(false);
                }

                // Set Current radio status
                radioList[result.idx].checked = true;

                if (typeof result.alwaysOnTop === "undefined") {
                    result.alwaysOnTop = myApp.defaultAlwaysOnTop;
                }

                if (typeof result.alwaysMobileUA === "undefined") {
                    result.alwaysMobileUA = myApp.defaultUserAgent;
                }

                if (result.alwaysOnTop) {
                    alwaysOnOptions[0].checked = true;
                } else {
                    alwaysOnOptions[1].checked = true;
                }

                if (result.alwaysMobileUA) {
                    alwaysMobileUAOptions[0].checked = true;
                } else {
                    alwaysMobileUAOptions[1].checked = true;
                }

                if (result.alwaysNavigationButtons) {
                    alwaysNavigationButtons[0].checked = true;
                } else {
                    alwaysNavigationButtons[1].checked = true;
                }
            });

            myApp.showSettingPage();
        }

        backBtn.onclick = function() {
            webview.back();
        }

        homeBtn.onclick = function() {
            webview.src = myApp.currentUrl;
        }

        blockWindow.onclick = function() {
            myApp.hideSettingPage();
        }

        //set Event for input box by radio button
        for (var i = 0; i < radioList.length; i++) {
            var idx = i;
            (function(i) {
                var radio = radioList[i];
                radio.onclick = function() {
                    var idx = this.getAttribute("idx");

                    //if Naver or Daum
                    if (idx !== myApp.idxOfEtc) {
                        myApp.setReadOnly(true);
                    } else {
                        myApp.setReadOnly(false);
                    }
                }
            })(idx);
        }


        // set up the event listeners
        chrome.notifications.onClosed.addListener(function() {});
        chrome.notifications.onClicked.addListener(function() {});
        chrome.notifications.onButtonClicked.addListener(function() {});
    },

    getData: function(callback) {
        var storage = chrome.storage.local;
        var url = "";

        storage.get(function(result) {

            if (typeof result.url === "undefined") {
                result.url = myApp.defaultUrl;
            }

            if (typeof result.idx === "undefined") {
                result.idx = myApp.defaultIdx;;
            }

            if (typeof result.alwaysOnTop === "undefined") {
                result.alwaysOnTop = myApp.defaultAlwaysOnTop;
            }

            callback(result);
        });

    },


    doLayout: function() {
        var webview = document.querySelector('webview');
        var controls = document.querySelector('#controls');
        var windowWidth = document.documentElement.clientWidth;
        var windowHeight = document.documentElement.clientHeight;
        var webviewWidth = windowWidth;
        var webviewHeight = windowHeight - 8;
        var extraWidth = 0;

        if (myApp.OS === "mac") {
            extraWidth = 16;
        }

        console.log(myApp.OS);

        webview.style.width = webviewWidth - extraWidth + 'px';
        webview.style.height = webviewHeight + 'px';
    },

    doSave: function() {
        var storage = chrome.storage.local;

        // Selected mobile links
        var checkedRadio = document.querySelector('input[name="select_dic"]:checked');
        var idx = checkedRadio.getAttribute("idx");

        // Selected options
        var alwaysOnTop =
            document.querySelector('input[name="always-on-options"]:checked')
            .getAttribute("value");
        var alwaysMobileUA =
            document.querySelector('input[name="always-mb-ua"]:checked')
            .getAttribute("value");
        var alwaysNavigationButtons =
            document.querySelector('input[name="always-navigation"]:checked')
            .getAttribute('value');

        var url = "";
        var webview = document.querySelector("#myWebview");
        var notiMsg = "Success :)";

        if (idx === myApp.idxOfEtc) {
            url = document.querySelector("#url").value;
        } else {
            url = checkedRadio.value;
        }

        if (url == "") {
            notiMsg = "Set default dicionary:" + myApp.defaultUrl;
            url = myApp.defaultUrl;
            idx = myApp.defaultIdx;
        }

        alwaysOnTop = alwaysOnTop === "ON" ? true : false;
        alwaysMobileUA = alwaysMobileUA === "ON" ? true : false;
        alwaysNavigationButtons = alwaysNavigationButtons === "ON" ? true : false;

        var obj = {
            "url": url,
            "idx": idx,
            "alwaysOnTop": alwaysOnTop,
            "alwaysMobileUA": alwaysMobileUA,
            "alwaysNavigationButtons": alwaysNavigationButtons
        };

        // save user data
        storage.set(obj);

        // change settings
        myApp.showNotification(notiMsg);
        myApp.hideSettingPage();
        myApp.setAlwaysOnTop(alwaysOnTop);
        myApp.setAlwaysNavigation(alwaysNavigationButtons);
        webview.setUserAgentOverride(
            alwaysMobileUA ? myApp.mobileUserAgentString : myApp.defaultUserAgentString
        );

        if (myApp.currentUrl !== url) {
            myApp.currentUrl = url;

            // change URL
            webview.setAttribute("src", url);
        }

    },

    doCancel: function() {
        myApp.hideSettingPage();
    },

    doReset: function() {
        var webview = document.querySelector('webview');
        var storage = chrome.storage.local;
        var obj = {
            "url": myApp.defaultUrl,
            "idx": myApp.defaultIdx,
            "alwaysOnTop": myApp.defaultAlwaysOnTop,
            "alwaysMobileUA": myApp.defaultUserAgent,
            "alwaysNavigationButtons": myApp.defaultAlwaysNavigation
        };

        storage.set(obj);
        myApp.showNotification("Reset :)");

        var radioList = document.querySelectorAll("input[name='select_dic']");
        radioList[myApp.defaultIdx].checked = true;

        var alwaysOnOptions = document.querySelectorAll(
            "input[name='always-on-options']");

        if (myApp.defaultAlwaysOnTop) {
            alwaysOnOptions[0].checked = true;
        } else {
            alwaysOnOptions[1].checked = true;
        }

        var alwaysMobileUA = document.querySelectorAll("input[name='always-mb-ua']");
        if (myApp.defaultUserAgent) {
            alwaysMobileUA[0].checked = true;
        } else {
            alwaysMobileUA[1].checked = true;
        }

        myApp.webview.setUserAgentOverride(myApp.mobileUserAgentString);

        var alwaysNavigations = document.querySelectorAll(
            "input[name='always-navigation']");

        if (myApp.defaultAlwaysNavigation) {
            alwaysNavigations[0].checked = true;
        } else {
            alwaysNavigations[1].checked = true;
        }

        myApp.setAlwaysNavigation(myApp.defaultAlwaysNavigation);



        webview.setAttribute("src", myApp.defaultUrl);
    },

    showSettingPage: function() {
        var setPage = document.querySelector("#setting-page");
        setPage.style.setProperty("display", "block");
        this.showBlockWindow();
    },

    hideSettingPage: function() {
        var setPage = document.querySelector("#setting-page");
        setPage.style.setProperty("display", "none");
        this.hideBlockWindow();
    },

    showNotification: function(msg) {
        var notOptions = {
            iconUrl: chrome.runtime.getURL("/images/setting_64x64.png"),
            priority: 0,
            buttons: [],
            type: "basic",
            title: "Notification",
            message: msg,
            expandedMessage: ""
        };

        chrome.notifications.create(
            "id" + myApp.id,
            notOptions,
            myApp.creationCallback
        );
    },

    creationCallback: function(notID) {
        setTimeout(function() {
            chrome.notifications.clear(notID, function(wasCleared) {
                //console.log("Notification " + notID + " cleared: " + wasCleared);
            });
        }, 3000);
    },

    setReadOnly: function(result) {
        if (result) {
            url.readOnly = true;
            url.style.setProperty("background-color", "#E8E8E8");
        } else {
            url.readOnly = false;
            url.style.setProperty("background-color", "#fff");
        }
    },

    getKeyEvent: function(e) {
        var webview = document.querySelector('webview');
        var code = e.keyCode;
        var __BKSP = 8;
        var __BACKWARD = 113;
        var __FORWARD = 114;
        var __HOME = 115;
        var __REFRESH = 116;

        switch (code) {
            case __BKSP:
                break;
            case __BACKWARD:
                webview.back();
                break;
            case __FORWARD:
                webview.forward();
                break;
            case __HOME:
                webview.src = myApp.currentUrl;
                break;
            case __REFRESH:
                webview.reload();
                break;
            default:
                break;;
        }
    },

    showBlockWindow: function() {
        var blockWindow = document.querySelector("#block-window");
        blockWindow.style.setProperty('display', 'block');
    },

    hideBlockWindow: function() {
        var blockWindow = document.querySelector("#block-window");
        blockWindow.style.setProperty('display', 'none');
    },

    setAlwaysOnTop: function(bool) {
        chrome.app.window.current().setAlwaysOnTop(bool);
    },

    setAlwaysNavigation: function(bool) {
        var backBtn = document.querySelector('#back-btn');
        var homeBtn = document.querySelector('#home-btn');

        if (bool) {
            backBtn.style.display = 'block';
            homeBtn.style.display = 'block';
        } else {
            backBtn.style.display = 'none';
            homeBtn.style.display = 'none';
        }
    }
};

window.onload = function() {
    chrome.runtime.getPlatformInfo(function(info) {
        myApp.OS = info.os;
        myApp.init();
    });
};
