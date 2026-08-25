"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import {
  Activity, UserCheck, UserPlus, UserX, Edit2,
  CreditCard, Loader2, ChevronLeft, ChevronRight,
  Filter,
} from "lucide-react";

type LogEntry = {
  id: string;
  admin_id: string;
  admin_nama: string;
  action: string;
  target_type: string;
  target_id: string;
  target_nama: string;
  detail: string;
  created_at: string;
};

const ACTION_MAP: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  verifikasi_member: { label: "Verifikasi Member", icon: <UserCheck className="w-4 h-4" />, color: "#22c55e" },
  perpanjang_member: { label: "Perpanjang Member", icon: <CreditCard className="w-4 h-4" />, color: "#3b82f6" },
  edit_member: { label: "Edit Data Member", icon: <Edit2 className="w-4 h-4" />, color: "#f59e0b" },
  hapus_member: { label: "Hapus Member", icon: <UserX className="w-4 h-4" />, color: "#ef4444" },
  tambah_member: { label: "Tambah Member", icon: <UserPlus className="w-4 h-4" />, color: "#a855f7" },
};

function getActionInfo(action: string) {
  return ACTION_MAP[action] ?? { label: action, icon: <Activity className="w-4 h-4" />, color: "var(--color-text-muted)" };
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filterAction, setFilterAction] = useState<string>("");
  const LIMIT = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(LIMIT),
        offset: String(page * LIMIT),
      });
      if (filterAction) params.set("action", filterAction);

      const res = await fetch(`/api/admin/logs?${params}`);
      const json = await res.json();
      if (res.ok) {
        setLogs(json.logs ?? []);
        setTotal(json.total ?? 0);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, filterAction]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(total / LIMIT);

  // Group logs by date
  const groupedLogs: Record<string, LogEntry[]> = {};
  logs.forEach((log) => {
    const dateKey = new Date(log.created_at).toISOString().split("T")[0];
    if (!groupedLogs[dateKey]) groupedLogs[dateKey] = [];
    groupedLogs[dateKey].push(log);
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
          RIWAYAT AKTIVITAS
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Log semua aktivitas admin di sistem
        </p>
      </div>

      {/* Filter */}
      <div className="card mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
          <button
            onClick={() => { setFilterAction(""); setPage(0); }}
            className={!filterAction ? "btn-primary py-1.5 px-3 text-xs" : "btn-ghost py-1.5 px-3 text-xs"}
          >
            Semua
          </button>
          {Object.entries(ACTION_MAP).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => { setFilterAction(key); setPage(0); }}
              className={filterAction === key ? "btn-primary py-1.5 px-3 text-xs" : "btn-ghost py-1.5 px-3 text-xs"}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Timeline */}
      {loading ? (
        <div className="card p-12 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--color-brand-orange)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Memuat riwayat...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--color-text-muted)" }} />
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada aktivitas</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLogs).map(([dateKey, dateLogs]) => (
            <div key={dateKey}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  {formatFullDate(dateKey)}
                </div>
                <div className="flex-1 h-px" style={{ background: "var(--color-border-default)" }} />
              </div>

              {/* Log Entries */}
              <div className="space-y-2">
                {dateLogs.map((log) => {
                  const info = getActionInfo(log.action);
                  return (
                    <div key={log.id} className="card" style={{ padding: "0.875rem 1.25rem" }}>
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: `${info.color}15`, color: info.color }}
                        >
                          {info.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                              {info.label}
                            </span>
                            {log.target_nama && (
                              <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: "var(--color-dark-400)", color: "var(--color-text-secondary)" }}>
                                {log.target_nama}
                              </span>
                            )}
                          </div>
                          {log.detail && (
                            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{log.detail}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: "var(--color-text-muted)" }}>
                            <span>{formatTime(log.created_at)}</span>
                            <span>·</span>
                            <span>oleh {log.admin_nama || "Admin"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-ghost py-2 px-3"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Halaman {page + 1} dari {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="btn-ghost py-2 px-3"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
