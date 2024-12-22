async function checkRoom() {
	return false;

	const api = `https://a2net-roomcheck-proxy.netsoc.group/events`;

	const req = await fetch(api);
	const data = await req.json();
	console.log(req, data);

	// const now = new Date("2023-10-10T17:32:00");
	const now = new Date();
	const happening = isFreeAtTime(now, data);

	if (happening.free) {
		document.getElementById("js-status").innerHTML = "Yes!";
		document.getElementById("js-footer").innerHTML = `Nothing is currently timetabled.<span class="new-line" aria-hidden="true"> </span>The room is likely to be free.`;

		document.body.classList.add("free");
	} else {
		document.getElementById("js-status").innerHTML = "No!";

		// calculate minutes to end of current event
		const end = new Date(happening.event.end);
		const minutes = Math.floor((end - now) / 1000 / 60);

		const currentEventTitle = `${happening.event.type ? happening.event.type : "Missing Type"}\n${happening.event.moduleName ? happening.event.moduleName : "Missing Module"}\n${happening.event.lect ? happening.event.lect : "Missing Lecturer"}\n${happening.event.desc ? happening.event.desc : "Missing Description"}
				`

		document.getElementById("js-footer").innerHTML = `The <abbr title="${currentEventTitle}">current session</abbr> finishes in <strong>${minsToString(minutes)}</strong>`;
		document.body.classList.add("busy");

		// check if there is a session timetabled after this one

		// add a minute to the end time to check if there is a session after this one
		end.setMinutes(end.getMinutes() + 1);
		const next = isFreeAtTime(end, data);
		if (next.free) {
			document.getElementById("js-footer").innerHTML += `<span class="new-line" aria-hidden="true"> &bull; </span> The room should be free after this session.`;
		} else {
			const nextEnd = new Date(next.event.end);
			const nextMinutes = Math.floor((nextEnd - end) / 1000 / 60);
			document.getElementById("js-footer").innerHTML += `<span class="new-line" aria-hidden="true"> &bull; </span>There is another session after this one, which ends in <strong>${minsToString(nextMinutes)}</strong>`;
		}
	}
}

// onload
checkRoom();

function isFreeAtTime(time, events) {
	let free = true;

	for (const e of events) {
		const start = new Date(e.start);
		const end = new Date(e.end);

		if (time >= start && time <= end) return { free: false, event: e };
	}

	return { free: true };
}

function minsToString(mins) {
	const hours = Math.floor(mins / 60);
	const minutes = mins % 60;

	if (hours == 0) return `${minutes}m`;

	return `${hours}h ${minutes}m`;
}