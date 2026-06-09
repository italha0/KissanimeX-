"use client";
import { useState, useEffect } from "react";
import { Settings, X, CheckCircle, AlertCircle, Cookie } from "lucide-react";

/**
 * CookieSetup — lets users paste their AnimePahe browser cookies so server-side
 * requests run from their IP (which has a valid cf_clearance) rather than
 * Cloudflare Worker datacenter IPs which are blocked.
 *
 * Usage:
 *   1. Open animepahe.pw in browser
 *   2. DevTools → Network → any request → right-click → Copy → Copy as cURL
 *   3. Paste the full Cookie header value into this dialog
 *   4. The cookie (especially cf_clearance) is stored in localStorage
 *      and sent as x-cf-clearance / x-animepahe-cookies on every API request
 */
export function CookieSetup() {
  const [isOpen, setIsOpen] = useState(false);
  const [cookieValue, setCookieValue] = useState("");
  const [savedClearance, setSavedClearance] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    const stored = localStorage.getItem("cf_clearance");
    setSavedClearance(stored);
  }, []);

  const handleSave = () => {
    const raw = cookieValue.trim();
    if (!raw) {
      setStatus("error");
      return;
    }

    // Extract cf_clearance from the full cookie string
    const cfMatch = raw.match(/cf_clearance=([^;]+)/);
    if (!cfMatch) {
      setStatus("error");
      return;
    }

    const clearance = cfMatch[1].trim();
    localStorage.setItem("cf_clearance", clearance);
    // Also store the full cookie string for richer authentication
    localStorage.setItem("animepahe_cookies", raw);
    setSavedClearance(clearance);
    setStatus("saved");
    setCookieValue("");
    setTimeout(() => setStatus("idle"), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem("cf_clearance");
    localStorage.removeItem("animepahe_cookies");
    setSavedClearance(null);
    setStatus("idle");
  };

  const isExpired = () => {
    if (!savedClearance) return false;
    // cf_clearance format: VALUE-TIMESTAMP-VERSION-...
    const parts = savedClearance.split("-");
    // timestamp is the second segment (after first hyphen-separated value)
    // Actually format is: HASH-TIMESTAMP-VERSION-FINGERPRINT...
    const tsMatch = savedClearance.match(/\-(\d{10})\-/);
    if (!tsMatch) return false;
    const ts = parseInt(tsMatch[1], 10);
    const ageHours = (Date.now() / 1000 - ts) / 3600;
    return ageHours > 24; // warn after 24h
  };

  return (
    <>
      {/* Floating gear button */}
      <button
        id="cookie-setup-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-full shadow-lg transition-all"
        title="AnimePahe Cookie Setup"
      >
        <Cookie size={16} />
        {savedClearance && !isExpired() ? (
          <CheckCircle size={14} className="text-green-400" />
        ) : (
          <AlertCircle size={14} className={savedClearance ? "text-yellow-400" : "text-red-400"} />
        )}
      </button>

      {/* Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-950 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Cookie size={20} className="text-orange-400" />
                <h2 className="text-white font-semibold text-lg">AnimePahe Cookie Setup</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Current status */}
              {savedClearance ? (
                <div className={`flex items-start gap-3 p-3 rounded-lg ${isExpired() ? "bg-yellow-900/30 border border-yellow-700" : "bg-green-900/30 border border-green-700"}`}>
                  {isExpired() ? (
                    <AlertCircle size={16} className="text-yellow-400 mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                  )}
                  <div className="text-sm">
                    <p className={isExpired() ? "text-yellow-300" : "text-green-300"}>
                      {isExpired() ? "Cookie may be expired (>24h old)" : "Cookie active"}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5 font-mono break-all">
                      {savedClearance.substring(0, 40)}…
                    </p>
                  </div>
                  <button onClick={handleClear} className="ml-auto text-gray-500 hover:text-red-400 text-xs">
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-300 text-sm">No cookie set — search will fail</p>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                <p className="text-gray-300 text-sm font-medium">How to get your cookie:</p>
                <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
                  <li>Open <span className="text-orange-300">animepahe.pw</span> in your browser and pass the challenge</li>
                  <li>Open DevTools → Network tab → click any API request</li>
                  <li>Scroll to <span className="text-orange-300">Request Headers</span> → find <code className="bg-gray-800 px-1 rounded">Cookie:</code></li>
                  <li>Copy the entire value and paste it below</li>
                </ol>
              </div>

              {/* Input */}
              <div>
                <label className="text-gray-300 text-sm font-medium block mb-2">
                  Paste full Cookie header value:
                </label>
                <textarea
                  id="cookie-input"
                  value={cookieValue}
                  onChange={(e) => setCookieValue(e.target.value)}
                  placeholder="cf_clearance=...; XSRF-TOKEN=...; animepahe_session=...; SERVERID=pong"
                  className="w-full h-28 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                />
                {status === "error" && (
                  <p className="text-red-400 text-xs mt-1">Could not find cf_clearance in the pasted value</p>
                )}
                {status === "saved" && (
                  <p className="text-green-400 text-xs mt-1">✓ Cookie saved successfully</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
              >
                Save Cookie
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
