"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

import Button from "@/components/primitives/Button";
import Divider from "@/components/primitives/Divider";
import Input from "@/components/primitives/Input";
import LinkButton from "@/components/primitives/LinkButton";
import { throwToast } from "@/lib/errors";
import { getPublicEnv } from "@/public-env";

import { signUp } from "../actions/signup";

export default function HomePage() {
	const searchParams = useSearchParams();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(searchParams.has("error") ? "Invalid email or password." : "");

	const [mode, setMode] = useState<"signin" | "signup">("signin");

	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		setError(searchParams.has("error") ? "Invalid email or password." : "");
		if (password !== confirmPassword && mode === "signup")
			return void setError("Passwords do not match");
	}, [password, confirmPassword, mode, searchParams]);

	async function login() {
		setLoading(true);

		await signIn("credentials", {
			redirect: true,
			redirectTo: "/app",
			email,
			password,
		}).catch(e => {
			throwToast("Unable to sign in", e);
			setLoading(false);
		});
	}

	async function signup() {
		setError("");

		if (!email || !password || !confirmPassword || !name)
			return void setError("Please fill out all fields");

		if (password !== confirmPassword)
			return void setError("Passwords do not match");

		if (password.length < 8)
			return void setError("Password must be longer than 8 characters");

		setLoading(true);

		await signUp(email, name, password).catch(e => {
			setLoading(false);
			throwToast("Could not sign up", e);
		});

		await signIn("credentials", {
			redirect: true,
			redirectTo: "/app",
			email,
			password,
		}).catch(e => {
			throwToast("Unable to sign in", e);
			setLoading(false);
		});

		setLoading(false);
	}

	return <div className="w-screen h-screen overflow-hidden bg-bg">
		<main className="absolute-center bg-bg-light border-2 border-bg-lighter p-4 w-75">
			<h2>{mode === "signin" ? "Log In" : "Sign Up"}</h2>
			<Divider />
			<div className="flex flex-col gap-1">
				<Input placeholder="Email" type="email" onChange={setEmail} value={email} className="w-full" />
				{mode === "signup" && <Input placeholder="Name" onChange={setName} value={name} className="w-full" />}
				<Input placeholder="Password" type="password" onChange={setPassword} value={password} className="w-full" />
				{mode === "signup" &&
					<Input placeholder="Confirm Password" type="password" onChange={setConfirmPassword} value={confirmPassword} className="w-full" />}
				{mode === "signin" ? <Button onClick={login} loading={loading}>Log In</Button> :
					<Button onClick={signup} loading={loading}>Sign Up</Button>}
				{error && <p className="text-danger text-wrap overflow-hidden">{error}</p>}
			</div>
			{getPublicEnv().ALLOW_SIGNUPS !== "true" ? <p>The admin of the application has disabled sign ups.</p> :
				<LinkButton onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
					{mode === "signup" ? "Already have an account?" : "Don't have an account?"}
				</LinkButton>}
		</main>
	</div>;
}
