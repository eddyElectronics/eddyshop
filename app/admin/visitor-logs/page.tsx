'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface VisitorLog {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  pageUrl: string;
  country: string | null;
  city: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
  sessionId: string | null;
  visitedAt: string;
}

interface VisitorStats {
  totalVisits: number;
  todayVisits: number;
  uniqueVisitors: number;
  topPages: { pageUrl: string; count: number }[];
  deviceStats: { deviceType: string; count: number }[];
  browserStats: { browser: string; count: number }[];
}

export default function VisitorLogsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'stats' | 'logs'>('stats');
  const limit = 20;

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchStats();
      fetchLogs();
    }
  }, [authenticated, page]);

  const checkAuth = async () => {
    const res = await fetch('/api/auth/check');
    if (res.ok) {
      setAuthenticated(true);
    } else {
      router.push('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/visitor-logs?type=stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/visitor-logs?limit=${limit}&offset=${page * limit}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'Mobile':
        return '📱';
      case 'Tablet':
        return '📱';
      case 'Desktop':
        return '💻';
      default:
        return '❓';
    }
  };

  const getBrowserIcon = (browser: string | null) => {
    switch (browser) {
      case 'Chrome':
        return '🌐';
      case 'Safari':
        return '🧭';
      case 'Firefox':
        return '🦊';
      case 'Edge':
        return '🌊';
      case 'Opera':
        return '🔴';
      default:
        return '🌐';
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F3EF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#403C2A]"></div>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#403C2A]">📊 สถิติผู้เข้าชม</h1>
            <p className="text-[#58594D] mt-1">ติดตามและวิเคราะห์การเข้าชมเว็บไซต์</p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-[#403C2A] text-white rounded-lg hover:bg-[#2D2A1E] transition-colors"
          >
            ← กลับหน้าจัดการ
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'stats'
                ? 'bg-[#403C2A] text-white'
                : 'bg-white text-[#403C2A] border border-[#D9D5CB] hover:bg-[#EBE8E2]'
            }`}
          >
            📈 สถิติภาพรวม
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'logs'
                ? 'bg-[#403C2A] text-white'
                : 'bg-white text-[#403C2A] border border-[#D9D5CB] hover:bg-[#EBE8E2]'
            }`}
          >
            📋 รายการเข้าชม
          </button>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D9D5CB]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#7a9a8a]/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">👥</span>
                  </div>
                  <div>
                    <p className="text-[#58594D] text-sm">การเข้าชมทั้งหมด</p>
                    <p className="text-3xl font-bold text-[#403C2A]">{stats.totalVisits.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D9D5CB]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#BFB595]/20 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">📅</span>
                  </div>
                  <div>
                    <p className="text-[#58594D] text-sm">เข้าชมวันนี้</p>
                    <p className="text-3xl font-bold text-[#403C2A]">{stats.todayVisits.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D9D5CB]">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#403C2A]/10 rounded-xl flex items-center justify-center">
                    <span className="text-3xl">🌍</span>
                  </div>
                  <div>
                    <p className="text-[#58594D] text-sm">ผู้เข้าชมไม่ซ้ำ</p>
                    <p className="text-3xl font-bold text-[#403C2A]">{stats.uniqueVisitors.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D9D5CB]">
                <h3 className="text-lg font-semibold text-[#403C2A] mb-4">📱 อุปกรณ์ที่ใช้</h3>
                <div className="space-y-3">
                  {stats.deviceStats.map((stat, index) => {
                    const percentage = stats.totalVisits > 0 
                      ? Math.round((stat.count / stats.totalVisits) * 100) 
                      : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#58594D]">
                            {getDeviceIcon(stat.deviceType)} {stat.deviceType}
                          </span>
                          <span className="text-[#403C2A] font-medium">
                            {stat.count.toLocaleString()} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#EBE8E2] rounded-full h-2">
                          <div
                            className="bg-[#7a9a8a] h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {stats.deviceStats.length === 0 && (
                    <p className="text-[#A6A08D] text-center py-4">ยังไม่มีข้อมูล</p>
                  )}
                </div>
              </div>

              {/* Browser Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D9D5CB]">
                <h3 className="text-lg font-semibold text-[#403C2A] mb-4">🌐 เบราว์เซอร์</h3>
                <div className="space-y-3">
                  {stats.browserStats.map((stat, index) => {
                    const percentage = stats.totalVisits > 0 
                      ? Math.round((stat.count / stats.totalVisits) * 100) 
                      : 0;
                    return (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[#58594D]">
                            {getBrowserIcon(stat.browser)} {stat.browser}
                          </span>
                          <span className="text-[#403C2A] font-medium">
                            {stat.count.toLocaleString()} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#EBE8E2] rounded-full h-2">
                          <div
                            className="bg-[#BFB595] h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {stats.browserStats.length === 0 && (
                    <p className="text-[#A6A08D] text-center py-4">ยังไม่มีข้อมูล</p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D9D5CB]">
              <h3 className="text-lg font-semibold text-[#403C2A] mb-4">📄 หน้าที่เข้าชมมากที่สุด</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#D9D5CB]">
                      <th className="text-left py-3 px-4 text-[#58594D] font-medium">หน้า</th>
                      <th className="text-right py-3 px-4 text-[#58594D] font-medium">จำนวนเข้าชม</th>
                      <th className="text-right py-3 px-4 text-[#58594D] font-medium">สัดส่วน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topPages.map((page, index) => {
                      const percentage = stats.totalVisits > 0 
                        ? ((page.count / stats.totalVisits) * 100).toFixed(1)
                        : '0';
                      return (
                        <tr key={index} className="border-b border-[#EBE8E2] hover:bg-[#F5F3EF]">
                          <td className="py-3 px-4 text-[#403C2A]">{page.pageUrl}</td>
                          <td className="py-3 px-4 text-[#403C2A] text-right font-medium">
                            {page.count.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-[#58594D] text-right">{percentage}%</td>
                        </tr>
                      );
                    })}
                    {stats.topPages.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-[#A6A08D]">
                          ยังไม่มีข้อมูล
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D9D5CB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F5F3EF]">
                  <tr>
                    <th className="text-left py-4 px-4 text-[#58594D] font-medium">เวลา</th>
                    <th className="text-left py-4 px-4 text-[#58594D] font-medium">หน้า</th>
                    <th className="text-left py-4 px-4 text-[#58594D] font-medium">อุปกรณ์</th>
                    <th className="text-left py-4 px-4 text-[#58594D] font-medium">เบราว์เซอร์</th>
                    <th className="text-left py-4 px-4 text-[#58594D] font-medium">IP</th>
                    <th className="text-left py-4 px-4 text-[#58594D] font-medium">แหล่งที่มา</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#403C2A] mx-auto"></div>
                      </td>
                    </tr>
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-[#A6A08D]">
                        ยังไม่มีข้อมูลการเข้าชม
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="border-b border-[#EBE8E2] hover:bg-[#F5F3EF]">
                        <td className="py-3 px-4 text-[#58594D] text-sm whitespace-nowrap">
                          {formatDate(log.visitedAt)}
                        </td>
                        <td className="py-3 px-4 text-[#403C2A] font-medium">
                          {log.pageUrl}
                        </td>
                        <td className="py-3 px-4 text-[#58594D]">
                          <span className="inline-flex items-center gap-1">
                            {getDeviceIcon(log.deviceType)}
                            <span className="text-sm">{log.deviceType || '-'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#58594D]">
                          <span className="inline-flex items-center gap-1">
                            {getBrowserIcon(log.browser)}
                            <span className="text-sm">{log.browser || '-'}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#A6A08D] text-sm font-mono">
                          {log.ipAddress || '-'}
                        </td>
                        <td className="py-3 px-4 text-[#58594D] text-sm max-w-[200px] truncate">
                          {log.referrer || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-[#D9D5CB]">
                <p className="text-sm text-[#58594D]">
                  แสดง {page * limit + 1} - {Math.min((page + 1) * limit, total)} จาก {total} รายการ
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-4 py-2 rounded-lg border border-[#D9D5CB] text-[#403C2A] hover:bg-[#EBE8E2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← ก่อนหน้า
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-4 py-2 rounded-lg border border-[#D9D5CB] text-[#403C2A] hover:bg-[#EBE8E2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
