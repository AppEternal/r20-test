import modalHTML from "./modal.html";

(function () {
	// Helper function for confirmation dialog with timeout
	function createModal(message, timeout) {
		const modal = document.createElement("div");
		modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            color: black;
            z-index: 10000;
        `;

		modal.innerHTML = `
            <p>${message}</p>
            <p>rejecting in <span id="timer">${timeout / 1000}</span> seconds...</p>
            <button id="confirmYes" class="button" style="padding:10px">Yes</button>
            <button id="confirmNo" class="button" style="padding:10px">No</button>
        `;

		document.body.appendChild(modal);
		return modal;
	}

	function confirmWithTimeout(message, timeout) {
		return new Promise((resolve) => {
			const modal = createModal(message, timeout);
			let timeLeft = timeout / 1000;
			let isResolved = false;

			const yesButton = modal.querySelector("#confirmYes");
			const noButton = modal.querySelector("#confirmNo");
			const timerSpan = modal.querySelector("#timer");

			// Set timeout to auto-continue
			const timer = setInterval(() => {
				timeLeft--;
				timerSpan.textContent = timeLeft;

				if (timeLeft <= 0 && !isResolved) {
					isResolved = true;
					clearInterval(timer);
					modal.remove();
					resolve(false);
				}
			}, 1000);

			yesButton.addEventListener("click", () => {
				if (!isResolved) {
					isResolved = true;
					clearInterval(timer);
					modal.remove();
					resolve(true);
				}
			});

			noButton.addEventListener("click", () => {
				if (!isResolved) {
					isResolved = true;
					clearInterval(timer);
					modal.remove();
					resolve(false);
				}
			});
		});
	}

	// Patch the native send method
	const originalSend = window.WebSocket.prototype.send;
	window.WebSocket.prototype.send = async function (data) {
		try {
			const json = JSON.parse(data);
			if (json.d?.b?.d?.type === "rollresult") {
				let content = JSON.parse(json.d.b.d.content);
				const shouldContinue = await confirmWithTimeout(`roll:${content.total}`, 5000);
				if (!shouldContinue) {
					return;
				}
			}
			if (json.d?.b?.d?.type === "general" && json.d.b.d.inlinerolls) {
				let rolls = json.d.b.d.inlinerolls;
				const shouldContinue = await confirmWithTimeout(
					`roll:${rolls?.[0]?.results?.total} | ${rolls?.[1]?.results?.total}`,
					5000,
				);
				if (!shouldContinue) {
					return;
				}
			}
			return originalSend.call(this, data);
		} catch (e) {
			return originalSend.call(this, data);
		}
	};
})();

// Instead of loading modal via $.get, use the inlined HTML
// Append the modal HTML content to the DOM
document.addEventListener("DOMContentLoaded", function () {
	document.body.insertAdjacentHTML("beforeend", modalHTML);
	$(".draggable-element").draggable({
		containment: "window",
		handle: false,
		scroll: false,
	});
});
