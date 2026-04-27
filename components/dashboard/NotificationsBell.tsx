"use client";

import { BellIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  linkUrl: string | null;
  createdAt: string;
  readAt: string | null;
};

type ApiPayload = {
  notifications: NotificationItem[];
  unreadCount: number;
};

function formatRelative(dateIso: string) {
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const hasUnread = unreadCount > 0;

  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [items]
  );

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as ApiPayload;
      setItems(data.notifications);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(notificationId?: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notificationId ? { notificationId } : {}),
    });
    await fetchNotifications();
  }

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      if (!panelRef.current) return;
      if (panelRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-ink-200 bg-ink-0 text-base text-ink-700 hover:bg-ink-50 sm:h-11 sm:w-11"
        aria-label="Notifications"
        onClick={() => {
          setOpen((prev) => !prev);
          if (!open) fetchNotifications();
        }}
      >
        <BellIcon size={18} />
        {hasUnread ? (
          <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-danger-600 px-1 text-center text-[10px] font-semibold leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-lg border border-ink-200 bg-ink-0 shadow-xl">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
            <p className="text-body-sm font-semibold text-ink-900">Notifications</p>
            <button
              type="button"
              className="text-caption font-medium text-ink-500 hover:text-ink-700 disabled:opacity-50"
              onClick={() => markRead()}
              disabled={!hasUnread}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && sortedItems.length === 0 ? (
              <p className="px-4 py-4 text-body-sm text-ink-500">Loading...</p>
            ) : null}

            {!loading && sortedItems.length === 0 ? (
              <p className="px-4 py-4 text-body-sm text-ink-500">
                No notifications yet.
              </p>
            ) : null}

            {sortedItems.map((item) => {
              const content = (
                <div className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-ink-50">
                  <div className="min-w-0">
                    <p className="text-body-sm font-medium text-ink-900">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-caption text-ink-700">
                      {item.message}
                    </p>
                    <p className="mt-1 text-[11px] text-ink-400">
                      {formatRelative(item.createdAt)}
                    </p>
                  </div>
                  {!item.readAt ? (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-info-600" />
                  ) : null}
                </div>
              );

              return item.linkUrl ? (
                <Link
                  key={item.id}
                  href={item.linkUrl}
                  className="block border-b border-ink-100 last:border-0"
                  onClick={async () => {
                    await markRead(item.id);
                    setOpen(false);
                  }}
                >
                  {content}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  className="block w-full border-b border-ink-100 last:border-0"
                  onClick={() => markRead(item.id)}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
