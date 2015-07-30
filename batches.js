var batchCounter = -1;

function saveTabs(lastId) {
	getCurrentURLs(function(urls) {
		var name = document.getElementById("name").value;
		name = name.substring(0, 20);
		var batch = {
			"Name":name,
			"URLs":urls
		};
		insertBatch(batch, lastId);
	});
}

function getCurrentURLs(callback) {
	chrome.windows.getCurrent(function(result) {
		var windowId = result["id"];
		chrome.tabs.query({"windowId":windowId}, function(result) {
			var urls = [];
			var index = 0;
			var editURL = "chrome-extension://" + chrome.runtime.id + "/edit.html";
			for(var tab in result) {
				var url = result[tab]["url"];
				if(url != editURL) {
					urls[index] = result[tab]["url"];
					index++;
				}
			}
			callback(urls);
		});
	});
}

function getBatches(callback) {
	chrome.storage.sync.get("Batches", function(result) {
		if(!result["Batches"] || result["Batches"] == null) {
			var batches = JSON.parse('[{"Name": "Shopping","URLs": ["https://www.google.com/express/","http://www.amazon.com/","http://www.zappos.com/"]},{"Name": "Social","URLs": ["https://www.tumblr.com/","https://twitter.com/","https://www.facebook.com/"]},{"Name": "News","URLs": ["http://www.usatoday.com/","http://bleacherreport.com/","http://www.nytimes.com/"]}]');
		}
		else {
			var batches = result["Batches"];
		}
		callback(batches);
	});
}

function saveBatches(batches) {
	chrome.storage.sync.set({"Batches": batches});
	loadBatches();
}

function insertBatch(batch, lastId) {
	getBatches(function(batches) {
		var added = false;
		for(var i in batches) {
			if(!added && batch["Name"] == batches[i]["Name"]) {
				batches[i] = batch;
				added = true;
			}
		}
		if(!added) {
			if(lastId) {
				batches.splice(lastId, 0, batch);
			}
			else {
				batches[batches.length] = batch;
			}
		}
		saveBatches(batches);
	});
}

function loadBatches() {
	getBatches(function(batches) {
		document.getElementById("batches").innerHTML = "";
		for(var i in batches) {
			loadBatch(batches[i]);
		}
	});
}

function loadBatch(batch) {
	var start = "batch_";
	var end = batch["Name"].replace(/ /g, "_");
	
	var openID = start + "open_" + end;
	var editID = start + "edit_" + end;
	var removeID = start + "remove_" + end;
	
	var result = "<div id=\"batch_container_" + end + "\" class=\"batch\">";
	result += "<a href=\"#\" class=\"batchText\" id=\"batch_text_" + end + "\">" + batch["Name"] + "</a>";
	
	result += "<div class=\"batchActions\">";
	result += "<a href=\"#\" class=\"batchAction\" id=\"" + openID + "\">New Window</a>";
	result += "<a href=\"#\" class=\"batchAction\" id=\"" + editID + "\">Edit</a>";
	result += "<a href=\"#\" class=\"batchAction\" id=\"" + removeID + "\">Remove</a>";
	result += "</div>";
	
	result += "</div>";
	document.getElementById("batches").innerHTML += result;
}

function getBatchIndex(name, batches) {
	for(var i in batches) {
		if(name == batches[i]["Name"]) {
			return i;
		}
	}
	return -1;
}

function openBatch(name, newWindow) {
	getBatches(function(batches) {
		var i = getBatchIndex(name, batches);
		if(i != -1) {
			var batch = batches[i];
			var urls = batch["URLs"];
			affiliate(urls);
			
			if(newWindow == true) {
				openURLsInNewWindow(urls);
			}
			else {
				openURLsInSameWindow(urls);
			}
		}
	});
}

function openURLsInNewWindow(urls) {
	var createData = {"url":urls};
	chrome.windows.create(createData);
}

function openURLsInSameWindow(urls) {
	var queryInfo = {"currentWindow":true};
	chrome.tabs.query(queryInfo, function(tabs) {
		for(var i in urls) {
			var createProperties = {"url":urls[i]};
			chrome.tabs.create(createProperties);
		}
		for(var i in tabs) {
			var tab = tabs[i];
			if(tab["url"] == "chrome://newtab/") {
				chrome.tabs.remove(tab["id"]);
			}
		}
	});
}

function affiliate(urls) {
	if(!localStorage["OptOut"] || localStorage["OptOut"] == "false") {
		for(var i in urls) {
			var url = new URL(urls[i]);
			if(url.hostname == "www.amazon.com") {
				var urlString = url.toString().replace(url.search, "");
				urlString += "?tag=batc03-20";
				urls[i] = urlString;
			}
		}
	}
}

function editBatch(name) {
	localStorage["nextName"] = name;
	getBatches(function(batches) {
		var id = getBatchIndex(name, batches);
		if(id != -1) {
			localStorage["lastID"] = id;
			var urls = batches[id]["URLs"];
			var editURL = "chrome-extension://" + chrome.runtime.id + "/edit.html";
			urls.splice(0, 0, editURL);
			
			openURLsInNewWindow(urls);
		}
	});
}

function removeBatch(name) {
	getBatches(function(batches) {
		var i = getBatchIndex(name, batches);
		if(i != -1) {
			batches.splice(i, 1);
			saveBatches(batches);
		}
	});
}

function message(text) {
	document.getElementById("message").innerHTML = text;
}

function keyPressed(keyID) {
	var batches = document.getElementById("batches").childNodes;
	console.log(keyID);
	if(batches.length > 0) {
		if(keyID == "Up" && batchCounter >= 0) {
			batchCounter--;
		}
		else if(keyID == "Down" && batchCounter < batches.length - 1) {
			batchCounter++;
		}
		else if(keyID == "Enter" && batchCounter != -1) {
			fireEvent(batches[batchCounter], "click");
		}
		
		if(batchCounter != -1) {
			batches[batchCounter].className = "batch batch-hover";
			if(batchCounter > 0) {
				batches[batchCounter - 1].className = "batch";
			}
			if(batchCounter < batches.length - 1) {
				batches[batchCounter + 1].className = "batch";
			}
		}
	}
}

function fireEvent(element,event) {
   if (document.createEvent) {
       // dispatch for firefox + others
       var evt = document.createEvent("HTMLEvents");
       evt.initEvent(event, true, true ); // event type,bubbling,cancelable
       return !element.dispatchEvent(evt);
   } else {
       // dispatch for IE
       var evt = document.createEventObject();
       return element.fireEvent('on'+event,evt);
   }
}