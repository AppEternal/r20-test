import modalHTML from "./modal.html";
if (!window._INTERCEPT) {
	window._INTERCEPT = {
		INTERCEPTED: false,
		USE_INTERCEPT: false,
		intercepted: [],
		timeout: 30_000,
		timeoutReject: true,
		countdownInterval: undefined,
	};
}

window._INTERCEPT.handleIntercept = async (data) => {
	try {
		const json = JSON.parse(data);
		console.log("raw Events", json);
		if (json.d?.b?.p.includes("/campaign/turnorder")) {
			//return await queueRoll(json, "turnorder");
		}
		if (json.d?.b?.d?.mancerdata) {
			//console.log("json", json);
			//return await queueRoll(json, "mancerdata");
		}
		if (json.d?.b?.d?.type === "rollresult") {
			return await queueRoll(json, "rollresult");
		}
		if (json.d?.b?.d?.type === "general") {
			if (json?.d?.b?.d?.inlinerolls) {
				return await queueRoll(json, "inlinerolls");
			} else {
				return await queueRoll(json, "other");
			}
		}
	} catch (error) {
		console.log("handleIntercept", error);
		return true;
	}

	return true;

	function queueRoll(json, type) {
		const expireTime = Date.now() + window._INTERCEPT.timeout; // expires in 30 seconds
		const promise = new Promise((resolve) => {
			let id = simpleHash(json.d.b.d);
			if (!id) return resolve(true);

			const timer = setTimeout(() => {
				if (window._INTERCEPT.timeoutReject) {
					rejectWrapper();
				} else {
					continueWrapper();
				}
			}, window._INTERCEPT.timeout);

			const rejectWrapper = () => {
				clearTimeout(timer);
				window._INTERCEPT.intercepted = window._INTERCEPT.intercepted.filter((item) => item.id !== id);
				window._INTERCEPT.displayRolls();
				resolve(false);
			};
			const continueWrapper = () => {
				clearTimeout(timer);
				window._INTERCEPT.intercepted = window._INTERCEPT.intercepted.filter((item) => item.id !== id);
				window._INTERCEPT.displayRolls();
				resolve(true);
			};
			let parsedContent = {};
			try {
				parsedContent = JSON.parse(json.d.b.d?.content.trim());
			} catch (error) {}
			window._INTERCEPT.intercepted.push({
				type: type,
				id: id,
				data: json.d.b.d,
				content: parsedContent,
				continue: continueWrapper,
				reject: rejectWrapper,
				expire: expireTime,
				timer: timer,
			});
			window._INTERCEPT.displayRolls();
		});
		return promise;
	}
	function simpleHash(obj) {
		try {
			return btoa(JSON.stringify(obj)).replace(/[/+=]/g, "");
		} catch (error) {
			return false;
		}
	}
};
window._INTERCEPT.displayRolls = async () => {
	const container = $("#displayRolls");
	container.empty();
	window._INTERCEPT.intercepted.forEach((item, index) => {
		let rollText = "";
		if (item.type === "rollresult") {
			rollText = `${item.content.total}`;
		} else if (item.type === "inlinerolls") {
			let rolls = [];
			for (const key in item.data.inlinerolls) {
				let roll = item.data.inlinerolls[key];
				if (roll.signature) {
					rolls.push(roll.results.total);
				}
			}
			rollText = `${JSON.stringify(rolls)}`;
		} else if (item.type === "mancerdata") {
			rollText = "Mancer Data";
		} else if (item.type === "turnorder") {
			rollText = "Turn Order";
		} else {
			console.log("item", item);
		}
		const li = $(`
         <li style="display: flex; align-items: center; justify-content: space-between; padding: 4px 0;">
            <button class="btn btn-danger btn-reject" data-index="${index}">Reject</button>
            <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
               <span>${rollText}</span>
               <span class="countdown" data-expire="${item.expire}" style="color: #666; font-size: 0.9em;"></span>
            </div>
            <button class="btn btn-success btn-accept" data-index="${index}" style="margin-left: 8px;">Accept</button>
         </li>
      `);
		container.append(li);
	});
	{
		container
			.find(".btn-reject")
			.off("click")
			.on("click", function () {
				const idx = $(this).data("index");
				const item = window._INTERCEPT.intercepted[idx];
				item.reject();
			});
		container
			.find(".btn-accept")
			.off("click")
			.on("click", function () {
				const idx = $(this).data("index");
				const item = window._INTERCEPT.intercepted[idx];
				item.continue();
			});
		window._INTERCEPT.updateCountdowns();
	}
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

	newElement.find(".r20-draggable-element").draggable({
		containment: "window",
		handle: false,
		scroll: false,
	});
	newElement.find(".r20-deleteSelf").on("click", function () {
		$(this).closest(".r20-draggable-element").remove();
	});
	newElement.find(".rejectAll").on("click", function () {
		window._INTERCEPT.intercepted.forEach((item, index) => {
			item.reject();
		});
	});
	newElement.find(".acceptAll").on("click", function () {
		window._INTERCEPT.intercepted.forEach((item, index) => {
			item.continue();
		});
	});
};
window._INTERCEPT.initialize();
