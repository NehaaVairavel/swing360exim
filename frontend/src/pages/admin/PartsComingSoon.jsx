import React, { useState, useEffect } from "react";
import { Wrench, Mail, ArrowRight, Clock } from "lucide-react";
import { toast } from "sonner";
import "@/styles/admin.css";

const PartsComingSoon = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 24 * 60 * 60);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const d = Math.floor(seconds / (24 * 3600));
    const h = Math.floor((seconds % (24 * 3600)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return { d, h, m, s };
  };

  const { d, h, m, s } = formatTime(timeLeft);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email) {
      toast.success("We'll notify you when the marketplace launches.");
      setEmail("");
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        minHeight: "78vh",
        padding: "48px 24px",
        animation: "fadeIn 0.6s ease",
      }}
    >
      {/* Icon badge */}
      <div className="relative mb-10">
        <div
          className="flex items-center justify-center"
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "28px",
            background: "#FEF9EC",
            border: "1px solid #FDE68A",
            boxShadow: "0 12px 32px rgba(245,179,1,0.18)",
          }}
        >
          <Wrench size={40} style={{ color: "#F5B301" }} />
        </div>
        <div
          className="absolute -top-2 -right-2 flex items-center justify-center"
          style={{
            background: "#111827",
            color: "#ffffff",
            borderRadius: "8px",
            padding: "3px 8px",
            fontFamily: "'Inter', sans-serif",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          V2.0
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-10" style={{ maxWidth: "560px" }}>
        <h1
          className="admin-dashboard-title mb-4"
          style={{ fontSize: "clamp(28px, 5vw, 44px)", color: "#111827" }}
        >
          Parts Marketplace{" "}
          <span style={{ color: "#F5B301" }}>Launching Soon</span>
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "16px",
            color: "#64748B",
            lineHeight: 1.7,
          }}
        >
          We are building a premium destination for genuine heavy machinery spare
          parts. Get ready for a seamless global trading experience.
        </p>
      </div>

      {/* Countdown */}
      <div className="flex gap-4 md:gap-6 mb-12">
        {[
          { label: "Days", value: d },
          { label: "Hours", value: h },
          { label: "Minutes", value: m },
          { label: "Seconds", value: s },
        ].map((unit) => (
          <div key={unit.label} className="countdown-box">
            <div className="countdown-value">
              {String(unit.value).padStart(2, "0")}
            </div>
            <span className="countdown-label">{unit.label}</span>
          </div>
        ))}
      </div>

      {/* Notify form */}
      <form
        onSubmit={handleNotify}
        className="w-full"
        style={{ maxWidth: "440px" }}
      >
        <div
          className="flex overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1px solid #EAECEF",
            borderRadius: "18px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
          }}
        >
          <div
            className="flex items-center"
            style={{ padding: "0 16px", color: "#94A3B8" }}
          >
            <Mail size={17} />
          </div>
          <input
            type="email"
            placeholder="Enter your email for early access"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "14px 8px",
              fontFamily: "'Inter', sans-serif",
              fontSize: "14px",
              color: "#111827",
              background: "transparent",
              border: "none",
              outline: "none",
            }}
          />
          <button
            type="submit"
            className="btn-accent flex items-center gap-2"
            style={{
              borderRadius: "0 16px 16px 0",
              padding: "14px 20px",
              margin: 0,
            }}
          >
            Notify Me
            <ArrowRight size={15} />
          </button>
        </div>
      </form>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PartsComingSoon;
