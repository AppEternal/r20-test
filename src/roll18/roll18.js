import modalHTML from "./modal.html";
if (!window._INTERCEPT) {
	window._INTERCEPT = {
		INTERCEPTED: false,
		USE_INTERCEPT: false,
		intercepted: [],
		timeout: 30_000,
		loopTimeout: 0,
		timeoutReject: true,
		countdownInterval: undefined,
	};
}

window._INTERCEPT.handleIntercept = async (data) => {
	try {
		const json = JSON.parse(data);
		if (json.d?.b?.d?.content && json.d?.b?.d?.content.includes("Roll for Stats")) {
			
			let parsed = json.d?.b?.d?.inlinerolls			
			if (parsed && typeof parsed === 'object') {
				// Extract the total from each roll and sum them
				const totalSum = Object.values(parsed).reduce((sum, roll) => {
					return sum + (roll.results?.total || 0);
				}, 0);
				
				window._INTERCEPT.loopTimeout++;
			
				$("#displayRolls").text(`Total Sum: ${totalSum} < 90 - Timeout: ${window._INTERCEPT.loopTimeout}/100`);
			
				if(totalSum > 90){
					window._INTERCEPT.loopTimeout = 0;
					return true;
				}else{
					if(window._INTERCEPT.loopTimeout < 100){
						const charSheetFrame = $('iframe[title*="Character sheet"]')[0];
						if (charSheetFrame && charSheetFrame.contentWindow) {
							$(charSheetFrame.contentWindow.document).find('[name="roll_rollstats"]').trigger("click");
						}
						
					}
					return false;
				}
			}
		}

		
	} catch (error) {
		console.log("handleIntercept", error);
		return true;
	}

	return true;
};

window._INTERCEPT.updateCountdowns = () => {
	$(".countdown").each(function () {
		const $this = $(this);
		const expireTime = parseInt($this.data("expire"));
		const now = Date.now();
		const diff = expireTime - now;

		if (diff <= 0) {
			$this.text("Expired!");
		} else {
			const seconds = Math.floor(diff / 1000);
			$this.text(`${seconds}s`);
		}
	});
};

window._INTERCEPT.enable = () => {
	window._INTERCEPT.USE_INTERCEPT = true;
};
window._INTERCEPT.disable = () => {
	window._INTERCEPT.USE_INTERCEPT = false;
};
window._INTERCEPT.intercept = () => {
	if (window._INTERCEPT.INTERCEPTED) return;
	window._INTERCEPT.INTERCEPTED = true;
	const originalSend = window.WebSocket.prototype.send;
	window.WebSocket.prototype.send = async function (data) {
		if (!window._INTERCEPT.USE_INTERCEPT) return originalSend.call(this, data);
		try {
			let shouldContinue = await window._INTERCEPT.handleIntercept(data);
			if (!shouldContinue) return;

			return originalSend.call(this, data);
		} catch (e) {
			console.log("intercept error", e);
			return originalSend.call(this, data);
		}
	};
};
window._INTERCEPT.initialize = () => {
	window._INTERCEPT.intercept();
	$(".r20-draggable-element").remove();

	clearInterval(window._INTERCEPT.countdownInterval);
	window._INTERCEPT.countdownInterval = setInterval(window._INTERCEPT.updateCountdowns, 1000);

	let appended = $("body").append(modalHTML);
	let newElement = $(appended);
	newElement.find("#toggle-intercept").text(window._INTERCEPT.USE_INTERCEPT ? "Enabled" : "Disabled");
	// Bind toggle button event
	newElement
		.find("#toggle-intercept")
		.off("click")
		.on("click", function () {
			window._INTERCEPT.USE_INTERCEPT = !window._INTERCEPT.USE_INTERCEPT;
			$(this).text(window._INTERCEPT.USE_INTERCEPT ? "Enabled" : "Disabled");
		});
	newElement
		.find("#reset-timeout")
		.off("click")
		.on("click", function () {
			window._INTERCEPT.loopTimeout = 0;
			$("#displayRolls").text(`Total Sum: null - Timeout: ${window._INTERCEPT.loopTimeout}/50`);
		});

	newElement.find(".r20-draggable-element").draggable({
		containment: "window",
		handle: false,
		scroll: false,
	});
	newElement.find(".r20-deleteSelf").on("click", function () {
		window._INTERCEPT.disable();
		$(this).closest(".r20-draggable-element").remove();
	});
};
window._INTERCEPT.initialize();
