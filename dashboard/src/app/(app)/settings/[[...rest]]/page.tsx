"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import { Save, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Integration credentials stored in localStorage ───────────────────────────

const FIELDS = {
  jira: [
    { key: "jira_url",     label: "JIRA Base URL",      placeholder: "https://yourcompany.atlassian.net", type: "url"      },
    { key: "jira_email",   label: "JIRA Email",          placeholder: "you@company.com",                  type: "email"    },
    { key: "jira_token",   label: "JIRA API Token",      placeholder: "••••••••••••",                     type: "password" },
    { key: "jira_project", label: "Default Project Key", placeholder: "ATC",                              type: "text"     },
  ],
  zephyr: [
    { key: "zephyr_token",   label: "Zephyr Scale API Token", placeholder: "••••••••••••", type: "password" },
    { key: "zephyr_project", label: "Default Project Key",    placeholder: "PROJ",         type: "text"     },
  ],
} as const;

type FieldKey = "jira_url" | "jira_email" | "jira_token" | "jira_project" | "zephyr_token" | "zephyr_project";

function IntegrationSection({
  title,
  description,
  docsUrl,
  fields,
}: {
  title: string;
  description: string;
  docsUrl: string;
  fields: readonly { key: FieldKey; label: string; placeholder: string; type: string }[];
}) {
  const [values, setValues]   = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [show, setShow]       = useState<Record<string, boolean>>({});
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    const loaded: Partial<Record<FieldKey, string>> = {};
    fields.forEach(({ key }) => {
      loaded[key] = localStorage.getItem(key) ?? "";
    });
    setValues(loaded as Record<FieldKey, string>);
  }, [fields]);

  function save() {
    fields.forEach(({ key }) => {
      if (values[key]) localStorage.setItem(key, values[key]);
      else localStorage.removeItem(key);
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function clear() {
    fields.forEach(({ key }) => localStorage.removeItem(key));
    setValues(Object.fromEntries(fields.map(({ key }) => [key, ""])) as Record<FieldKey, string>);
  }

  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
          </div>
          <a href={docsUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-violet-600 hover:underline">
            Docs →
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
            <div className="relative">
              <Input
                type={type === "password" && !show[key] ? "password" : "text"}
                placeholder={placeholder}
                value={values[key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                className="pr-9 font-mono text-sm"
              />
              {type === "password" && (
                <button
                  type="button"
                  onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {show[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-1">
          <Button onClick={save} size="sm" className="gap-1.5 bg-violet-600 hover:bg-violet-700">
            {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved!" : "Save credentials"}
          </Button>
          <Button onClick={clear} size="sm" variant="outline" className="text-xs text-red-500 hover:text-red-700">
            Clear
          </Button>
        </div>

        <p className="text-[11px] text-gray-400">
          Credentials are stored locally in your browser and never sent to our servers except when making API calls on your behalf.
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and integrations.</p>
      </div>

      {/* Integrations */}
      <IntegrationSection
        title="JIRA Integration"
        description="Connect to JIRA to fetch user stories directly by issue key (e.g. PROJ-123)."
        docsUrl="https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/"
        fields={FIELDS.jira}
      />

      <IntegrationSection
        title="Zephyr Scale Integration"
        description="Upload generated test cases directly to Zephyr Scale (SmartBear Cloud) for your project."
        docsUrl="https://support.smartbear.com/zephyr-scale-cloud/docs/api-and-integration/generating-api-access-tokens.html"
        fields={FIELDS.zephyr}
      />

      {/* Account */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">Account</h2>
        <div className="flex justify-center">
          <UserProfile
            appearance={{
              elements: {
                card: "shadow-none border rounded-xl",
                navbar: "hidden",
                navbarMobileMenuButton: "hidden",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
