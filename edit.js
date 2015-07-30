checkForNextName();

function checkForNextName() {
	if(localStorage["nextName"]) {
		document.getElementById("name").value = localStorage["nextName"];
	}
}

document.querySelector("#save").addEventListener('click', function() {
	removeBatch(localStorage["nextName"]);
	saveTabs(localStorage["lastID"]);
	localStorage.removeItem("nextName");
	localStorage.removeItem("lastID");
	
	document.getElementById("name").style.display = "none";
	document.getElementById("save").style.display = "none";
	document.getElementById("editInfo").innerHTML = "Saved!  This window will close shortly.";
	
	setTimeout(function() {
		chrome.windows.getCurrent(function(result) {
			chrome.windows.remove(result.id);
		});
	}, 1000);
});
