loadBatches();

document.querySelector("#saveTabs").addEventListener('click', function() {
	saveTabs();
	document.getElementById("addBatchPrompt").style.display = "";
	document.getElementById("saveDialog").style.display = "none";
});

document.querySelector("#addBatch").addEventListener('click', function() {
	document.getElementById("addBatchPrompt").style.display = "none";
	document.getElementById("saveDialog").style.display = "";
});

document.addEventListener('click', function(e) {
	var id = e.target.id;
	if(id && id.substring(0, 6) == "batch_") {
		id = id.substring(6);
		if(id.substring(0, 10) == "container_") {
			openBatch(id.substring(10).replace(/_/g, " "), false);
		}
		else if(id.substring(0, 5) == "text_") {
			openBatch(id.substring(5).replace(/_/g, " "), false);
		}
		else if(id.substring(0, 5) == "open_") {
			openBatch(id.substring(5).replace(/_/g, " "), true);
		}
		else if(id.substring(0, 5) == "edit_") {
			editBatch(id.substring(5).replace(/_/g, " "));
		}
		else if(id.substring(0, 7) == "remove_") {
			removeBatch(id.substring(7).replace(/_/g, " "));
		}
	}
});

document.addEventListener("keydown", function(data) {
	keyPressed(data.keyIdentifier);
});
