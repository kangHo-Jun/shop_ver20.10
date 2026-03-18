import os
import time
import json
import threading
import sys
import datetime
import subprocess
from flask import Flask, jsonify, request, render_template_string
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.common.by import By
import traceback
import atexit
import signal

# Import foundation modules
from config import config
from logging_config import logger
from error_handler import error_handler, ErrorSeverity

from lock_manager import DistributedLockManager, RetryExhaustedError
from google_sheet_hub import GoogleSheetHub

# Import existing logic
try:
    import local_file_processor
    # Legacy ERP auto-upload path retained for rollback/reference only.
    # from erp_upload_automation_v2 import ErpUploadAutomation
    from state_manager import state_manager
except ImportError as e:
    logger.critical(f"Error importing modules: {e}")
    sys.exit(1)

# Server setup
app = Flask(__name__)
lock = threading.Lock()
ledger_lock = threading.Lock()
estimate_lock = threading.Lock()
browser_lock = threading.Lock()  # V10: 브라우저 포트(9333) 경합 방지용 락

# V10: Initialize distributed lock manager
distributed_lock = DistributedLockManager()
sheet_hub = GoogleSheetHub()

# Status tracking
server_status = {
    "downloader_active": False,
    "downloader_last_run": None,
    "downloader_status": "Idle",
    "ledger_uploader_status": "Idle",
    "estimate_uploader_status": "Idle",
    "last_error": None,
    "last_log": "",
    "empty_cycle_count": 0,
    "start_time": datetime.datetime.now().isoformat(),
    "lock_manager_connected": False,  # V10
    "machine_id": "",  # V10
    "browser_healthy": False,
    "youngrim_logged_in": None  # None = unknown, True/False = checked
}

# Upload state tracking for pending_save confirmation
# States: idle, running, pending_save, completed, failed
upload_state = {
    "ledger": {
        "status": "idle",
        "pending_files": [],  # Files awaiting save confirmation
        "pending_since": None,  # Timestamp when entered pending_save
        "last_completed": None,
        "last_error": None
    },
    "estimate": {
        "status": "idle",
        "pending_files": [],
        "pending_since": None,
        "last_completed": None,
        "last_error": None
    }
}

# Timeout for pending_save state
PENDING_SAVE_TIMEOUT_SEC = config.SHEET_HUB_LOCK_TIMEOUT_SEC

