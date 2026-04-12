"use client";

import { useEffect, useRef, useState } from "react";

interface Client {
  client_name: string;
  client_email: string;
  client_phone: string | null;
}

export default function ClientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      const res = await fetch(
        `/api/clients/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data);
      setShowDropdown(data.length > 0);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectClient(client: Client) {
    setQuery(client.client_name);
    setEmail(client.client_email);
    setPhone(client.client_phone ?? "");
    setShowDropdown(false);
  }

  return (
    <div className="space-y-4">
      {/* Name field with dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client name
        </label>
        <input
          type="text"
          name="client_name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          placeholder="Search existing clients or type a new name"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
          autoComplete="off"
        />

        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {results.map((client) => (
              <button
                key={client.client_email}
                type="button"
                onClick={() => selectClient(client)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <p className="text-sm font-medium text-gray-900">
                  {client.client_name}
                </p>
                <p className="text-xs text-gray-400">{client.client_email}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          name="client_email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="sarah@example.com"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="tel"
          name="client_phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+31 6 12345678"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-purple-400"
        />
      </div>
    </div>
  );
}
