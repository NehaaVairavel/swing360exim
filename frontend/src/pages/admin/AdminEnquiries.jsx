import { useState, useMemo, useEffect } from "react";
import enquiryService from "@/services/enquiryService";
import {
  Search,
  Mail,
  Phone,
  Download,
  Filter,
  CheckCircle,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import "@/styles/admin.css";

const AdminEnquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCountry, setActiveCountry] = useState("All");

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const data = await enquiryService.getAll();
        setEnquiries(data);
      } catch (error) {
        toast.error("Failed to load enquiries");
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((e) => {
      const matchesSearch =
        (e.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.interested_product || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCountry =
        activeCountry === "All" || e.country === activeCountry;
      return matchesSearch && matchesCountry;
    });
  }, [searchQuery, activeCountry, enquiries]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await enquiryService.updateStatus(id, newStatus);
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      toast.success(`Marked as ${newStatus}`);
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await enquiryService.delete(id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Enquiry deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const countries = [
    "All",
    ...new Set(enquiries.map((e) => e.country).filter(Boolean)),
  ];

  if (loading)
    return (
      <div className="admin-loading">
        <span>Loading Leads...</span>
      </div>
    );

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>
      {/* ── Page Header ── */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Client Enquiries</h1>
          <p className="admin-page-subtitle">
            Manage global machinery requests and leads
          </p>
        </div>
        <button className="btn-secondary">
          <Download size={16} style={{ color: "#F5B301" }} />
          Export CSV
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="admin-filter-bar">
        <div className="relative flex-1" style={{ minWidth: "240px", maxWidth: "380px" }}>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2"
            size={15}
            style={{ color: "#94A3B8" }}
          />
          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-input"
            style={{ paddingLeft: "40px" }}
          />
        </div>

        <div className="hidden xl:block w-px h-8" style={{ background: "#EAECEF" }} />

        <div className="flex items-center gap-3">
          <SlidersHorizontal size={15} style={{ color: "#94A3B8" }} />
          <select
            value={activeCountry}
            onChange={(e) => setActiveCountry(e.target.value)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              background: "transparent",
              border: "none",
              outline: "none",
              cursor: "pointer",
            }}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            marginLeft: "auto",
            fontFamily: "'Inter', sans-serif",
            fontSize: "13px",
            fontWeight: 600,
            color: "#64748B",
          }}
        >
          {filteredEnquiries.length} results
        </div>
      </div>

      {/* ── Enquiries Table ── */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table
            className="admin-table"
            style={{ minWidth: "780px", whiteSpace: "nowrap" }}
          >
            <thead>
              <tr>
                <th className="admin-table-header text-left">Client</th>
                <th className="admin-table-header text-left">Contact Info</th>
                <th className="admin-table-header text-left">
                  Interested Product
                </th>
                <th className="admin-table-header text-left">Status</th>
                <th className="admin-table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: "56px",
                      textAlign: "center",
                      color: "#94A3B8",
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "14px",
                    }}
                  >
                    No enquiries match your filters.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((e) => (
                  <tr key={e.id}>
                    {/* Client */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: "#F1F3F7",
                            color: "#374151",
                            fontFamily: "'Sora', sans-serif",
                          }}
                        >
                          {e.name?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <div
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontWeight: 700,
                              fontSize: "13px",
                              color: "#111827",
                            }}
                          >
                            {e.name}
                          </div>
                          <div
                            className="admin-label-small"
                            style={{ color: "#94A3B8", fontSize: "9px", marginTop: "2px" }}
                          >
                            {new Date(e.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td>
                      <div className="flex flex-col gap-1.5">
                        <div
                          className="flex items-center gap-2"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "12px",
                            color: "#374151",
                          }}
                        >
                          <Mail size={11} style={{ color: "#94A3B8" }} />
                          {e.email}
                        </div>
                        <div
                          className="flex items-center gap-2"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "12px",
                            color: "#374151",
                          }}
                        >
                          <Phone size={11} style={{ color: "#94A3B8" }} />
                          {e.phone}
                        </div>
                      </div>
                    </td>

                    {/* Product */}
                    <td>
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "#111827",
                        }}
                      >
                        {e.interested_product || "General Inquiry"}
                      </div>
                      {e.country && (
                        <span
                          className="admin-label-small"
                          style={{
                            background: "#FEF9EC",
                            color: "#B45309",
                            border: "1px solid #FDE68A",
                            borderRadius: "6px",
                            padding: "2px 7px",
                            fontSize: "9px",
                            marginTop: "4px",
                            display: "inline-block",
                          }}
                        >
                          {e.country}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`status-pill ${
                          e.status === "new"
                            ? "status-pill-new"
                            : "status-pill-contacted"
                        }`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background:
                              e.status === "new" ? "#F59E0B" : "#22C55E",
                            display: "inline-block",
                          }}
                        />
                        {e.status === "new" ? "New" : "Contacted"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleStatusUpdate(e.id, "contacted")
                          }
                          title="Mark as Contacted"
                          className="flex items-center justify-center rounded-xl transition-all duration-200"
                          style={{
                            width: "34px",
                            height: "34px",
                            background: "#F6F7FB",
                            border: "1px solid #EAECEF",
                            color: "#64748B",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(el) => {
                            el.currentTarget.style.background = "#F0FDF4";
                            el.currentTarget.style.borderColor = "#86EFAC";
                            el.currentTarget.style.color = "#16A34A";
                          }}
                          onMouseLeave={(el) => {
                            el.currentTarget.style.background = "#F6F7FB";
                            el.currentTarget.style.borderColor = "#EAECEF";
                            el.currentTarget.style.color = "#64748B";
                          }}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          title="Delete"
                          className="flex items-center justify-center rounded-xl transition-all duration-200"
                          style={{
                            width: "34px",
                            height: "34px",
                            background: "#F6F7FB",
                            border: "1px solid #EAECEF",
                            color: "#64748B",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(el) => {
                            el.currentTarget.style.background = "#FFF1F2";
                            el.currentTarget.style.borderColor = "#FECDD3";
                            el.currentTarget.style.color = "#BE123C";
                          }}
                          onMouseLeave={(el) => {
                            el.currentTarget.style.background = "#F6F7FB";
                            el.currentTarget.style.borderColor = "#EAECEF";
                            el.currentTarget.style.color = "#64748B";
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-7 py-3"
          style={{
            borderTop: "1px solid #F1F3F7",
            background: "#FAFBFC",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#22C55E" }}
            />
            <span
              className="admin-label-small"
              style={{ color: "#94A3B8", fontSize: "9px" }}
            >
              Live Data
            </span>
          </div>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "12px",
              color: "#CBD5E1",
            }}
          >
            {filteredEnquiries.length} records
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminEnquiries;
