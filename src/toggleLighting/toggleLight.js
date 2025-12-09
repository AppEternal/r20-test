import modalHTML from "./modal.html";
if (!window._TOGGLELIGHT) {
	window._TOGGLELIGHT = {
		isEnabled: false,
		lightSaved: false,
		lightLegacy: null,
		lightEnabled: null,
		lightOnDrop: null,
	};
}

window._TOGGLELIGHT.enable = () => {
	console.log("window._TOGGLELIGHT", window._TOGGLELIGHT);
	if (!window._TOGGLELIGHT.lightSaved) return;
	try {
		Campaign.pages.models[Campaign.activePageIndex].d20.dyn_fog.enabled = window._TOGGLELIGHT.lightLegacy;
	} catch (error) {}
	try {
		window.Campaign.engine.engineStore._p.state._value.vttTools_pageSettings.dynamicLightingEnabled =
			window._TOGGLELIGHT.lightEnabled;
	} catch (error) {}
};
window._TOGGLELIGHT.disable = () => {
	console.log("window._TOGGLELIGHT", window._TOGGLELIGHT);
	if (!window._TOGGLELIGHT.lightSaved) {
		window._TOGGLELIGHT.lightSaved = true;
		try {
			window._TOGGLELIGHT.lightEnabled =
				window.Campaign.engine.engineStore._p.state._value.vttTools_pageSettings.dynamicLightingEnabled;
		} catch (error) {}
		try {
			window._TOGGLELIGHT.lightLegacy = Campaign.pages.models[Campaign.activePageIndex].d20.dyn_fog.enabled;
		} catch (error) {}
	}
	try {
		window.Campaign.engine.engineStore._p.state._rawValue.vttTools_pageSettings.dynamicLightingEnabled = false;
	} catch (error) {}
	try {
		Campaign.pages.models[Campaign.activePageIndex].d20.dyn_fog.enabled = false;
	} catch (error) {}
};

window._TOGGLELIGHT.initialize = () => {
	$(".r20-draggable-element").remove();

	let appended = $("body").append(modalHTML);
	let newElement = $(appended);
	newElement.find("#toggle-light").text(window._TOGGLELIGHT.isEnabled ? "Enabled" : "Disabled");
	// Bind toggle button event
	newElement
		.find("#toggle-light")
		.off("click")
		.on("click", function () {
			window._TOGGLELIGHT.isEnabled = !window._TOGGLELIGHT.isEnabled;
			if (!window._TOGGLELIGHT.isEnabled) {
				window._TOGGLELIGHT.enable();
			} else {
				window._TOGGLELIGHT.disable();
			}
			$(this).text(window._TOGGLELIGHT.isEnabled ? "Enabled" : "Disabled");
		});

	newElement.find(".r20-draggable-element").draggable({
		containment: "window",
		handle: false,
		scroll: false,
	});
	newElement.find(".r20-deleteSelf").on("click", function () {
		window._TOGGLELIGHT.enable();
		$(this).closest(".r20-draggable-element").remove();
	});
};
window._TOGGLELIGHT.initialize();
