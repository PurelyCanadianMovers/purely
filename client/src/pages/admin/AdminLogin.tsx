import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { Lock, Eye, EyeOff } from "lucide-react";
import { getLoginUrl } from "@/const";

const ADMIN_PASSPHRASE = "PCM2026";

export default function AdminLoginPage() {
  const [passphrase, setPassphrase] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === ADMIN_PASSPHRASE) {
      // Store passphrase confirmation in sessionStorage, then redirect to OAuth
      sessionStorage.setItem("pcm_admin_pass", "ok");
      window.location.href = getLoginUrl("/admin/blog");
    } else {
      setError("Incorrect passphrase. Please try again.");
      setPassphrase("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <SEO title="Admin Login | Purely Canadian Movers" description="Admin login" canonical="/admin/login" />
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#CC1A1A] flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white mb-1">Admin Access</h1>
          <p className="font-body text-sm text-gray-400">Purely Canadian Movers</p>
        </div>
        <Card className="border-gray-800 bg-gray-900">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="passphrase" className="font-body font-semibold text-gray-300">Admin Passphrase</Label>
                <div className="relative mt-1">
                  <Input
                    id="passphrase"
                    type={showPass ? "text" : "password"}
                    value={passphrase}
                    onChange={(e) => { setPassphrase(e.target.value); setError(""); }}
                    placeholder="Enter passphrase"
                    className="font-body bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 pr-10"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    aria-label={showPass ? "Hide passphrase" : "Show passphrase"}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="font-body text-xs text-red-400 mt-1">{error}</p>}
              </div>
              <Button
                type="submit"
                className="w-full bg-[#CC1A1A] hover:bg-[#A31515] text-white font-body font-semibold"
                disabled={!passphrase}
              >
                Continue to Admin
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="font-body text-xs text-gray-600 text-center mt-4">
          After passphrase verification, you'll be redirected to sign in with your Manus account.
        </p>
      </div>
    </div>
  );
}
