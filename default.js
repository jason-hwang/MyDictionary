

var myApp = {
	id:0,
	idxOfEtc:"9",
	defaultIdx:0,
	defaultUrl:"http://m.endic.naver.com/",
	currentUrl:"",

	init:function(){

		this.doLayout();
		window.onresize = this.doLayout;

		var save = document.querySelector("#save");
		var cancel = document.querySelector("#cancel");
		var reset = document.querySelector("#reset");
		var radioList = document.querySelectorAll("input[name='select_dic']");
		var url = document.querySelector("#url");
		var webview = document.querySelector("#myWebview");
		var setBtn = document.querySelector("#setting-btn");
		var backBtn = document.querySelector("#back-btn");
		var homeBtn = document.querySelector("#home-btn");

		//set default dicionary site
		this.getData(function(result){
			webview.setAttribute("src", result.url);
			myApp.currentUrl = result.url;
		});

		save.onclick = this.doSave;
		cancel.onclick = this.doCancel;
		reset.onclick = this.doReset;
		setBtn.onclick = function(){
			var storage = chrome.storage.local;
			storage.get(function(result){
				if(typeof result.idx==="undefined"){
					return;
				}

				// if idx is Etc, chage state (input box)
				if(result.idx!==myApp.idxOfEtc){
					myApp.setReadOnly(true);
				}else{
					url.value = result.url;
		        	myApp.setReadOnly(false);
				}

				radioList[result.idx].checked = true;

			});

			myApp.showSettingPage();
		}

		backBtn.onclick = function(){
			webview.back();
		}

		homeBtn.onclick = function(){
			webview.src = myApp.currentUrl;
		}

		//set Event for input box by radio button
		for(var i=0; i<radioList.length; i++){
		   var idx = i;
		   (function(i){
				var radio = radioList[i];
		    	radio.onclick = function(){
		    		var idx = this.getAttribute("idx");

		    		//if Naver or Daum
		        	if(idx!==myApp.idxOfEtc){
		        		myApp.setReadOnly(true);
		        	}else{
		        		myApp.setReadOnly(false);
		        	}
		        }
		    })(idx);
		}


		// set up the event listeners
		chrome.notifications.onClosed.addListener(function(){});
		chrome.notifications.onClicked.addListener(function(){});
		chrome.notifications.onButtonClicked.addListener(function(){});
	},

	getData: function(callback){
		var storage = chrome.storage.local;
		var url = "";

		storage.get(function(result){

			if(typeof result.url==="undefined"){
				result.url = myApp.defaultUrl;
				result.idx = myApp.defaultIdx;
			}

			callback(result);
		});

	},


	doLayout: function() {
	  var webview = document.querySelector('webview');
	  var controls = document.querySelector('#controls');
	  var windowWidth = document.documentElement.clientWidth;
	  var windowHeight = document.documentElement.clientHeight;
	  var webviewWidth = windowWidth - 14;
	  var webviewHeight = windowHeight - 8;

	  webview.style.width = webviewWidth + 'px';
	  webview.style.height = webviewHeight + 'px';

	},

	doSave: function(){
		var storage = chrome.storage.local;
		var checkedRadio = document.querySelector('input[name="select_dic"]:checked');
		var idx = checkedRadio.getAttribute("idx");
		var url = "";
		var webview = document.querySelector("#myWebview");
		var notiMsg = "Success :)";

		if(idx===myApp.idxOfEtc){
			url = document.querySelector("#url").value;
		}else{
			url = checkedRadio.value;
		}
		
		if(url==""){
			notiMsg = "Set default dicionary:"+myApp.defaultUrl;
			url = myApp.defaultUrl;
			idx = myApp.defaultIdx;
		}

		var obj = {"url":url, "idx":idx};
		storage.set(obj);
		myApp.showNotification(notiMsg);
		myApp.hideSettingPage();
		webview.setAttribute("src", url);
		myApp.currentUrl = url;
	},

	doCancel: function(){
		myApp.hideSettingPage();
	},

	doReset: function(){
		var webview = document.querySelector('webview');
		var storage = chrome.storage.local;
		var obj = {
			"url":myApp.defaultUrl, 
			"idx":myApp.defaultIdx
		};

		storage.set(obj);
		myApp.showNotification("Reset :)");
		webview.setAttribute("src", myApp.defaultUrl);

		var radioList = document.querySelectorAll("input[name='select_dic']");
		radioList[myApp.defaultIdx].checked = true;		
	},

	showSettingPage: function(){
		var setPage = document.querySelector("#setting-page");
		setPage.style.setProperty("display", "block");
	},

	hideSettingPage: function(){
		var setPage = document.querySelector("#setting-page");
		setPage.style.setProperty("display", "none");
	},

	showNotification: function(msg){
		var notOptions = {
			iconUrl: chrome.runtime.getURL("/setting_64x64.png"),
			priority: 0,
			buttons: [],
			type : "basic",
			title: "Notification",
			message: msg,
			expandedMessage:""
		};

		chrome.notifications.create(
			"id"+myApp.id, 
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

	setReadOnly: function(result){
		if(result){
			url.readOnly = true;
    		url.style.setProperty("background-color", "#E8E8E8");
    	}else{
    		url.readOnly = false;
    		url.style.setProperty("background-color", "#fff");
    	}
	}
};

window.onload = function(){
	myApp.init();
};
