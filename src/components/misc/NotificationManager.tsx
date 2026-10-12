"use client";

import { useEffect, useState } from "react";

import { sendNotification, subscribeUser, unsubscribeUser } from "@/app/actions/notifications";
import { editUser, getUser } from "@/app/actions/users";
import { defaultNotificationSettings, notificationKeys, User, UserNotificationKeys } from "@/db/types";
import { getPublicEnv } from "@/public-env";

import Button, { ButtonLooks } from "../primitives/Button";
import Checkbox from "../primitives/Checkbox";
import Subtext from "../primitives/Subtext";

import webpush from "web-push";
import Spinner from "../primitives/Spinner";
import { deleteFromArray } from "@/lib/array";

function urlBase64ToUint8Array(base64String: string) {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export function PushNotificationManager() {
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(null);

	const [user, setUser] = useState<User>();

	async function registerServiceWorker() {
		if (!user)
			return;

		const registration = await navigator.serviceWorker.register(
			new URL("../../lib/service-worker.js", import.meta.url),
			{
				scope: "/",
				updateViaCache: "none",
			}
		);
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);
	}

	async function subscribeToPush() {
		if (!user)
			return;

		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(getPublicEnv().VAPID_PUBLIC_KEY)
		});
		setSubscription(sub);
		const serializedSub = JSON.parse(JSON.stringify(sub));
		console.log(serializedSub);
		await subscribeUser(serializedSub, defaultNotificationSettings)
			.then(() => setUser({ ...user, pushSubscriptions: [...user.pushSubscriptions, serializedSub] }));
	}

	async function unsubscribeFromPush() {
		if (!user)
			return;

		await subscription?.unsubscribe();
		setSubscription(null);
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.getSubscription();
		if (!sub)
			return;
		const serializedSub = JSON.parse(JSON.stringify(sub));
		await unsubscribeUser(serializedSub)
			.then(() => setUser({ ...user, pushSubscriptions: deleteFromArray(user.pushSubscriptions, serializedSub) }));
	}

	async function sendTestNotification() {
		if (subscription) {
			await sendNotification();
		}
	}

	async function updateSetting(key: UserNotificationKeys, enabled: boolean) {
		if (!user)
			return;
		await editUser({ pushNotifications: { ...user.pushNotifications, [key]: enabled } }).then(setUser);
	}

	useEffect(() => {
		getUser().then(user => {
			setUser(user);
		});
	}, []);

	useEffect(() => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			setIsSupported(true);
			registerServiceWorker();
		}
	}, [user]);

	if (!getPublicEnv().ALLOW_NOTIFICATIONS)
		return <Subtext>Notifications have been turned off by your administrator.</Subtext>;

	if (!isSupported)
		return <Subtext>Push notifications are not supported in this browser.</Subtext>;

	if (!user)
		return <Spinner />;

	const deviceSub = JSON.parse(JSON.stringify(subscription)) as webpush.PushSubscription | null;
	const thisDeviceSubbed = !!user.pushSubscriptions.find(sub => deviceSub?.endpoint === sub.endpoint);

	return <div className="flex flex-col gap-2 w-full">
		<Checkbox onCheckedChange={c => c ? subscribeToPush() : unsubscribeFromPush()} checked={thisDeviceSubbed}>Allow Notifications</Checkbox>

		{thisDeviceSubbed && <>
			{notificationKeys.map(notif => <div key={notif.key}>
				<Checkbox checked={user?.pushNotifications[notif.key] ?? false} onCheckedChange={c => updateSetting(notif.key, c)}>{notif.name}</Checkbox>
				<Subtext>{notif.subtext}</Subtext>
			</div>)}
			<Button onClick={sendTestNotification} look={ButtonLooks.SECONDARY2}>Send Test</Button>
		</>}
	</div>;
}
