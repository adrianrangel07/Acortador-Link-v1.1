"use client";

import { useState } from "react";
import QRCode from "qrcode";

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");
    setQrCode("");
    setCopied(false);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred");
        setLoading(false);
        return;
      }

      setShortUrl(data.shorturl);

      const qr = await QRCode.toDataURL(data.shorturl);
      setQrCode(qr);
    } catch (err) {
      setError("Error al conectar con el servidor");
    }

    setLoading(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar: ", err);
    }
  };

  // 🔥 NUEVA FUNCIÓN: Pegar desde el portapapeles
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        // Opcional: validar si es una URL
        try {
          new URL(text);
          // Si es una URL válida, podrías mostrar un mensaje o ícono
        } catch {
          // No es una URL válida, pero el usuario puede editarla
        }
      }
    } catch (err) {
      console.error("Error al pegar: ", err);
      // Fallback para navegadores que no soportan clipboard API
      alert("No se pudo acceder al portapapeles. Pega manualmente (Ctrl+V)");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🔗</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            ShortLink
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-md">
          Shorten your links instantly and share them easily
        </p>
      </div>

      {/* Card Principal */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Group */}
          <div className="space-y-2">
            <label
              htmlFor="url"
              className="block text-sm font-medium text-gray-700"
            >
              Enter your URL
            </label>
            <div className="relative">
              <input
                id="url"
                type="text"
                placeholder="Paste your URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-4 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-900"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
                {/* Ícono Mundo */}
                <span className="text-gray-400">🌐</span>

                {/* Separador */}
                <div className="h-6 w-px bg-gray-300"></div>

                {/* Botón de Pegar */}
                <button
                  type="button"
                  onClick={pasteFromClipboard}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors duration-200 text-sm font-medium border border-blue-200"
                  title="Paste from clipboard"
                >
                  <span className="text-sm">📋</span>
                  <span className="hidden sm:inline">Paste</span>
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press “Paste” to automatically insert your copied link
            </p>
          </div>

          {/* Botón de Acortar */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Shortening...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>🚀</span>
                <span>Shorten URL</span>
              </div>
            )}
          </button>
        </form>

        {/* Mensaje de Error */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <span>⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Resultado */}
        {shortUrl && (
          <div className="mt-8 space-y-6 animate-fade-in">
            {/* URL Acortada */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                ¡Ready URL! 🎉
              </h3>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">You short link</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 bg-transparent border-none text-blue-600 font-medium text-sm focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <span>✅</span>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <span>📋</span>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors"
              >
                Test link ↗
              </a>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600 font-medium">
                  QR code for sharing
                </p>
                <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-48 h-48 rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500">Scan to open the link</p>
              </div>
            )}
          </div>
        )}

        {/* Footer de la Card */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>✅ Secure and reliable links</p>
            <p>⚡ Quick and easy to use</p>
            <p>📱 Compatible with all devices</p>
          </div>
        </div>
      </div>

      {/* Footer Global */}
      <footer className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Made with ❤️ to simplify your digital life
        </p>
      </footer>

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
