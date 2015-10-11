

var myApp = {
	id:0,
	defaultUrl:"http://m.endic.naver.com/",
	defaultIdx:0,

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

		//set default dicionary site
		this.getData(function(result){
			webview.setAttribute("src", result.url);
		});

		save.onclick = this.doSave;
		cancel.onclick = this.doCancel;
		reset.onclick = this.doReset;
		setBtn.onclick = function(){
			var storage = chrome.storage.local;
			storage.get(function(result){
				if(result.url){
					url.value = result.url;
					radioList[result.idx].checked = true;
				}else{
					url.value = myApp.defaultUrl;
					radioList[myApp.defaultIdx].checked = true;
				}
			});

			myApp.showSettingPage();
		}

		//set Event for input box by radio button
		for(var i=0; i<radioList.length; i++){
		   var idx = i;
		   (function(i){
				var radio = radioList[i];
		    	radio.onclick = function(){
		        	url.value = this.value;
		        	url.setAttribute("idx", this.getAttribute("idx"));
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

			console.log(result);

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
	  var webviewWidth = windowWidth;
	  var webviewHeight = windowHeight;

	  webview.style.width = webviewWidth + 'px';
	  webview.style.height = webviewHeight + 'px';

	},

	doSave: function(){
		var storage = chrome.storage.local;
		var url = document.querySelector("#url").value;
		var idx = document.querySelector("#url").getAttribute("idx");
		var webview = document.querySelector("#myWebview");
		
		if(url==""){
			myApp.showNotification("Set default dicionary:"+myApp.defaultUrl);
			url = myApp.defaultUrl;
			idx = myApp.defaultIdx;
		}

		var obj = {"url":url, "idx":idx};
		storage.set(obj);
		myApp.showNotification("Successfully:)");
		myApp.hideSettingPage();
		webview.setAttribute("src", url);
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
		myApp.showNotification("Reset Options...");
		webview.setAttribute("src", myApp.defaultUrl);

		var radioList = document.querySelectorAll("input[name='select_dic']");
		radioList[myApp.defaultIdx].checked = true;

		var url = document.querySelector("#url");
		url.value = myApp.defaultUrl;
		url.setAttribute("idx", myApp.defaultIdx);
		
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
				console.log("Notification " + notID + " cleared: " + wasCleared);
			});
		}, 2000);
	}
};

window.onload = function(){
	myApp.init();
};
