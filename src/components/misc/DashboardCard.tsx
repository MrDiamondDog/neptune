"use client";
export function DashboardCard(props: React.HTMLProps<HTMLDivElement>) {
    return <div className={`w-full rounded border border-bg-lighter bg-bg-light p-2 ${props.className ?? ""}`}>
        {props.children}
    </div>;
}
