import React, { useState } from "react";
import axios from "axios";
import QRCode from "react-qr-code";
import { useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const UrlForm = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  
  // QR Modal state
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState("");

  // To store the immediate result of the last shortened URL
  const [latestShortUrl, setLatestShortUrl] = useState("");

  // Fetch URLs
  const { data: urls = [], isLoading: urlsLoading } = useQuery({
    queryKey: ['urls'],
    queryFn: async () => {
      const response = await axios.get("/api/create/my-urls", { withCredentials: true });
      return response.data.data || [];
    },
    // Only fetch if authenticated
    enabled: isAuthenticated,
  });

  // Mutation for creating URL
  const mutation = useMutation({
    mutationFn: async (data) => {
      // If authenticated, use /api/create/custom so the user is always attached (slug can be empty).
      // If not authenticated, use /api/create.
      const endpoint = isAuthenticated ? "/api/create/custom" : "/api/create";
      const payload = data.slug ? { url: data.url, slug: data.slug } : { url: data.url };
      const response = await axios.post(endpoint, payload, { withCredentials: true });
      return response.data;
    },
    onSuccess: (data) => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['urls'] });
      }
      setLatestShortUrl(typeof data === "string" ? data : (data.short_url || data.url));
      setOriginalUrl("");
      setCustomSlug("");
    },
    onError: (err) => {
      alert(err.response?.data?.message || err.message || "Failed to shorten URL");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!originalUrl) return;
    mutation.mutate({ url: originalUrl, slug: customSlug });
  };

  const handleCopy = async (shortUrl, id) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const openQRModal = (url) => {
    setQrUrl(url);
    setIsQRModalOpen(true);
  };

  const closeQRModal = () => {
    setIsQRModalOpen(false);
    setQrUrl("");
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("QRCodeSVG");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "qr-code.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 max-w-3xl w-full mx-auto relative mt-4">
      
      <h1 className="text-[22px] font-bold text-center text-gray-900 mb-4 mt-0">
        URL Shortener
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-3xl mx-auto">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Enter your URL
          </label>
          <input
            type="url"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://www.google.com"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            disabled={mutation.isPending}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full mt-1 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold rounded-lg shadow-sm transition duration-200 flex justify-center items-center"
        >
          {mutation.isPending ? "Shortening..." : "Shorten URL"}
        </button>

        {isAuthenticated && (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Custom URL (optional)
            </label>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="Enter custom slug"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              disabled={mutation.isPending}
            />
          </div>
        )}
      </form>

      {latestShortUrl && (
        <div className="mt-4 max-w-3xl mx-auto p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-green-800 mb-1">Successfully shortened!</p>
            <a href={latestShortUrl.startsWith('http') ? latestShortUrl : `http://${window.location.hostname}:3000/${latestShortUrl}`} target="_blank" rel="noreferrer" className="text-green-700 font-medium hover:underline text-lg">
              {latestShortUrl.startsWith('http') ? latestShortUrl : `http://${window.location.hostname}:3000/${latestShortUrl}`}
            </a>
          </div>
          <button
            onClick={() => handleCopy(latestShortUrl.startsWith('http') ? latestShortUrl : `http://${window.location.hostname}:3000/${latestShortUrl}`, 'latest')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md shadow-sm transition-colors"
          >
            {copiedId === 'latest' ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {isAuthenticated && (
        <div className="mt-6 bg-gray-50/50 rounded-xl overflow-hidden border border-gray-100">
          <div className="overflow-auto max-h-[250px]">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200 font-semibold tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">Original URL</th>
                  <th className="px-6 py-4">Short URL</th>
                  <th className="px-6 py-4 text-center">Clicks</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                  <th className="px-6 py-4 text-center">QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {urlsLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      Loading your URLs...
                    </td>
                  </tr>
                ) : urls.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      You haven't created any short URLs yet.
                    </td>
                  </tr>
                ) : (
                  urls.map((url) => {
                    const fullShortUrl = url.short_url.startsWith('http') ? url.short_url : `http://${window.location.hostname}:3000/${url.short_url}`;
                    return (
                      <tr key={url._id} className="bg-white hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 max-w-[200px] truncate" title={url.full_url}>
                          {url.full_url}
                        </td>
                        <td className="px-6 py-4">
                          <a href={fullShortUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline font-medium">
                            {fullShortUrl}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 rounded-full">
                            {url.clicks} clicks
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleCopy(fullShortUrl, url._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            {copiedId === url._id ? "Copied" : "Copy URL"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openQRModal(fullShortUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold rounded-md shadow-sm transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <rect x="7" y="7" width="3" height="3"></rect>
                              <rect x="14" y="7" width="3" height="3"></rect>
                              <rect x="7" y="14" width="3" height="3"></rect>
                              <rect x="14" y="14" width="3" height="3"></rect>
                            </svg>
                            QR Code
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isQRModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative">
            <button
              onClick={closeQRModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">QR Code</h3>
            <div className="flex justify-center bg-white p-4 rounded-lg border border-gray-100 mb-6">
              <QRCode
                id="QRCodeSVG"
                value={qrUrl}
                size={200}
                level="H"
                viewBox={`0 0 256 256`}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            <p className="text-xs text-center text-gray-500 mb-6 break-all px-2">
              {qrUrl}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={closeQRModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleDownloadQR}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download SVG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
