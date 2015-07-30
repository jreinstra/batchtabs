loadSetting();

function loadSetting() {
	var optOut = localStorage["OptOut"];
	if(optOut && optOut == "true") {
		document.getElementById("optOut").checked = true;
	}
}

function updateSetting() {
	console.log(document.getElementById("optOut").checked);
	if(document.getElementById("optOut").checked) {
		localStorage["OptOut"] = true;
	}
	else {
		localStorage["OptOut"] = false;
	}
}

document.querySelector("#optOut").addEventListener('change', function() {
	updateSetting();
});