# HTML Template for V10 UI
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>V10 Automation Control</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #0d1117; color: #eee; }
        .container { max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        h1 { color: #00d9ff; margin: 0; }
        .uptime { font-size: 0.8em; color: #888; }
        .machine-id { font-size: 0.7em; color: #38ef7d; margin-top: 5px; }
        .card { margin-bottom: 20px; padding: 25px; background: #16213e; border-radius: 12px; border: 1px solid #0f3460; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        .card h2 { margin-top: 0; font-size: 1.2em; color: #00d9ff; display: flex; justify-content: space-between; }
        .badge { font-size: 0.7em; background: #0f3460; padding: 4px 10px; border-radius: 20px; color: #38ef7d; }
        .badge-warning { background: #f5576c; color: white; }
        .badge-ok { background: #38ef7d; color: #0d1117; }
        .badge-error { background: #f5576c; color: white; }
        .btn { display: inline-block; padding: 14px 28px; font-size: 15px; font-weight: bold; color: white; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; width: 100%; box-sizing: border-box; text-align: center; margin-top: 10px; transition: all 0.2s; }
        .btn-blue { background: linear-gradient(135deg, #667eea, #764ba2); }
        .btn-green { background: linear-gradient(135deg, #11998e, #38ef7d); }
        .btn-orange { background: linear-gradient(135deg, #f093fb, #f5576c); }
        .btn-gray { background: linear-gradient(135deg, #4b5d67, #322f3d); }
        .btn-red { background: linear-gradient(135deg, #eb3349, #f45c43); }
        .btn-small { padding: 10px 20px; font-size: 13px; width: auto; }
        .btn:disabled { background: #444; opacity: 0.6; cursor: not-allowed; transform: none !important; box-shadow: none !important; }
        .status-box { background: #0f3460; padding: 15px; border-radius: 8px; font-family: 'Cascadia Code', monospace; margin-top: 15px; font-size: 0.9em; line-height: 1.6; }
        .label { color: #888; margin-right: 10px; }
        .val { color: #fff; }
        .val-ok { color: #38ef7d; }
        .val-warn { color: #ffd93d; }
        .val-error { color: #f5576c; }
        .pending-count { color: #f5576c; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; color: #444; font-size: 0.8em; }
        .pulse { animation: pulse-animation 2s infinite; }
        @keyframes pulse-animation { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
        .v10-badge { background: linear-gradient(135deg, #11998e, #38ef7d); padding: 5px 12px; border-radius: 15px; font-size: 0.7em; color: white; font-weight: bold; }
        .pending-save-card { border: 2px solid #ffd93d; background: #1a1a2e; }
        .pending-save-card h2 { color: #ffd93d; }
        .btn-row { display: flex; gap: 10px; margin-top: 10px; }
        .btn-row .btn { flex: 1; }
        .health-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .alert-banner { background: #f5576c; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: bold; }
        .alert-banner.warning { background: #ffd93d; color: #0d1117; }
    </style>
    <script>
        let lastUploadState = null;

        async function updateStats() {
            try {
                const [statsRes, healthRes, uploadStateRes] = await Promise.all([
                    fetch('/api/stats'),
                    fetch('/api/health'),
                    fetch('/api/upload_state')
                ]);
                const data = await statsRes.json();
                const health = await healthRes.json();
                const uploadState = await uploadStateRes.json();
                lastUploadState = uploadState;

                // Update Health Status
                updateHealthStatus(health);

                // Update Lock Manager Status
                const lockStatus = document.getElementById('lock-status');
                const lockMachine = document.getElementById('lock-machine');
                if (data.status.lock_manager_connected) {
                    lockStatus.innerText = '✅ Connected';
                    lockStatus.style.color = '#38ef7d';
                } else {
                    lockStatus.innerText = '❌ Disconnected (Standalone)';
                    lockStatus.style.color = '#ffd93d';
                }
                lockMachine.innerText = data.status.machine_id || 'Local';

                // Update Downloader
                document.getElementById('dl-status').innerText = data.status.downloader_status;
                document.getElementById('dl-last').innerText = data.status.downloader_last_run || 'None';

                // Update Ledger
                updateUploadCard('ledger', data, uploadState.ledger);

                // Update Estimate
                updateUploadCard('estimate', data, uploadState.estimate);

            } catch (e) { console.error("Stats update failed", e); }
        }

        function updateHealthStatus(health) {
            // Browser status
            const browserEl = document.getElementById('health-browser');
            if (health.browser_healthy) {
                browserEl.innerHTML = '🟢 연결됨';
                browserEl.className = 'val val-ok';
            } else {
                browserEl.innerHTML = '🔴 연결 안됨';
                browserEl.className = 'val val-error';
            }

            // Login status
            const loginEl = document.getElementById('health-login');
            if (health.youngrim_logged_in === true) {
                loginEl.innerHTML = '🟢 로그인됨';
                loginEl.className = 'val val-ok';
            } else if (health.youngrim_logged_in === false) {
                loginEl.innerHTML = '🔴 로그인 필요';
                loginEl.className = 'val val-error';
            } else {
                loginEl.innerHTML = '⚪ 확인 안됨';
                loginEl.className = 'val val-warn';
            }

            // Downloader stuck
            const stuckEl = document.getElementById('health-stuck');
            if (health.downloader_stuck) {
                stuckEl.innerHTML = '🔴 응답 없음';
                stuckEl.className = 'val val-error';
            } else {
                stuckEl.innerHTML = '🟢 정상';
                stuckEl.className = 'val val-ok';
            }

            // Uptime
            const uptimeMin = Math.floor(health.uptime_seconds / 60);
            document.getElementById('health-uptime').innerText = uptimeMin + '분';

            // Alert banner
            const alertBanner = document.getElementById('alert-banner');
            if (!health.browser_healthy) {
                alertBanner.style.display = 'block';
                alertBanner.className = 'alert-banner';
                alertBanner.innerText = '⚠️ 브라우저 연결 끊김 - Edge 브라우저를 확인하세요';
            } else if (health.youngrim_logged_in === false) {
                alertBanner.style.display = 'block';
                alertBanner.className = 'alert-banner warning';
                alertBanner.innerText = '⚠️ 영림 OMS 로그인 필요 - 브라우저에서 로그인하세요';
            } else if (health.downloader_stuck) {
                alertBanner.style.display = 'block';
                alertBanner.className = 'alert-banner';
                alertBanner.innerText = '⚠️ 다운로더 응답 없음 - 재시작이 필요할 수 있습니다';
            } else {
                alertBanner.style.display = 'none';
            }
        }

        function updateUploadCard(type, data, state) {
            const prefix = type === 'ledger' ? 'l' : 'e';
            const pendingEl = document.getElementById(prefix + '-pending');
            const historyEl = document.getElementById(prefix + '-history');
            const btn = document.getElementById('btn-' + prefix);
            const pendingCard = document.getElementById('pending-' + type);

            pendingEl.innerText = data.pending[type];
            historyEl.innerText = data.history_count[type];
            
            // New V10 Metrics
            if (data.metrics) {
                document.getElementById(prefix + '-metrics-row').style.display = 'flex';
                document.getElementById(prefix + '-today-dl').innerText = data.metrics[type].today_downloaded;
                document.getElementById(prefix + '-ready').innerText = data.metrics[type].ready_to_upload;
                document.getElementById(prefix + '-today-up').innerText = data.metrics[type].uploaded_today;
                document.getElementById(prefix + '-failed').innerText = data.metrics[type].failed;
            }

            // Check if in pending_save state
            if (state.status === 'pending_save') {
                pendingCard.style.display = 'block';
                const filesEl = document.getElementById('pending-' + type + '-files');
                const timeEl = document.getElementById('pending-' + type + '-time');

                filesEl.innerText = state.pending_files.join(', ');

                if (state.pending_since) {
                    const since = new Date(state.pending_since);
                    const elapsed = Math.floor((Date.now() - since.getTime()) / 1000);
                    const min = Math.floor(elapsed / 60);
                    const sec = elapsed % 60;
                    timeEl.innerText = min + '분 ' + sec + '초';
                }

                btn.disabled = true;
                btn.innerText = '⏳ 저장 확인 대기중...';
            } else {
                pendingCard.style.display = 'none';

                if (data.pending[type] > 0 && data.status[type + '_uploader_status'] === 'Idle') {
                    btn.disabled = false;
                    btn.innerText = `⬆ Upload ${type === 'ledger' ? 'Ledger' : 'Estimate'} (${data.pending[type]} items)`;
                    btn.classList.remove('btn-gray');
                    btn.classList.add(type === 'ledger' ? 'btn-blue' : 'btn-orange');
                } else {
                    btn.disabled = true;
                    if (data.status[type + '_uploader_status'] === 'Running') {
                        btn.innerText = '⏳ Processing...';
                    } else {
                        btn.innerText = '⬆ No items to upload';
                        btn.classList.add('btn-gray');
                        btn.classList.remove(type === 'ledger' ? 'btn-blue' : 'btn-orange');
                    }
                }
            }
        }

        function triggerAction(endpoint, btn) {
            btn.disabled = true;
            fetch(endpoint, { method: 'POST' })
                .then(r => r.json())
                .then(d => {
                    if (d.status === 'success') {
                        setTimeout(updateStats, 500);
                    } else {
                        alert("Error: " + d.message);
                        btn.disabled = false;
                    }
                })
                .catch(e => { alert(e); btn.disabled = false; });
        }

        function confirmSave(type) {
            fetch('/confirm_save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type })
            })
            .then(r => r.json())
            .then(d => {
                if (d.status === 'success') {
                    alert('✅ ' + d.message);
                    updateStats();
                } else {
                    alert('Error: ' + d.message);
                }
            });
        }

        function markFailed(type) {
            if (!confirm('저장에 실패했습니까? 해당 파일들은 다시 업로드됩니다.')) return;

            fetch('/mark_failed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: type })
            })
            .then(r => r.json())
            .then(d => {
                if (d.status === 'success') {
                    alert('⚠️ ' + d.message);
                    updateStats();
                } else {
                    alert('Error: ' + d.message);
                }
            });
        }

        setInterval(updateStats, 3000);
        window.onload = updateStats;
    </script>
</head>
<body>
    <div class="container">
        <div id="alert-banner" class="alert-banner" style="display:none;"></div>

        <div class="header">
            <div>
                <h1>⚡ V10 Dashboard <span class="v10-badge">DISTRIBUTED</span></h1>
                <div class="uptime">V10 Multi-Machine Support</div>
                <div class="machine-id" id="lock-machine">Loading...</div>
            </div>
        </div>

        <div class="card">
            <h2>🏥 System Health</h2>
            <div class="status-box health-grid">
                <div><span class="label">브라우저:</span><span class="val" id="health-browser">-</span></div>
                <div><span class="label">영림 로그인:</span><span class="val" id="health-login">-</span></div>
                <div><span class="label">다운로더:</span><span class="val" id="health-stuck">-</span></div>
                <div><span class="label">가동시간:</span><span class="val" id="health-uptime">-</span></div>
            </div>
            <div class="btn-row">
                <button class="btn btn-gray btn-small" onclick="triggerAction('/check_login', this)">🔍 로그인 확인</button>
                <button class="btn btn-gray btn-small" onclick="triggerAction('/restart_downloader', this)">🔄 다운로더 재시작</button>
            </div>
        </div>

        <div class="card">
            <h2>🔒 Distributed Lock Manager <span class="badge" id="lock-status-badge">Active</span></h2>
            <div class="status-box">
                <div><span class="label">Status:</span><span class="val" id="lock-status">Loading...</span></div>
            </div>
        </div>

        <div class="card">
            <h2>📥 Auto Downloader <span class="badge pulse">Active</span></h2>
            <div class="status-box">
                <div><span class="label">Status:</span><span class="val" id="dl-status">Loading...</span></div>
                <div><span class="label">Last Run:</span><span class="val" id="dl-last">-</span></div>
            </div>
            <div class="btn-row">
                <button class="btn btn-blue" onclick="triggerAction('/trigger_download', this)">📩 Manual Download</button>
                <button class="btn btn-orange" onclick="triggerAction('/trigger_download_force', this)">🔥 Force Sync</button>
            </div>
        </div>

        <!-- Pending Save Confirmation Cards (hidden by default) -->
        <div id="pending-ledger" class="card pending-save-card" style="display:none;">
            <h2>⏳ 원장 저장 확인 필요</h2>
            <div class="status-box">
                <div><span class="label">대기 파일:</span><span class="val" id="pending-ledger-files">-</span></div>
                <div><span class="label">대기 시간:</span><span class="val" id="pending-ledger-time">-</span></div>
            </div>
            <p style="color:#ffd93d; margin:10px 0;">ERP에서 저장(F8) 버튼을 클릭했는지 확인하세요</p>
            <div class="btn-row">
                <button class="btn btn-green" onclick="confirmSave('ledger')">✅ 저장 완료</button>
                <button class="btn btn-red" onclick="markFailed('ledger')">❌ 저장 실패</button>
            </div>
        </div>

        <div id="pending-estimate" class="card pending-save-card" style="display:none;">
            <h2>⏳ 견적 저장 확인 필요</h2>
            <div class="status-box">
                <div><span class="label">대기 파일:</span><span class="val" id="pending-estimate-files">-</span></div>
                <div><span class="label">대기 시간:</span><span class="val" id="pending-estimate-time">-</span></div>
            </div>
            <p style="color:#ffd93d; margin:10px 0;">ERP에서 저장(F8) 버튼을 클릭했는지 확인하세요</p>
            <div class="btn-row">
                <button class="btn btn-green" onclick="confirmSave('estimate')">✅ 저장 완료</button>
                <button class="btn btn-red" onclick="markFailed('estimate')">❌ 저장 실패</button>
            </div>
        </div>

        <div class="card">
            <h2>📦 Purchase Order (원장)</h2>
            <div class="status-box">
                <div><span class="label">Pending (READY):</span><span class="val pending-count" id="l-pending">0</span> items</div>
                <div><span class="label">Total History:</span><span class="val" id="l-history">0</span> processed</div>
                <div id="l-metrics-row" style="display:none; flex-wrap: wrap; gap: 15px; margin-top: 10px; border-top: 1px solid #0f3460; padding-top: 10px; font-size: 0.8em;">
                    <div><span class="label">Today Downloaded:</span><span class="val" id="l-today-dl">0</span></div>
                    <div><span class="label">Ready:</span><span class="val" id="l-ready">0</span></div>
                    <div><span class="label">Uploaded Today:</span><span class="val" id="l-today-up">0</span></div>
                    <div><span class="label">Failed:</span><span class="val" id="l-failed">0</span></div>
                </div>
            </div>
            <button id="btn-l" class="btn btn-blue" onclick="triggerAction('/trigger_ledger', this)" disabled>⬆ Upload Ledger</button>
        </div>

        <div class="card">
            <h2>📋 Sales Estimate (견적)</h2>
            <div class="status-box">
                <div><span class="label">Pending (READY):</span><span class="val pending-count" id="e-pending">0</span> items</div>
                <div><span class="label">Total History:</span><span class="val" id="e-history">0</span> processed</div>
                <div id="e-metrics-row" style="display:none; flex-wrap: wrap; gap: 15px; margin-top: 10px; border-top: 1px solid #0f3460; padding-top: 10px; font-size: 0.8em;">
                    <div><span class="label">Today Downloaded:</span><span class="val" id="e-today-dl">0</span></div>
                    <div><span class="label">Ready:</span><span class="val" id="e-ready">0</span></div>
                    <div><span class="label">Uploaded Today:</span><span class="val" id="e-today-up">0</span></div>
                    <div><span class="label">Failed:</span><span class="val" id="e-failed">0</span></div>
                </div>
            </div>
            <button id="btn-e" class="btn btn-orange" onclick="triggerAction('/trigger_estimate', this)" disabled>⬆ Upload Estimate</button>
        </div>

        <div class="card">
            <h2>⚙️ Server Control</h2>
            <button class="btn btn-gray" onclick="triggerAction('/reset_status', this)">🔄 Reset All Status</button>
        </div>

        <div class="footer">
            Shop Automation V10 | Distributed Lock System | &copy; 2026 Antigravity
        </div>
    </div>
</body>
</html>
"""

SHEET_HUB_TEMPLATE = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <title>V10 Sheet Hub Dashboard</title>
    <style>
        :root {
            --bg: #08131a;
            --panel: #0f2230;
            --line: #27556d;
            --text: #f2f7fb;
            --muted: #9ab4c4;
            --accent: #4dd0e1;
            --ok: #4fd18b;
            --warn: #f5c451;
            --danger: #ff7d6b;
        }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 24px; background: radial-gradient(circle at top, #143247 0%, var(--bg) 55%); color: var(--text); font-family: "Segoe UI", sans-serif; }
        .container { max-width: 960px; margin: 0 auto; }
        .header { margin-bottom: 18px; }
        h1 { margin: 0; color: var(--accent); }
        .sub { margin-top: 6px; color: var(--muted); }
        .card { margin-bottom: 18px; padding: 22px; background: linear-gradient(180deg, rgba(21,56,75,.96), rgba(15,34,48,.98)); border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 14px 40px rgba(0,0,0,.22); }
        .card h2 { margin: 0 0 14px; font-size: 18px; color: var(--accent); }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 14px; }
        .status-box { padding: 14px; background: rgba(6,19,26,.55); border: 1px solid rgba(77,208,225,.14); border-radius: 12px; }
        .label { color: var(--muted); margin-right: 8px; }
        .val-ok { color: var(--ok); }
        .val-warn { color: var(--warn); }
        .val-error { color: var(--danger); }
        .btn-row { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
        .btn { flex: 1; min-width: 120px; border: 0; border-radius: 12px; padding: 13px 16px; color: white; font-size: 14px; font-weight: 700; cursor: pointer; transition: transform .15s ease, opacity .15s ease; }
        .btn:hover:not(:disabled) { transform: translateY(-1px); }
        .btn:disabled { opacity: .45; cursor: not-allowed; }
        .btn-blue { background: linear-gradient(135deg, #00a7c2, #1976d2); }
        .btn-orange { background: linear-gradient(135deg, #ff8f3d, #f45d48); }
        .btn-green { background: linear-gradient(135deg, #12b77c, #42d392); }
        .btn-gray { background: linear-gradient(135deg, #4c6a79, #31454f); }
        .notice { margin-bottom: 16px; padding: 14px 16px; border-radius: 12px; display: none; font-weight: 700; }
        .notice.warn { background: rgba(245,196,81,.18); border: 1px solid rgba(245,196,81,.5); color: #ffe7a4; }
        .notice.error { background: rgba(255,125,107,.14); border: 1px solid rgba(255,125,107,.5); color: #ffd0c8; }
        .mini { margin-top: 10px; color: var(--muted); font-size: 13px; }
        .footer { text-align: center; color: #7f95a3; font-size: 12px; margin-top: 28px; }
        @media (max-width: 760px) {
            body { padding: 16px; }
            .grid { grid-template-columns: 1fr; }
            .btn { min-width: 100%; }
        }
    </style>
    <script>
        async function postJson(url, body) {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : null
            });
            const payload = await response.json();
            if (!response.ok || payload.status === 'error') {
                throw new Error(payload.message || '요청 처리 중 오류가 발생했습니다.');
            }
            return payload;
        }

        function setButtonBusy(btn, busyText) {
            btn.dataset.originalText = btn.dataset.originalText || btn.innerText;
            btn.innerText = busyText;
            btn.disabled = true;
        }

        function restoreButton(btn) {
            if (btn.dataset.originalText) {
                btn.innerText = btn.dataset.originalText;
            }
        }

        async function triggerAction(url, btn, body) {
            setButtonBusy(btn, '처리중...');
            try {
                const payload = await postJson(url, body);
                if (payload.message) {
                    showNotice(payload.message, 'warn');
                }
                await updateStats();
            } catch (error) {
                showNotice(error.message, 'error');
            } finally {
                restoreButton(btn);
            }
        }

        function statusText(ok, okText, failText) {
            return `<span class="${ok ? 'val-ok' : 'val-error'}">${ok ? okText : failText}</span>`;
        }

        function showNotice(text, tone) {
            const notice = document.getElementById('notice');
            notice.innerText = text;
            notice.className = `notice ${tone}`;
            notice.style.display = 'block';
        }

        function hideNotice() {
            const notice = document.getElementById('notice');
            notice.style.display = 'none';
        }

        function updateUploadCard(type, stats, uploadState, hubState) {
            const prefix = type === 'ledger' ? 'l' : 'e';
            document.getElementById(`${prefix}-pending`).innerText = stats.pending[type];
            document.getElementById(`${prefix}-history`).innerText = stats.history_count[type];
            document.getElementById(`${prefix}-ready`).innerText = stats.metrics[type].ready_to_upload;
            document.getElementById(`${prefix}-copied`).innerText = uploadState.pending_files.length;

            const copyBtn = document.getElementById(`btn-${prefix}-copy`);
            const completeBtn = document.getElementById(`btn-${prefix}-complete`);
            const isRunning = uploadState.status === 'running';
            const isAwaitingComplete = uploadState.status === 'pending_save';
            const lockedByOther = hubState.locked && !hubState.locked_by_me;
            const hasPending = stats.pending[type] > 0;

            copyBtn.disabled = isRunning || isAwaitingComplete || lockedByOther || !hasPending;
            completeBtn.disabled = !isAwaitingComplete;

            copyBtn.innerText = isRunning
                ? '복사 준비중...'
                : lockedByOther
                    ? '다른 처리자 사용중'
                    : hasPending
                        ? `복사 (${stats.pending[type]}건)`
                        : '복사할 항목 없음';

            completeBtn.innerText = isAwaitingComplete ? '완료' : '완료 대기중';
        }

        async function updateStats() {
            try {
                const [statsRes, healthRes, uploadRes, hubRes] = await Promise.all([
                    fetch('/api/stats'),
                    fetch('/api/health'),
                    fetch('/api/upload_state'),
                    fetch('/api/hub_status')
                ]);

                const stats = await statsRes.json();
                const health = await healthRes.json();
                const uploadState = await uploadRes.json();
                const hubState = await hubRes.json();

                document.getElementById('machine-id').innerText = hubState.machine_id || stats.status.machine_id || 'local';
                document.getElementById('hub-status').innerHTML = hubState.locked
                    ? `<span class="val-warn">${hubState.status}</span>`
                    : `<span class="val-ok">${hubState.status}</span>`;
                document.getElementById('hub-processor').innerText = hubState.processor || '-';
                document.getElementById('hub-started').innerText = hubState.started_at || '-';
                document.getElementById('hub-doc-type').innerText = hubState.doc_type || '-';
                document.getElementById('hub-files').innerText = hubState.file_names || '-';
                document.getElementById('hub-archived').innerText = hubState.archived_at || '-';

                document.getElementById('health-browser').innerHTML = statusText(health.browser_healthy, '연결됨', '연결 안됨');
                document.getElementById('health-login').innerHTML = statusText(health.youngrim_logged_in === true, '로그인됨', health.youngrim_logged_in === false ? '로그인 필요' : '확인 안됨');
                document.getElementById('health-stuck').innerHTML = statusText(!health.downloader_stuck, '정상', '응답 없음');
                document.getElementById('health-uptime').innerText = `${Math.floor(health.uptime_seconds / 60)}분`;
                document.getElementById('dl-status').innerText = stats.status.downloader_status;
                document.getElementById('dl-last').innerText = stats.status.downloader_last_run || '-';

                updateUploadCard('ledger', stats, uploadState.ledger, hubState);
                updateUploadCard('estimate', stats, uploadState.estimate, hubState);

                if (!health.browser_healthy) {
                    showNotice('브라우저 연결이 끊어져 있습니다. Edge 디버그 브라우저 상태를 확인해 주세요.', 'error');
                } else if (health.youngrim_logged_in === false) {
                    showNotice('영림 OMS 로그인이 필요합니다.', 'warn');
                } else if (hubState.locked && !hubState.locked_by_me) {
                    showNotice(`시트 허브 사용중: ${hubState.processor}`, 'warn');
                } else {
                    hideNotice();
                }
            } catch (error) {
                showNotice(`상태 갱신 실패: ${error.message}`, 'error');
            }
        }

        setInterval(updateStats, 3000);
        window.onload = updateStats;
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>V10 Google Sheet Hub</h1>
            <div class="sub">ERP 자동업로드 대신 Sheet1 / Sheet2 / Sheet3 허브 흐름으로 동작합니다.</div>
            <div class="sub">처리자: <span id="machine-id">-</span></div>
        </div>

        <div id="notice" class="notice warn"></div>

        <div class="card">
            <h2>시트 허브 상태</h2>
            <div class="grid">
                <div class="status-box"><span class="label">상태</span><span id="hub-status">-</span></div>
                <div class="status-box"><span class="label">처리자</span><span id="hub-processor">-</span></div>
                <div class="status-box"><span class="label">처리시작시간</span><span id="hub-started">-</span></div>
                <div class="status-box"><span class="label">문서종류</span><span id="hub-doc-type">-</span></div>
                <div class="status-box"><span class="label">파일명</span><span id="hub-files">-</span></div>
                <div class="status-box"><span class="label">시트2 이동시간</span><span id="hub-archived">-</span></div>
            </div>
            <div class="mini">처리중 상태가 1분 이상 유지되면 자동으로 락이 풀립니다.</div>
        </div>

        <div class="card">
            <h2>시스템 상태</h2>
            <div class="grid">
                <div class="status-box"><span class="label">브라우저</span><span id="health-browser">-</span></div>
                <div class="status-box"><span class="label">영림 로그인</span><span id="health-login">-</span></div>
                <div class="status-box"><span class="label">다운로더</span><span id="health-stuck">-</span></div>
                <div class="status-box"><span class="label">가동시간</span><span id="health-uptime">-</span></div>
            </div>
            <div class="btn-row">
                <button class="btn btn-gray" onclick="triggerAction('/check_login', this)">로그인 확인</button>
                <button class="btn btn-gray" onclick="triggerAction('/restart_downloader', this)">다운로더 재시작</button>
            </div>
        </div>

        <div class="card">
            <h2>자동 다운로드</h2>
            <div class="grid">
                <div class="status-box"><span class="label">상태</span><span id="dl-status">-</span></div>
                <div class="status-box"><span class="label">마지막 실행</span><span id="dl-last">-</span></div>
            </div>
            <div class="btn-row">
                <button class="btn btn-blue" onclick="triggerAction('/trigger_download', this)">수동 다운로드</button>
                <button class="btn btn-orange" onclick="triggerAction('/trigger_download_force', this)">강제 동기화</button>
            </div>
        </div>

        <div class="card">
            <h2>Ledger 허브</h2>
            <div class="grid">
                <div class="status-box"><span class="label">READY</span><span id="l-pending">0</span></div>
                <div class="status-box"><span class="label">완료 이력</span><span id="l-history">0</span></div>
                <div class="status-box"><span class="label">시트 대상</span><span id="l-ready">0</span></div>
                <div class="status-box"><span class="label">대기 완료건</span><span id="l-copied">0</span></div>
            </div>
            <div class="btn-row">
                <button id="btn-l-copy" class="btn btn-blue" onclick="triggerAction('/sheet_hub/copy/ledger', this)">복사</button>
                <button id="btn-l-complete" class="btn btn-green" onclick="triggerAction('/sheet_hub/complete', this, { type: 'ledger' })">완료</button>
            </div>
        </div>

        <div class="card">
            <h2>Estimate 허브</h2>
            <div class="grid">
                <div class="status-box"><span class="label">READY</span><span id="e-pending">0</span></div>
                <div class="status-box"><span class="label">완료 이력</span><span id="e-history">0</span></div>
                <div class="status-box"><span class="label">시트 대상</span><span id="e-ready">0</span></div>
                <div class="status-box"><span class="label">대기 완료건</span><span id="e-copied">0</span></div>
            </div>
            <div class="btn-row">
                <button id="btn-e-copy" class="btn btn-orange" onclick="triggerAction('/sheet_hub/copy/estimate', this)">복사</button>
                <button id="btn-e-complete" class="btn btn-green" onclick="triggerAction('/sheet_hub/complete', this, { type: 'estimate' })">완료</button>
            </div>
        </div>

        <div class="card">
            <h2>서버 제어</h2>
            <button class="btn btn-gray" onclick="triggerAction('/reset_status', this)">상태 초기화</button>
        </div>

        <div class="footer">Shop Automation V10 | Google Sheet Hub | 2026</div>
    </div>
</body>
</html>
"""

class DoorBrowser:
    """Browser controller for scraping"""
    def __init__(self):
        self.driver = None
        self.last_health_check = None
        self.youngrim_login_status = None

    def is_healthy(self) -> bool:
        """Check if browser connection is alive and responsive"""
        try:
            if not self.driver:
                return False
            # Test connection with simple operation
            _ = self.driver.current_url
            self.last_health_check = datetime.datetime.now().isoformat()
            return True
        except Exception as e:
            logger.warning(f"[Browser] Health check failed: {e}")
            return False

    def ensure_connection(self) -> bool:
        """Ensure browser is connected, attempt recovery if not"""
        if self.is_healthy():
            return True

        logger.info("[Browser] Connection lost, attempting recovery...")
        self.driver = None
        try:
            self.launch()
            return True
        except Exception as e:
            logger.error(f"[Browser] Recovery failed: {e}")
            return False

    def check_youngrim_login(self) -> bool:
        """Check if currently logged into Youngrim OMS"""
        try:
            if not self.is_healthy():
                self.youngrim_login_status = False
                return False

            # Navigate to main page
            self.driver.get(config.YOUNGRIM_URL)
            time.sleep(2)

            current_url = self.driver.current_url

            # Check for login form elements (indicates NOT logged in)
            login_indicators = self.driver.find_elements(By.CSS_SELECTOR,
                "input[name='user_id'], input[name='password'], form[action*='login']")

            if login_indicators:
                logger.warning("[Browser] Youngrim login required - login form detected")
                self.youngrim_login_status = False
                return False

            # Check for logged-in indicators (menu, navigation, etc.)
            logged_in_indicators = self.driver.find_elements(By.CSS_SELECTOR,
                ".logout, .gnb, .lnb, #menu, .user-info, a[href*='logout']")

            if logged_in_indicators:
                logger.info("[Browser] Youngrim login confirmed")
                self.youngrim_login_status = True
                return True

            # If neither found, assume logged in (some pages don't have these elements)
            logger.info("[Browser] Youngrim login status uncertain - assuming logged in")
            self.youngrim_login_status = True
            return True

        except Exception as e:
            logger.warning(f"[Browser] Youngrim login check failed: {e}")
            self.youngrim_login_status = False
            return False

    def launch(self):
        if self.driver:
            try:
                self.driver.current_url
                return
            except:
                self.driver = None

        logger.info("[Browser] Launching Microsoft Edge Browser...")

        debug_port = config.BROWSER_DEBUG_PORT

        # 기존에 열려있는 Edge 브라우저 사용 (포트 9333)
        logger.info(f"[Browser] Connecting to existing Edge browser on port {debug_port}")
        logger.info("[Browser] Make sure Edge is running with: start_edge_debug.ps1")

        # 포트가 열려있는지 간단히 체크
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('127.0.0.1', debug_port))
        sock.close()

        if result != 0:
            logger.info(f"[Browser] Edge is not running on port {debug_port}. Attempting auto-launch...")
            try:
                # start_edge_debug.bat을 새로운 콘솔창에서 비동기로 실행
                subprocess.Popen(["cmd", "/c", "start_edge_debug.bat"], 
                                 creationflags=subprocess.CREATE_NEW_CONSOLE)
                logger.info("[Browser] Waiting for Edge to initialize (5s)...")
                time.sleep(5)
                
                # 포트 재점검
                sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                result = sock.connect_ex(('127.0.0.1', debug_port))
                sock.close()
                
                if result != 0:
                    raise ConnectionError(f"Edge failed to start on port {debug_port} after auto-launch attempt.")
            except Exception as e:
                error_msg = f"[Browser] Auto-launch failed: {e}"
                logger.error(error_msg)
                raise ConnectionError(error_msg)

        logger.info(f"[Browser] Edge detected on port {debug_port}")
        time.sleep(2)

        # EdgeDriver로 Edge에 연결 (Selenium 자동 관리)
        edge_options = EdgeOptions()
        edge_options.add_experimental_option("debuggerAddress", f"127.0.0.1:{debug_port}")

        print("[Browser] Connecting EdgeDriver to Edge...")
        try:
            # Selenium 4는 자동으로 적절한 드라이버를 찾아서 사용
            self.driver = webdriver.Edge(options=edge_options)
            print("[OK] Browser Connected Successfully")
            logger.info(f"[Browser] Connected to Edge browser")
        except Exception as e:
            print(f"[Error] Failed to connect: {e}")
            logger.error(f"[Browser] Connection failed: {e}")
            raise e

    def get_source(self):
        return self.driver.page_source

    def navigate(self, url):
        self.driver.get(url)

browser_manager = DoorBrowser()

def load_history():
    """Load history with ledger/estimate separation"""
    default_history = {"ledger": [], "estimate": []}
    if os.path.exists(config.HISTORY_FILE):
        try:
            with open(config.HISTORY_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Handle legacy format (list)
                if isinstance(data, list):
                    return {"ledger": data, "estimate": []}
                return data
        except:
            return default_history
    return default_history

def save_history(history_dict):
    try:
        with open(config.HISTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(history_dict, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"[History] Failed to save history: {e}")


def collect_pending_data(doc_type):
    """Collect READY files and convert them into ERP row bundles for Sheet Hub."""
    doc_dir = config.DOWNLOADS_DIR / doc_type
    html_files = list(doc_dir.glob("*.html")) + list(doc_dir.glob("*.mhtml"))
    pending_keys = set(state_manager.get_keys_by_status(doc_type, state_manager.STATUS_READY))

    rows = []
    processed_files = []

    for html_file in html_files:
        order_id = html_file.stem
        if order_id not in pending_keys:
            continue

        logger.info(f"[SheetHub] Parsing {doc_type} file: {html_file.name}")
        try:
            with open(html_file, 'r', encoding='utf-8') as handle:
                html_content = handle.read()

            erp_data = local_file_processor.process_html_content(
                html_content,
                file_path_hint=html_file.name,
                target_type=doc_type,
            )

            if erp_data:
                rows.extend(erp_data)
                processed_files.append(order_id)
            else:
                logger.warning(f"[SheetHub] No ERP rows extracted from {order_id}")
        except Exception as exc:
            logger.error(f"[SheetHub] Failed to parse {order_id}: {exc}")

    return rows, processed_files


def finalize_sheet_hub_upload(doc_type):
    """Mark pending files as completed locally after the operator finishes Sheet Hub work."""
    history = load_history()
    pending_files = list(upload_state[doc_type]["pending_files"])

    for file_id in pending_files:
        state_manager.update_state(doc_type, file_id, state_manager.STATUS_COMPLETED)
        if file_id not in history.get(doc_type, []):
            history[doc_type].append(file_id)

    save_history(history)
    sheet_hub.complete()

    upload_state[doc_type]["status"] = "idle"
    upload_state[doc_type]["last_completed"] = datetime.datetime.now().isoformat()
    upload_state[doc_type]["pending_files"] = []
    upload_state[doc_type]["pending_since"] = None

    return len(pending_files)

class AutoDownloader(threading.Thread):
    """Background thread to download files from both ledger and estimate pages"""
    def __init__(self):
        super().__init__()
        self.running = True
        self.active_mode = False
        self.daemon = True
        self.last_heartbeat = time.time()
        self.consecutive_errors = 0
        self.max_consecutive_errors = 5  # Auto-reset after 5 consecutive errors

    def activate(self):
        self.active_mode = True

    def update_heartbeat(self):
        """Update heartbeat timestamp"""
        self.last_heartbeat = time.time()

    def is_stuck(self) -> bool:
        """Check if downloader is stuck (no heartbeat for 10+ minutes while running)"""
        if server_status["downloader_status"] != "Running":
            return False
        elapsed = time.time() - self.last_heartbeat
        return elapsed > 600  # 10 minutes

    def run(self):
        logger.info("[Downloader] Thread Initiated. Waiting for start command...")
        while self.running:
            if self.active_mode:
                self.update_heartbeat()
                try:
                    self.download_cycle()
                    self.consecutive_errors = 0  # Reset error count on success
                except Exception as e:
                    self.consecutive_errors += 1
                    error_handler.handle(e, context={"thread": "Downloader", "consecutive_errors": self.consecutive_errors}, severity=ErrorSeverity.HIGH)
                    server_status["last_error"] = f"{datetime.datetime.now().strftime('%H:%M:%S')} - {str(e)[:100]}"

                    # Auto-recovery after too many consecutive errors
                    if self.consecutive_errors >= self.max_consecutive_errors:
                        logger.warning(f"[Downloader] Too many consecutive errors ({self.consecutive_errors}). Attempting auto-recovery...")
                        self._attempt_recovery()

                # Intelligent Wait based on empty cycles
                wait_sec = config.DOWNLOAD_INTERVAL_SEC
                if server_status["empty_cycle_count"] >= 5:
                    wait_sec = min(wait_sec * 2, 7200)  # Max 2 hours
                    logger.info(f"[Downloader] Consecutive empty cycles detected ({server_status['empty_cycle_count']}). Extending wait to {wait_sec//60} min.")

                # Wait loop with termination check and heartbeat updates
                for _ in range(max(1, wait_sec // 5)):
                    if not self.running or not self.active_mode:
                        break
                    self.update_heartbeat()  # Keep heartbeat alive during wait
                    time.sleep(5)
            else:
                time.sleep(2)

    def _attempt_recovery(self):
        """Attempt to recover from consecutive errors"""
        try:
            logger.warning("[Downloader] Running aggressive recovery...")
            
            # 1. Force close any browser processes on debug port
            cleanup_port(config.BROWSER_DEBUG_PORT)
            
            # 2. Reset browser connection
            browser_manager.driver = None
            time.sleep(5)

            # 3. Reset status
            server_status["downloader_status"] = "Idle"
            server_status["last_error"] = None
            self.consecutive_errors = 0

            logger.info("[Downloader] Aggressive auto-recovery completed")
        except Exception as e:
            logger.error(f"[Downloader] Auto-recovery failed: {e}")

    def download_cycle(self, force_mode=False):
        server_status["downloader_status"] = "Running"
        server_status["downloader_last_run"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.update_heartbeat()

        try:
            logger.info(f"[Downloader] Starting cycle (Force Mode: {force_mode})...")

            # 1. Ensure browser connection (with auto-recovery)
            with browser_lock:
                if not browser_manager.ensure_connection():
                    raise ConnectionError("Failed to establish browser connection")

            server_status["browser_healthy"] = True

            logger.info(f"[Downloader] Navigating to {config.YOUNGRIM_URL} to ensure session...")
            with browser_lock:
                browser_manager.navigate(config.YOUNGRIM_URL)
                time.sleep(3)

            # 2. Download from Ledger Lists (multiple pages: 산업/임업)
            l_new = 0
            logger.info("[Downloader] Ledger download is disabled. Skipping ledger pages.")
            # Legacy ledger download flow retained for rollback/reference only.
            # logger.info("[Downloader] Processing Ledger Lists...")
            # for idx, ledger_url in enumerate(config.YOUNGRIM_LEDGER_URLS, 1):
            #     logger.info(f"[Downloader] Processing Ledger page {idx}/{len(config.YOUNGRIM_LEDGER_URLS)}")
            #     l_new += self.download_from_page(ledger_url, config.DOWNLOADS_DIR / "ledger", "ledger", force_mode=force_mode)

            # 3. Download from Estimate Lists (multiple pages: 산업/임업)
            logger.info("[Downloader] Processing Estimate Lists...")
            e_new = 0
            for idx, estimate_url in enumerate(config.YOUNGRIM_ESTIMATE_URLS, 1):
                logger.info(f"[Downloader] Processing Estimate page {idx}/{len(config.YOUNGRIM_ESTIMATE_URLS)}")
                e_new += self.download_from_page(estimate_url, config.DOWNLOADS_DIR / "estimate", "estimate", force_mode=force_mode)

            if l_new == 0 and e_new == 0:
                server_status["empty_cycle_count"] += 1
                logger.info("[Downloader] No new files downloaded this cycle.")
            else:
                server_status["empty_cycle_count"] = 0
                logger.info(f"[Downloader] Downloaded {e_new} estimate files. Ledger download is disabled.")
        
        except RetryExhaustedError as e:
            logger.error(f"[V10] Critical Lock Manager failure: {e}")
            logger.warning("[V10] Switching to STANDALONE mode for this machine due to persistent API errors")
            config.ENABLE_DISTRIBUTED_LOCK = False
            server_status["lock_manager_connected"] = False
            server_status["last_error"] = "Lock Manager Error - Switched to Standalone"
        except Exception as e:
            logger.error(f"[Downloader] Cycle failed: {e}")
            raise e
        finally:
            server_status["downloader_status"] = "Idle"
            logger.info("[Downloader] Cycle complete. Waiting for next interval.")

    def download_from_page(self, list_url, save_dir, doc_type, force_mode=False):
        """
        V10: Enhanced with distributed lock checking and Force Mode

        Args:
            list_url: URL of the list page
            save_dir: Directory to save downloads
            doc_type: 'ledger' or 'estimate'
            force_mode: If True, bypass history and lock checks
        """
        logger.info(f"[Downloader] Fetching page: {list_url}")
        with browser_lock:
            browser_manager.navigate(list_url)
            time.sleep(2)

        html_source = browser_manager.get_source()

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html_source, 'html.parser')

        rows = soup.select("table tbody tr")
        logger.info(f"[Downloader] Found {len(rows)} rows in table")

        history = load_history()
        downloaded_count = 0

        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 3:
                continue

            order_no = cols[0].get_text(strip=True)

            if not order_no or order_no == "":
                continue

                # V10: Check v10_state.json BEFORE checking local history
                # SKIP if already completed or locked
                state_keys = state_manager.get_keys_by_status(doc_type, state_manager.STATUS_COMPLETED)
                if order_no in state_keys or any(k.startswith(order_no) for k in state_keys):
                    logger.info(f"[Downloader] {order_no} already completed in state - skipping")
                    continue

                # Only use distributed lock if enabled
                if config.ENABLE_DISTRIBUTED_LOCK:
                    if not distributed_lock.acquire_lock(order_no, notes=f"Download attempt from {doc_type}"):
                        logger.info(f"[V10] Order {order_no} is locked by another machine or already completed - skipping")
                        continue

                # Check local history (backward compatibility - still skip if in v10_history)
                if order_no in history.get(doc_type, []):
                    logger.info(f"[Downloader] {order_no} already in local history - skipping")
                    # No need to update state manager here as it might be an old entry
                    # Release lock since we're skipping (only if distributed lock enabled)
                    if config.ENABLE_DISTRIBUTED_LOCK:
                        distributed_lock.release_lock(order_no, status=DistributedLockManager.STATUS_COMPLETED,
                                                    notes="Already in local history")
                    continue
            else:
                logger.info(f"[Downloader] FORCE MODE: Bypassing checks for {order_no}")

            try:
                # Find download button (버튼은 마지막 컬럼에 있음)
                button_col = cols[-1] if len(cols) > 0 else None
                if not button_col:
                    logger.warning(f"[Downloader] No button column for {order_no}")
                    if config.ENABLE_DISTRIBUTED_LOCK:
                        distributed_lock.release_lock(order_no, status=DistributedLockManager.STATUS_FAILED,
                                                    notes="No button column")
                    continue

                # 버튼 찾기: trans_link (ledger) 또는 estimate_link (estimate)
                button = button_col.find("button", class_="trans_link")
                button_type = "ledger"
                button_attr = "chulhano"

                if not button:
                    # estimate_link 클래스 버튼 시도
                    button = button_col.find("button", class_="estimate_link")
                    button_type = "estimate"
                    button_attr = "ordno"

                if not button:
                    # 디버깅: 버튼 컬럼의 HTML 구조 로그
                    logger.warning(f"[Downloader] No button found for {order_no}")
                    logger.warning(f"[DEBUG] Button column HTML: {button_col}")
                    logger.warning(f"[DEBUG] All buttons in column: {button_col.find_all('button')}")
                    if config.ENABLE_DISTRIBUTED_LOCK:
                        distributed_lock.release_lock(order_no, status=DistributedLockManager.STATUS_FAILED,
                                                    notes="No download button")
                    continue

                # 버튼 속성에서 번호 가져오기 (chulhano for ledger, ordno for estimate)
                button_id = button.get(button_attr, "")
                if not button_id:
                    logger.warning(f"[Downloader] No {button_attr} attribute for {order_no}")
                    if config.ENABLE_DISTRIBUTED_LOCK:
                        distributed_lock.release_lock(order_no, status=DistributedLockManager.STATUS_FAILED,
                                                    notes=f"No {button_attr}")
                    continue

                logger.info(f"[Downloader] Downloading {button_type} for {order_no} ({button_attr}={button_id})")

                # URL에서 younglim_gubun 파라미터 추출
                from urllib.parse import urlparse, parse_qs
                parsed = urlparse(list_url)
                params = parse_qs(parsed.query)
                younglim_gubun = params.get('younglim_gubun', [''])[0]

                # 직접 URL 네비게이션으로 상세 페이지 다운로드 (팝업 차단 문제 회피)
                try:
                    # 현재 URL 저장 (목록 페이지)
                    original_url = browser_manager.driver.current_url

                    # 상세 페이지 URL 구성
                    if button_type == "ledger":
                        detail_url = f"http://door.yl.co.kr/oms/trans_doc.jsp?chulhano={button_id}&younglim_gubun={younglim_gubun}"
                    else:  # estimate
                        detail_url = f"http://door.yl.co.kr/oms/estimate_doc.jsp?ordno={button_id}&younglim_gubun={younglim_gubun}"

                    # 상세 페이지로 직접 이동
                    logger.info(f"[Downloader] Navigating to detail page: {detail_url}")
                    with browser_lock:
                        browser_manager.driver.get(detail_url)
                        time.sleep(3)

                        # 상세 페이지 HTML 가져오기
                        detail_html = browser_manager.get_source()
                        logger.info(f"[Downloader] Retrieved detail page HTML ({len(detail_html)} bytes)")

                        # 목록 페이지로 복귀
                        browser_manager.driver.get(original_url)
                        time.sleep(2)
                    logger.info(f"[Downloader] Returned to list page")

                except Exception as nav_error:
                    logger.error(f"[Downloader] Error navigating for {order_no}: {nav_error}")
                    if config.ENABLE_DISTRIBUTED_LOCK:
                        distributed_lock.release_lock(order_no, status=DistributedLockManager.STATUS_FAILED,
                                                    notes=f"Navigation error: {str(nav_error)[:100]}")
                    # 목록 페이지로 복귀 시도
                    try:
                        browser_manager.driver.get(list_url)
                        time.sleep(2)
                    except:
                        pass
                    continue

                # Save to file
                # V10: Unique filename using order_no and button_id
                filename = f"{order_no}_{button_id}.html"
                filepath = save_dir / filename

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(detail_html)

                logger.info(f"[Downloader] ✅ Saved {filepath}")

                # Add to local state (DOWNLOADED)
                # Use UNIQUE key for history in unique filename mode
                history_key = f"{order_no}_{button_id}"
                state_manager.update_state(doc_type, history_key, state_manager.STATUS_DOWNLOADED)

                # Parsing Success -> READY
                # Try simple validation to move to READY
                try:
                    if len(detail_html) > 1000: # Basic check if HTML is retrieved
                        state_manager.update_state(doc_type, history_key, state_manager.STATUS_READY)
                    else:
                        state_manager.update_state(doc_type, history_key, state_manager.STATUS_FAILED, error_msg="HTML context too small")
                except Exception as parse_e:
                    logger.error(f"[Downloader] Parsing error for {history_key}: {parse_e}")
                    state_manager.update_state(doc_type, history_key, state_manager.STATUS_FAILED, error_msg=str(parse_e))

                # V10: Update lock status to completed (only if distributed lock enabled)
                # Use same order_no for lock (distributed lock uses order_no as ID)
                if config.ENABLE_DISTRIBUTED_LOCK:
                    distributed_lock.release_lock(order_no, status=DistributedLockManager.STATUS_COMPLETED,
                                                notes=f"Download successful (ID: {button_id})")

                downloaded_count += 1

            except Exception as e:
                logger.error(f"[Downloader] Error downloading {order_no}: {e}")
                # V10: Mark as failed in distributed lock (only if enabled)
                if config.ENABLE_DISTRIBUTED_LOCK:
                    distributed_lock.release_lock(order_id=order_no, status=DistributedLockManager.STATUS_FAILED,
                                                notes=f"Download error: {str(e)[:100]}")
                continue

        return downloaded_count

# Flask Routes
@app.route('/')
def index():
    return render_template_string(SHEET_HUB_TEMPLATE)

@app.route('/api/stats')
def get_stats():
    history = load_history()

    ledger_files = list((config.DOWNLOADS_DIR / "ledger").glob("*.html")) + \
                   list((config.DOWNLOADS_DIR / "ledger").glob("*.mhtml"))
    estimate_files = list((config.DOWNLOADS_DIR / "estimate").glob("*.html")) + \
                     list((config.DOWNLOADS_DIR / "estimate").glob("*.mhtml"))

    ledger_ids = {f.stem for f in ledger_files}
    estimate_ids = {f.stem for f in estimate_files}

    ledger_history_set = set(history.get("ledger", []))
    estimate_history_set = set(history.get("estimate", []))

    # Calculate pending based on READY status
    ledger_pending_keys = state_manager.get_keys_by_status("ledger", state_manager.STATUS_READY)
    estimate_pending_keys = state_manager.get_keys_by_status("estimate", state_manager.STATUS_READY)

    # Metrics for Dashboard
    metrics = {
        "ledger": {
            "today_downloaded": state_manager.get_total_downloaded_today("ledger"),
            "ready_to_upload": len(ledger_pending_keys),
            "uploaded_today": state_manager.get_count_by_status("ledger", state_manager.STATUS_COMPLETED, today_only=True),
            "failed": state_manager.get_count_by_status("ledger", state_manager.STATUS_FAILED)
        },
        "estimate": {
            "today_downloaded": state_manager.get_total_downloaded_today("estimate"),
            "ready_to_upload": len(estimate_pending_keys),
            "uploaded_today": state_manager.get_count_by_status("estimate", state_manager.STATUS_COMPLETED, today_only=True),
            "failed": state_manager.get_count_by_status("estimate", state_manager.STATUS_FAILED)
        }
    }

    return jsonify({
        "status": server_status,
        "pending": {
            "ledger": len(ledger_pending_keys),
            "estimate": len(estimate_pending_keys)
        },
        "history_count": {
            "ledger": state_manager.get_count_by_status("ledger", state_manager.STATUS_COMPLETED),
            "estimate": state_manager.get_count_by_status("estimate", state_manager.STATUS_COMPLETED)
        },
        "metrics": metrics
    })

@app.route('/trigger_ledger', methods=['POST'])
def trigger_ledger_upload():
    """Trigger ledger upload with lock awareness and pending_save state"""
    return sheet_hub_copy("ledger")

    if not ledger_lock.acquire(blocking=False):
        return jsonify({"status": "error", "message": "Ledger upload already running"}), 409

    # Check if already in pending_save state
    if upload_state["ledger"]["status"] == "pending_save":
        ledger_lock.release()
        return jsonify({"status": "error", "message": "이전 업로드 저장 확인이 필요합니다"}), 409

    try:
        server_status["ledger_uploader_status"] = "Running"
        upload_state["ledger"]["status"] = "running"

        def run_upload():
            processed_files = []
            try:
                logger.info("[Server] Ledger upload triggered")

                # Process files
                ledger_dir = config.DOWNLOADS_DIR / "ledger"
                html_files = list(ledger_dir.glob("*.html")) + list(ledger_dir.glob("*.mhtml"))

                pending_keys = state_manager.get_keys_by_status("ledger", state_manager.STATUS_READY)
                pending_files = [f for f in html_files if f.stem in pending_keys]

                if not pending_files:
                    logger.info("[Server] No pending ledger files to process")
                    server_status["ledger_uploader_status"] = "Idle"
                    upload_state["ledger"]["status"] = "idle"
                    ledger_lock.release()
                    return

                # Accumulate all data from pending files
                all_ledger_data = []
                for html_file in pending_files:
                    order_id = html_file.stem
                    
                    # V10: Double-check distributed lock
                    if config.ENABLE_DISTRIBUTED_LOCK:
                        lock_status = distributed_lock.get_lock_status(order_id)
                        if lock_status and lock_status['status'] == DistributedLockManager.STATUS_COMPLETED:
                            logger.info(f"[V10] {order_id} already completed by another machine - skipping")
                            continue

                    logger.info(f"[Server] Parsing ledger file for bundling: {html_file.name}")
                    try:
                        with open(html_file, 'r', encoding='utf-8') as f:
                            html_content = f.read()
                        
                        erp_data = local_file_processor.process_html_content(html_content, file_path_hint=html_file.name, target_type='ledger')
                        if erp_data:
                            all_ledger_data.extend(erp_data)
                            processed_files.append(order_id)
                        else:
                            logger.warning(f"[Server] No data extracted from {order_id}")
                    except Exception as e:
                        logger.error(f"[Server] Error parsing {order_id}: {e}")

                if all_ledger_data:
                    logger.info(f"[Server] Bundled {len(all_ledger_data)} rows from {len(processed_files)} files. Starting upload...")
                    
                    # V10: Save to temporary JSON for subprocess transfer
                    temp_dir = Path("data/temp")
                    temp_dir.mkdir(parents=True, exist_ok=True)
                    temp_json = temp_dir / f"upload_bundle_ledger_{datetime.datetime.now().strftime('%H%M%S')}.json"
                    
                    with open(temp_json, 'w', encoding='utf-8') as tf:
                        json.dump(all_ledger_data, tf)

                    # Upload to ERP (With browser lock and isolated process)
                    with browser_lock:
                        logger.info(f"[Server] 🔒 Acquired browser lock for Ledger Bundle")
                        try:
                            sub_env = os.environ.copy()
                            sub_env["PYTHONIOENCODING"] = "utf-8"
                            
                            cmd = [sys.executable, "erp_upload_automation_v2.py", str(temp_json), "ledger"]
                            result = subprocess.run(cmd, env=sub_env, capture_output=True, text=True, encoding='utf-8', cwd=os.getcwd())
                            
                            if result.returncode == 0:
                                success = True
                                logger.info(f"[Server] Bundle upload success")
                            else:
                                success = False
                                logger.error(f"[Server] Bundle upload failed (Code: {result.returncode})")
                                logger.error(f"[Subprocess STDERR]: {result.stderr}")
                        finally:
                            if temp_json.exists(): temp_json.unlink()
                            logger.info(f"[Server] 🔓 Released browser lock for Ledger Bundle")
                    
                    if not success:
                        # Clear processed_files if upload failed so pending_save doesn't trigger
                        processed_files = [] 
                else:
                    logger.info("[Server] No valid data extracted from pending files")

                # Set to pending_save state if any files were processed
                if processed_files:
                    upload_state["ledger"]["status"] = "pending_save"
                    upload_state["ledger"]["pending_files"] = processed_files
                    upload_state["ledger"]["pending_since"] = datetime.datetime.now().isoformat()
                    logger.info(f"[Server] ⏳ Ledger upload complete - {len(processed_files)} files awaiting save confirmation")
                else:
                    upload_state["ledger"]["status"] = "idle"

                server_status["ledger_uploader_status"] = "Idle"

            except Exception as e:
                logger.error(f"[Server] Ledger upload error: {e}")
                server_status["ledger_uploader_status"] = "Idle"
                upload_state["ledger"]["status"] = "idle"
                upload_state["ledger"]["last_error"] = str(e)
            finally:
                ledger_lock.release()

        thread = threading.Thread(target=run_upload, daemon=True)
        thread.start()

        return jsonify({"status": "success", "message": "Ledger upload started"})

    except Exception as e:
        ledger_lock.release()
        upload_state["ledger"]["status"] = "idle"
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/trigger_estimate', methods=['POST'])
def trigger_estimate_upload():
    """Trigger estimate upload with lock awareness and pending_save state"""
    return sheet_hub_copy("estimate")

    if not estimate_lock.acquire(blocking=False):
        return jsonify({"status": "error", "message": "Estimate upload already running"}), 409

    # Check if already in pending_save state
    if upload_state["estimate"]["status"] == "pending_save":
        estimate_lock.release()
        return jsonify({"status": "error", "message": "이전 업로드 저장 확인이 필요합니다"}), 409

    try:
        server_status["estimate_uploader_status"] = "Running"
        upload_state["estimate"]["status"] = "running"

        def run_upload():
            processed_files = []
            try:
                logger.info("[Server] Estimate upload triggered")

                # Process files
                estimate_dir = config.DOWNLOADS_DIR / "estimate"
                html_files = list(estimate_dir.glob("*.html")) + list(estimate_dir.glob("*.mhtml"))

                pending_keys = state_manager.get_keys_by_status("estimate", state_manager.STATUS_READY)
                pending_files = [f for f in html_files if f.stem in pending_keys]

                if not pending_files:
                    logger.info("[Server] No pending estimate files to process")
                    server_status["estimate_uploader_status"] = "Idle"
                    upload_state["estimate"]["status"] = "idle"
                    estimate_lock.release()
                    return

                # Accumulate all data from pending files
                all_estimate_data = []
                for html_file in pending_files:
                    order_id = html_file.stem
                    
                    # V10: Double-check distributed lock
                    if config.ENABLE_DISTRIBUTED_LOCK:
                        lock_status = distributed_lock.get_lock_status(order_id)
                        if lock_status and lock_status['status'] == DistributedLockManager.STATUS_COMPLETED:
                            logger.info(f"[V10] {order_id} already completed by another machine - skipping")
                            continue

                    logger.info(f"[Server] Parsing estimate file for bundling: {html_file.name}")
                    try:
                        with open(html_file, 'r', encoding='utf-8') as f:
                            html_content = f.read()
                        
                        erp_data = local_file_processor.process_html_content(html_content, file_path_hint=html_file.name, target_type='estimate')
                        if erp_data:
                            all_estimate_data.extend(erp_data)
                            processed_files.append(order_id)
                        else:
                            logger.warning(f"[Server] No data extracted from {order_id}")
                    except Exception as e:
                        logger.error(f"[Server] Error parsing {order_id}: {e}")

                if all_estimate_data:
                    logger.info(f"[Server] Bundled {len(all_estimate_data)} rows from {len(processed_files)} files. Starting upload...")
                    
                    # Upload to ERP (Using Browser Lock)
                    with browser_lock:
                        logger.info("[Server] 🔒 Acquired browser lock for Estimate Bundle")
                        try:
                            automation = ErpUploadAutomation()
                            success = automation.run(direct_data=all_estimate_data, auto_close=True, target_type='estimate')
                            automation.close(keep_browser_open=True)
                            
                            if success:
                                logger.info(f"[Server] Bundle upload success")
                            else:
                                logger.error(f"[Server] Bundle upload failed")
                                # Mark each file as failed in state manager if the whole batch failed
                                for fid in processed_files:
                                    state_manager.update_state("estimate", fid, state_manager.STATUS_FAILED, error_msg="Batch upload failed")
                                processed_files = [] # Reset so it doesn't go to pending_save
                        finally:
                            logger.info("[Server] 🔓 Released browser lock for Estimate Bundle")
                else:
                    logger.info("[Server] No valid data extracted from pending files")

                # Set to pending_save state if any files were processed
                if processed_files:
                    upload_state["estimate"]["status"] = "pending_save"
                    upload_state["estimate"]["pending_files"] = processed_files
                    upload_state["estimate"]["pending_since"] = datetime.datetime.now().isoformat()
                    logger.info(f"[Server] ⏳ Estimate upload complete - {len(processed_files)} files awaiting save confirmation")
                else:
                    upload_state["estimate"]["status"] = "idle"

                server_status["estimate_uploader_status"] = "Idle"

            except Exception as e:
                logger.error(f"[Server] Estimate upload error: {e}")
                server_status["estimate_uploader_status"] = "Idle"
                upload_state["estimate"]["status"] = "idle"
                upload_state["estimate"]["last_error"] = str(e)
            finally:
                estimate_lock.release()

        thread = threading.Thread(target=run_upload, daemon=True)
        thread.start()

        return jsonify({"status": "success", "message": "Estimate upload started"})

    except Exception as e:
        estimate_lock.release()
        upload_state["estimate"]["status"] = "idle"
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/sheet_hub/copy/<doc_type>', methods=['POST'])
def sheet_hub_copy(doc_type):
    """Stage READY data into Sheet1 and copy it to the local clipboard."""
    if doc_type not in {"ledger", "estimate"}:
        return jsonify({"status": "error", "message": "Invalid document type"}), 400

    route_lock = ledger_lock if doc_type == "ledger" else estimate_lock
    status_key = f"{doc_type}_uploader_status"

    if not route_lock.acquire(blocking=False):
        return jsonify({"status": "error", "message": f"{doc_type} copy already running"}), 409

    if upload_state[doc_type]["status"] == "pending_save":
        route_lock.release()
        return jsonify({"status": "error", "message": f"{doc_type} 작업이 아직 완료 처리되지 않았습니다."}), 409

    try:
        server_status[status_key] = "Running"
        upload_state[doc_type]["status"] = "running"

        def run_copy():
            try:
                rows, processed_files = collect_pending_data(doc_type)
                if not processed_files:
                    logger.info("[SheetHub] No READY files for %s", doc_type)
                    upload_state[doc_type]["status"] = "idle"
                    return

                result = sheet_hub.stage_and_copy(doc_type, rows, processed_files)
                upload_state[doc_type]["status"] = "pending_save"
                upload_state[doc_type]["pending_files"] = processed_files
                upload_state[doc_type]["pending_since"] = result["started_at"]
                logger.info("[SheetHub] %s copied to Sheet1 (%s files / %s rows)", doc_type, len(processed_files), len(rows))
            except Exception as exc:
                logger.error("[SheetHub] %s copy failed: %s", doc_type, exc)
                upload_state[doc_type]["status"] = "idle"
                upload_state[doc_type]["last_error"] = str(exc)
            finally:
                server_status[status_key] = "Idle"
                route_lock.release()

        threading.Thread(target=run_copy, daemon=True).start()
        return jsonify({"status": "success", "message": f"{doc_type} 데이터를 시트 허브로 복사합니다."})
    except Exception as exc:
        route_lock.release()
        server_status[status_key] = "Idle"
        upload_state[doc_type]["status"] = "idle"
        return jsonify({"status": "error", "message": str(exc)}), 500


@app.route('/sheet_hub/complete', methods=['POST'])
def sheet_hub_complete():
    """Clear Sheet1, mark completion locally, and release the Sheet Hub lock."""
    data = request.get_json() or {}
    doc_type = data.get("type", "ledger")

    if doc_type not in {"ledger", "estimate"}:
        return jsonify({"status": "error", "message": "Invalid type"}), 400

    if upload_state[doc_type]["status"] != "pending_save":
        return jsonify({"status": "error", "message": f"No pending Sheet Hub work for {doc_type}"}), 400

    completed_count = finalize_sheet_hub_upload(doc_type)
    return jsonify({
        "status": "success",
        "message": f"{completed_count}건 완료 처리 후 Sheet1을 비우고 락을 해제했습니다.",
        "completed_count": completed_count,
    })


@app.route('/trigger_download', methods=['POST'])
def trigger_download():
    """Manual download trigger"""
    if server_status["downloader_status"] == "Running":
        return jsonify({"status": "error", "message": "Downloader already running"}), 409
    
    def run_manual():
        try:
            downloader.download_cycle(force_mode=False)
        except Exception as e:
            logger.error(f"Manual download error: {e}")
            server_status["downloader_status"] = "Idle"
            
    thread = threading.Thread(target=run_manual, daemon=True)
    thread.start()
    return jsonify({"status": "success", "message": "Manual download started"})

@app.route('/trigger_download_force', methods=['POST'])
def trigger_download_force():
    """Manual download trigger (Force mode)"""
    if server_status["downloader_status"] == "Running":
        return jsonify({"status": "error", "message": "Downloader already running"}), 409
    
    def run_force():
        try:
            downloader.download_cycle(force_mode=True)
        except Exception as e:
            logger.error(f"Force download error: {e}")
            server_status["downloader_status"] = "Idle"
            
    thread = threading.Thread(target=run_force, daemon=True)
    thread.start()
    return jsonify({"status": "success", "message": "Force sync started"})

@app.route('/reset_status', methods=['POST'])
def reset_status():
    server_status["last_error"] = None
    server_status["empty_cycle_count"] = 0
    server_status["downloader_status"] = "Idle"
    server_status["ledger_uploader_status"] = "Idle"
    server_status["estimate_uploader_status"] = "Idle"
    # Reset upload states
    upload_state["ledger"]["status"] = "idle"
    upload_state["ledger"]["pending_files"] = []
    upload_state["ledger"]["pending_since"] = None
    upload_state["estimate"]["status"] = "idle"
    upload_state["estimate"]["pending_files"] = []
    upload_state["estimate"]["pending_since"] = None
    try:
        sheet_hub.complete()
    except Exception as exc:
        logger.warning("[SheetHub] Reset could not clear Sheet1: %s", exc)
    return jsonify({"status": "success"})

@app.route('/api/health')
def health_check():
    """System health check endpoint"""
    browser_ok = browser_manager.is_healthy() if browser_manager else False
    server_status["browser_healthy"] = browser_ok

    # Check if downloader thread is stuck (no activity for 10+ minutes while "Running")
    downloader_stuck = False
    if server_status["downloader_status"] == "Running" and server_status["downloader_last_run"]:
        try:
            last_run = datetime.datetime.strptime(server_status["downloader_last_run"], "%Y-%m-%d %H:%M:%S")
            elapsed = (datetime.datetime.now() - last_run).total_seconds()
            downloader_stuck = elapsed > 600  # 10 minutes
        except:
            pass

    # Check pending_save timeout
    pending_save_timeout = {}
    for doc_type in ["ledger", "estimate"]:
        if upload_state[doc_type]["status"] == "pending_save" and upload_state[doc_type]["pending_since"]:
            try:
                pending_time = datetime.datetime.fromisoformat(upload_state[doc_type]["pending_since"])
                elapsed = (datetime.datetime.now() - pending_time).total_seconds()
                if elapsed > PENDING_SAVE_TIMEOUT_SEC:
                    pending_save_timeout[doc_type] = int(elapsed)
            except:
                pass

    uptime = (datetime.datetime.now() - datetime.datetime.fromisoformat(server_status["start_time"])).total_seconds()

    return jsonify({
        "browser_healthy": browser_ok,
        "youngrim_logged_in": server_status.get("youngrim_logged_in"),
        "downloader_stuck": downloader_stuck,
        "pending_save_timeout": pending_save_timeout,
        "uptime_seconds": int(uptime),
        "last_error": server_status.get("last_error")
    })

@app.route('/check_login', methods=['POST'])
def check_login():
    """Manually check Youngrim OMS login status"""
    try:
        if not browser_manager:
            return jsonify({"status": "error", "message": "Browser not initialized"}), 500

        logged_in = browser_manager.check_youngrim_login()
        server_status["youngrim_logged_in"] = logged_in

        return jsonify({
            "status": "success",
            "logged_in": logged_in,
            "message": "로그인 상태 정상" if logged_in else "로그인 필요 - 브라우저에서 영림 OMS에 로그인하세요"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/upload_state')
def get_upload_state():
    """Get current upload state for pending_save tracking"""
    return jsonify(upload_state)


@app.route('/api/hub_status')
def get_hub_status():
    """Expose current Sheet Hub lock/metadata state to the dashboard."""
    try:
        return jsonify(sheet_hub.get_status())
    except Exception as exc:
        logger.error("[SheetHub] Failed to load hub status: %s", exc)
        return jsonify({
            "locked": False,
            "locked_by_me": False,
            "machine_id": sheet_hub.machine_id,
            "status": "대기중",
            "processor": "",
            "started_at": "",
            "doc_type": "",
            "file_names": "",
            "row_count": "0",
            "archived_at": "",
            "error": str(exc),
        })

@app.route('/confirm_save', methods=['POST'])
def confirm_save():
    """Backward-compatible completion endpoint; now finalizes Sheet Hub work."""
    data = request.get_json() or {}
    doc_type = data.get("type", "ledger")

    if doc_type not in ["ledger", "estimate"]:
        return jsonify({"status": "error", "message": "Invalid type"}), 400

    if upload_state[doc_type]["status"] != "pending_save":
        return jsonify({"status": "error", "message": f"No pending save for {doc_type}"}), 400

    completed_count = finalize_sheet_hub_upload(doc_type)
    logger.info("[SheetHub] Completion confirmed for %s (%s files)", doc_type, completed_count)
    return jsonify({
        "status": "success",
        "message": f"{completed_count}건 완료 처리 후 Sheet1을 정리했습니다.",
        "completed_count": completed_count
    })

    # Move pending files to history and update state to COMPLETED
    history = load_history()
    for file_id in upload_state[doc_type]["pending_files"]:
        state_manager.update_state(doc_type, file_id, state_manager.STATUS_COMPLETED)
        if file_id not in history.get(doc_type, []):
            history[doc_type].append(file_id)
    save_history(history)

    # Update state
    upload_state[doc_type]["status"] = "idle"
    upload_state[doc_type]["last_completed"] = datetime.datetime.now().isoformat()
    completed_count = len(upload_state[doc_type]["pending_files"])
    upload_state[doc_type]["pending_files"] = []
    upload_state[doc_type]["pending_since"] = None

    logger.info(f"[Server] ✅ Save confirmed for {doc_type} ({completed_count} files)")

    return jsonify({
        "status": "success",
        "message": f"{completed_count}건 저장 완료 확인됨",
        "completed_count": completed_count
    })

@app.route('/mark_failed', methods=['POST'])
def mark_failed():
    """Mark pending upload as failed (needs retry)"""
    data = request.get_json() or {}
    doc_type = data.get("type", "ledger")

    if doc_type not in ["ledger", "estimate"]:
        return jsonify({"status": "error", "message": "Invalid type"}), 400

    if upload_state[doc_type]["status"] != "pending_save":
        return jsonify({"status": "error", "message": f"No pending save for {doc_type}"}), 400

    # Don't add to history - files will be retried. Mark as FAILED in state.
    failed_count = len(upload_state[doc_type]["pending_files"])
    for file_id in upload_state[doc_type]["pending_files"]:
        state_manager.update_state(doc_type, file_id, state_manager.STATUS_FAILED, error_msg="Manual save rejection")

    # Update state
    upload_state[doc_type]["status"] = "idle"
    upload_state[doc_type]["last_error"] = datetime.datetime.now().isoformat()
    upload_state[doc_type]["pending_files"] = []
    upload_state[doc_type]["pending_since"] = None

    logger.warning(f"[Server] ❌ Save failed for {doc_type} ({failed_count} files will be retried)")

    return jsonify({
        "status": "success",
        "message": f"{failed_count}건 저장 실패 - 다시 시도 필요",
        "failed_count": failed_count
    })

@app.route('/restart_downloader', methods=['POST'])
def restart_downloader():
    """Restart the downloader thread"""
    global downloader

    try:
        # Stop current downloader
        if downloader:
            downloader.running = False
            downloader.active_mode = False
            time.sleep(2)

        # Reset status
        server_status["downloader_status"] = "Idle"
        server_status["empty_cycle_count"] = 0

        # Start new downloader
        downloader = AutoDownloader()
        downloader.start()
        downloader.activate()

        logger.info("[Server] Downloader restarted successfully")
        return jsonify({"status": "success", "message": "다운로더가 재시작되었습니다"})

    except Exception as e:
        logger.error(f"[Server] Failed to restart downloader: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

# Main Execution
def cleanup_port(port):
    """지정된 포트를 사용하는 프로세스를 종료합니다."""
    try:
        cmd = f"netstat -ano | findstr :{port}"
        output = subprocess.check_output(cmd, shell=True).decode()
        for line in output.strip().split('\n'):
            if 'LISTENING' in line:
                pid = line.strip().split()[-1]
                logger.info(f"[Server] Cleanup: Terminating process {pid} using port {port}")
                os.system(f"taskkill /F /PID {pid} /T")
                time.sleep(1)
    except:
        pass

def graceful_shutdown():
    """Cleanup resources on exit."""
    logger.info("[System] Shutting down gracefully...")
    
    # Stop downloader
    try:
        if 'downloader' in globals() and downloader:
            downloader.running = False
            logger.info("[System] Downloader stopped")
    except:
        pass
        
    # Close browser
    try:
        if browser_manager and browser_manager.driver:
            logger.info("[System] Closing browser session...")
            browser_manager.driver.quit()
            logger.info("[System] Browser session closed")
    except:
        pass

# Register shutdown handlers
atexit.register(graceful_shutdown)

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("V10 Auto Server Starting - Distributed Lock Edition")
    logger.info("=" * 60)

    # Ensure port is clean
    cleanup_port(config.FLASK_PORT)

    # V10: Initialize distributed lock manager (only if enabled)
    if config.ENABLE_DISTRIBUTED_LOCK:
        logger.info("[V10] Connecting to distributed lock manager...")
        if distributed_lock.connect():
            server_status["lock_manager_connected"] = True
            server_status["machine_id"] = distributed_lock.machine_id
            logger.info(f"[V10] ✅ Distributed lock manager connected (Machine: {distributed_lock.machine_id})")
        else:
            logger.warning("[V10] ⚠️ Failed to connect to distributed lock manager - running in standalone mode")
            server_status["lock_manager_connected"] = False
    else:
        logger.info("[V10] Distributed lock DISABLED (Default) - running in standalone mode")
        server_status["lock_manager_connected"] = False

    # V10: Check browser connection immediately
    logger.info("[Server] Verifying browser connection...")
    if browser_manager.ensure_connection():
        server_status["browser_healthy"] = True
        logger.info(" ✅ Browser connection verified")
    else:
        logger.warning(" ⚠️ Browser NOT detected. Please ensure Edge is running with start_edge_debug.bat")
        server_status["browser_healthy"] = False

    # V10: Auto Downloader activated for production
    downloader = AutoDownloader()
    downloader.start()
    downloader.activate()
    logger.info("[Server] Auto Downloader activated")

    # Start Flask Server
    logger.info(f"[Server] Starting Flask on port {config.FLASK_PORT}")
    logger.info(f"[Server] Dashboard: http://localhost:{config.FLASK_PORT}")

    try:
        app.run(host='0.0.0.0', port=config.FLASK_PORT, debug=config.FLASK_DEBUG, use_reloader=False)
    except Exception as e:
        logger.critical(f"[Server] Flask server crashed: {e}")
        traceback.print_exc()
    finally:
        graceful_shutdown()
