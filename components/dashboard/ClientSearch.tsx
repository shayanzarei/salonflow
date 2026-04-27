"use client";

import { Input } from "@/components/ds/Input";
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
        <Input
          id="client_name"
          name="client_name"
          type="text"
          label="Client name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          placeholder="Search existing clients or type a new name"
          autoComplete="off"
        />

        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-ink-200 bg-ink-0 shadow-lg">
            {results.map((client) => (
              <button
                key={client.client_email}
                type="button"
                onClick={() => selectClient(client)}
                className="w-full border-b border-ink-100 px-4 py-3 text-left transition-colors hover:bg-ink-50 last:border-b-0"
              >
                <p className="text-body-sm font-medium text-ink-900">
                  {client.client_name}
                </p>
                <p className="text-caption text-ink-400">{client.client_email}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Input
        id="client_email"
        name="client_email"
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="sarah@example.com"
      />

      <Input
        id="client_phone"
        name="client_phone"
        type="tel"
        label="Phone"
        optionalLabel="(optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+31 6 12345678"
      />
    </div>
  );
}
