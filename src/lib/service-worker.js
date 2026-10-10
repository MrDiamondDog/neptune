self.addEventListener("push", function (event) {
	if (event.data) {
		const data = event.data.json();
		const options = {
			body: data.body,
			icon: data.icon || "/neptune.png",
			badge: "/neptune.png",
			data: {
				dateOfArrival: Date.now(),
				primaryKey: "2",
			},
		};
		event.waitUntil(self.registration.showNotification(data.title, options));
	}
});

self.addEventListener("notificationclick", function (event) {
	event.notification.close();
	event.waitUntil(clients.openWindow("<https://neptune.drewrat.dev/app>"));
});
