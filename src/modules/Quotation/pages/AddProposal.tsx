import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getStorage, setStorage } from "../../../utils/storage";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { useToast } from "../../../hooks/useToast";
import {
  Proposal,
  ProposalStatus,
  RequirementSection,
  EstimationLineItem,
  EstimationSection,
  QuotationSection,
  initialProposals,
} from "../data/quotationsData";
import { FiPlus, FiTrash2, FiXCircle, FiUser, FiList, FiDollarSign, FiFileText } from "react-icons/fi";

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  "UI/UX Design", "Frontend", "Backend", "Mobile App", "Integration",
  "Data Engineering", "Testing", "Deployment", "Documentation",
  "Consulting", "Maintenance", "Other",
];



// ─── Helpers ────────────────────────────────────────────────────────────────

function generateId(arr: { id: number }[]): number {
  return arr.length > 0 ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

// ─── Empty Templates ────────────────────────────────────────────────────────

const EMPTY_REQUIREMENT: RequirementSection = {
  overview: "",
  objectives: [""],
  technicalRequirements: [""],
  deliverables: [""],
  assumptions: [""],
  constraints: [""],
};

const EMPTY_ESTIMATION_ITEM: EstimationLineItem = {
  id: "", category: "Development", description: "", quantity: 1, unit: "Project", unitPrice: 0, amount: 0,
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function AddProposal() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [formLeadName, setFormLeadName] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formLeadEmail, setFormLeadEmail] = useState("");
  const [formLeadPhone, setFormLeadPhone] = useState("");
  const [formStatus, setFormStatus] = useState<ProposalStatus>("Draft");
  
  // Inline validation errors for required fields
  const [formLeadNameError, setFormLeadNameError] = useState("");
  const [formCompanyNameError, setFormCompanyNameError] = useState("");

  const [formRequirement, setFormRequirement] = useState<RequirementSection>(EMPTY_REQUIREMENT);
  const [formEstimationItems, setFormEstimationItems] = useState<EstimationLineItem[]>([]);
  const [formDiscountPct, setFormDiscountPct] = useState(0);
  const [formTaxPct, setFormTaxPct] = useState(18);

  const [formPaymentTerms, setFormPaymentTerms] = useState("");
  const [formValidityDays, setFormValidityDays] = useState(30);
  const [formDeliveryTimeline, setFormDeliveryTimeline] = useState("");
  const [formWarranty, setFormWarranty] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formTnC, setFormTnC] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const rawProposals = getStorage<Proposal[]>("saiflow_proposals", initialProposals);
      // Validate stored data — fall back to sample data if stale
      const proposals = rawProposals.length > 0 && (!rawProposals[0].requirement || !rawProposals[0].proposalNo)
        ? initialProposals
        : rawProposals;
      const proposal = proposals.find((p) => p.id === Number(id));
      if (proposal) {
        setFormLeadName(proposal.leadName);
        setFormCompanyName(proposal.companyName);
        setFormLeadEmail(proposal.leadEmail);
        setFormLeadPhone(proposal.leadPhone);
        setFormStatus(proposal.status);
        setFormRequirement(proposal.requirement);
        setFormEstimationItems(proposal.estimation.items);
        setFormDiscountPct(proposal.estimation.discountPercent);
        setFormTaxPct(proposal.estimation.taxPercent);
        setFormPaymentTerms(proposal.quotation.paymentTerms);
        setFormValidityDays(proposal.quotation.validityDays);
        setFormDeliveryTimeline(proposal.quotation.deliveryTimeline);
        setFormWarranty(proposal.quotation.warrantyPeriod);
        setFormNotes(proposal.quotation.notes);
        setFormTnC(proposal.quotation.termsAndConditions);
      } else {
        showToast("Proposal not found.", "error");
        navigate("/quotations");
        return;
      }
    }
    setLoading(false);
  }, [id, isEditMode, navigate, showToast]);

  // ── Requirement Array Helpers ──────────────────────────────────────────────

  const updateReqArray = (
    field: "objectives" | "technicalRequirements" | "deliverables" | "assumptions" | "constraints",
    index: number, value: string
  ) => {
    setFormRequirement((prev) => ({ ...prev, [field]: prev[field].map((item, i) => (i === index ? value : item)) }));
  };

  const addReqArrayItem = (field: "objectives" | "technicalRequirements" | "deliverables" | "assumptions" | "constraints") => {
    setFormRequirement((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeReqArrayItem = (field: "objectives" | "technicalRequirements" | "deliverables" | "assumptions" | "constraints", index: number) => {
    setFormRequirement((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  // ── Estimation Item Helpers ────────────────────────────────────────────────

  const addEstimationItem = () => {
    const newItem: EstimationLineItem = { ...EMPTY_ESTIMATION_ITEM, id: `li-${Date.now()}`, amount: 0 };
    setFormEstimationItems([...formEstimationItems, newItem]);
  };

  const removeEstimationItem = (itemId: string) => {
    setFormEstimationItems(formEstimationItems.filter((i) => i.id !== itemId));
  };

  const updateEstimationItem = (itemId: string, field: keyof EstimationLineItem, value: string | number) => {
    setFormEstimationItems(
      formEstimationItems.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(value) : item.quantity;
          const price = field === "unitPrice" ? Number(value) : item.unitPrice;
          updated.amount = qty * price;
        }
        return updated;
      })
    );
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const validateBasicFields = (): boolean => {
    const errors: string[] = [];
    if (!formLeadName.trim()) errors.push("Lead name is required.");
    if (!formCompanyName.trim()) errors.push("Company name is required.");
    if (errors.length > 0) {
      showToast(errors.join(" "), "error");
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateBasicFields()) return;

    const subtotal = formEstimationItems.reduce((s, i) => s + i.amount, 0);
    const discountAmount = Math.round(subtotal * (formDiscountPct / 100));
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = Math.round(afterDiscount * (formTaxPct / 100));
    const total = afterDiscount + taxAmount;

    const requirements = {
      overview: formRequirement.overview,
      objectives: formRequirement.objectives.filter((o) => o.trim()),
      technicalRequirements: formRequirement.technicalRequirements.filter((t) => t.trim()),
      deliverables: formRequirement.deliverables.filter((d) => d.trim()),
      assumptions: formRequirement.assumptions.filter((a) => a.trim()),
      constraints: formRequirement.constraints.filter((c) => c.trim()),
    };

    const estimation: EstimationSection = {
      items: formEstimationItems.filter((i) => i.description.trim()),
      subtotal, discountPercent: formDiscountPct, discountAmount,
      taxPercent: formTaxPct, taxAmount, total,
    };

    const quotation: QuotationSection = {
      paymentTerms: formPaymentTerms, validityDays: formValidityDays,
      deliveryTimeline: formDeliveryTimeline, warrantyPeriod: formWarranty,
      paymentMilestones: [], notes: formNotes, termsAndConditions: formTnC,
    };

    let allProposals = getStorage<Proposal[]>("saiflow_proposals", initialProposals);
    if (allProposals.length > 0 && (!allProposals[0].requirement || !allProposals[0].proposalNo)) {
      allProposals = initialProposals;
      setStorage("saiflow_proposals", initialProposals);
    }

    if (isEditMode) {
      const updated = allProposals.map((p) => {
        if (p.id !== Number(id)) return p;
        return {
          ...p,
          leadName: formLeadName.trim(),
          companyName: formCompanyName.trim(),
          leadEmail: formLeadEmail.trim(),
          leadPhone: formLeadPhone.trim(),
          status: formStatus,
          updatedAt: new Date().toISOString().split("T")[0],
          requirement: requirements,
          estimation,
          quotation,
          workflowLogs: [
            ...p.workflowLogs,
            {
              id: generateId(p.workflowLogs),
              action: "Proposal updated",
              fromStatus: p.status, toStatus: formStatus,
              timestamp: new Date().toISOString(),
              performedBy: "Current User",
              notes: "Proposal content updated via edit page",
            },
          ],
        };
      });
      setStorage("saiflow_proposals", updated);
      showToast("Proposal updated successfully.", "success");
    } else {
      const newProposal: Proposal = {
        id: allProposals.length > 0 ? Math.max(...allProposals.map((p) => p.id)) + 1 : 1,
        proposalNo: `BP-${new Date().getFullYear()}-${String(allProposals.length + 1).padStart(3, "0")}`,
        leadName: formLeadName.trim(),
        companyName: formCompanyName.trim(),
        leadEmail: formLeadEmail.trim(),
        leadPhone: formLeadPhone.trim(),
        status: formStatus,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
        requirement: requirements,
        estimation,
        quotation,
        workflowLogs: [{
          id: 1, action: "Proposal created",
          fromStatus: "Draft", toStatus: formStatus,
          timestamp: new Date().toISOString(),
          performedBy: "Current User", notes: "New proposal created",
        }],
      };
      setStorage("saiflow_proposals", [...allProposals, newProposal]);
      showToast("Proposal created successfully.", "success");
    }
    navigate("/quotations");
  };

  const handleCancel = () => navigate("/quotations");

  // ── Quick total preview ────────────────────────────────────────────────────

  const totalPreview = (() => {
    const sub = formEstimationItems.reduce((s, i) => s + i.amount, 0);
    const disc = Math.round(sub * (formDiscountPct / 100));
    const tax = Math.round((sub - disc) * (formTaxPct / 100));
    return { subtotal: sub, discount: disc, tax, total: sub - disc + tax };
  })();

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>;
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <PageMeta
        title={isEditMode ? "Edit Proposal | SaiFlow" : "New Proposal | SaiFlow"}
        description={isEditMode ? "Edit an existing business proposal." : "Create a new business proposal with requirement, estimation, and pricing."}
      />
      <PageBreadcrumb pageTitle={isEditMode ? "Edit proposal" : "New proposal"} />

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
        {/* ── Lead Information ──────────────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
            <FiUser className="size-4 text-brand-500" /> Lead Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Lead Name <span className="text-error-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. John Doe"
                value={formLeadName}
                onChange={(e) => { setFormLeadName(e.target.value); if (e.target.value.trim() && formLeadNameError) setFormLeadNameError(""); }}
                onBlur={() => { if (!formLeadName.trim()) setFormLeadNameError("Lead name is required."); else setFormLeadNameError(""); }}
                error={!!formLeadNameError}
                hint={formLeadNameError || undefined}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">
                Company Name <span className="text-error-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Acme Corp"
                value={formCompanyName}
                onChange={(e) => { setFormCompanyName(e.target.value); if (e.target.value.trim() && formCompanyNameError) setFormCompanyNameError(""); }}
                onBlur={() => { if (!formCompanyName.trim()) setFormCompanyNameError("Company name is required."); else setFormCompanyNameError(""); }}
                error={!!formCompanyNameError}
                hint={formCompanyNameError || undefined}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Email</label>
              <Input type="text" placeholder="john@acme.com" value={formLeadEmail} onChange={(e) => setFormLeadEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Phone</label>
              <Input type="text" placeholder="+1 555-0000" value={formLeadPhone} onChange={(e) => setFormLeadPhone(e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Requirement ───────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
            <FiList className="size-4 text-brand-500" /> Requirement
          </h3>
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Overview</label>
            <textarea value={formRequirement.overview}
              onChange={(e) => setFormRequirement((p) => ({ ...p, overview: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-800 dark:text-white/90 resize-none h-20"
              placeholder="Brief overview of the project..." />
          </div>
          {(["objectives", "technicalRequirements", "deliverables", "assumptions", "constraints"] as const).map((field) => (
            <div key={field} className="mb-3">
              <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400 capitalize">
                {field.replace(/([A-Z])/g, " $1").trim()}
              </label>
              {formRequirement[field].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1.5">
                  <input value={item}
                    onChange={(e) => updateReqArray(field, idx, e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 dark:border-gray-800 dark:text-white/90"
                    placeholder={`Add ${field.replace(/([A-Z])/g, " $1").toLowerCase().slice(0, -1)}...`} />
                  {formRequirement[field].length > 1 && (
                    <button type="button" onClick={() => removeReqArrayItem(field, idx)}
                      className="text-red-400 hover:text-red-600 cursor-pointer shrink-0 p-1">
                      <FiXCircle className="size-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => addReqArrayItem(field)}
                className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 mt-1 cursor-pointer">
                <FiPlus className="size-3" /> Add more
              </button>
            </div>
          ))}
        </div>

        {/* ── Estimation ────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
            <FiDollarSign className="size-4 text-brand-500" /> Estimation
          </h3>

          <div className="overflow-x-auto mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="text-left py-2 px-2 text-xs text-gray-500">Category</th>
                  <th className="text-left py-2 px-2 text-xs text-gray-500">Description</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-500">Qty</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-500">Unit Price</th>
                  <th className="text-right py-2 px-2 text-xs text-gray-500">Amount</th>
                  <th className="w-8 py-2 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {formEstimationItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5 px-2">
                      <select value={item.category}
                        onChange={(e) => updateEstimationItem(item.id, "category", e.target.value)}
                        className="w-28 rounded border border-gray-200 bg-transparent px-2 py-1.5 text-xs text-gray-800 dark:border-gray-800 dark:text-white/90">
                        {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                    <td className="py-1.5 px-2">
                      <input value={item.description}
                        onChange={(e) => updateEstimationItem(item.id, "description", e.target.value)}
                        className="w-full min-w-32 rounded border border-gray-200 bg-transparent px-2 py-1.5 text-xs text-gray-800 dark:border-gray-800 dark:text-white/90"
                        placeholder="Description" />
                    </td>
                    <td className="py-1.5 px-2">
                      <input type="number" value={item.quantity}
                        onChange={(e) => updateEstimationItem(item.id, "quantity", Number(e.target.value))}
                        className="w-16 rounded border border-gray-200 bg-transparent px-2 py-1.5 text-xs text-right text-gray-800 dark:border-gray-800 dark:text-white/90" min="0" />
                    </td>
                    <td className="py-1.5 px-2">
                      <input type="number" value={item.unitPrice}
                        onChange={(e) => updateEstimationItem(item.id, "unitPrice", Number(e.target.value))}
                        className="w-24 rounded border border-gray-200 bg-transparent px-2 py-1.5 text-xs text-right text-gray-800 dark:border-gray-800 dark:text-white/90" min="0" />
                    </td>
                    <td className="py-1.5 px-2 text-right text-xs font-medium text-gray-800 dark:text-white">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-1.5 px-2">
                      <button type="button" onClick={() => removeEstimationItem(item.id)}
                        className="text-red-400 hover:text-red-600 cursor-pointer">
                        <FiTrash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={addEstimationItem}
            className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1 mb-3 cursor-pointer">
            <FiPlus className="size-3" /> Add Line Item
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">Discount (%)</label>
              <Input type="number" value={String(formDiscountPct)} onChange={(e) => setFormDiscountPct(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">Tax (%)</label>
              <Input type="number" value={String(formTaxPct)} onChange={(e) => setFormTaxPct(Number(e.target.value))} />
            </div>
          </div>

          {/* Total Preview */}
          <div className="mt-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg flex items-center justify-end gap-4 text-sm flex-wrap">
            <span className="text-gray-500 dark:text-gray-400">
              Subtotal: <strong>{formatCurrency(totalPreview.subtotal)}</strong>
            </span>
            {formDiscountPct > 0 && <span className="text-red-500">-{formatCurrency(totalPreview.discount)}</span>}
            <span className="text-gray-500 dark:text-gray-400">
              Tax: <strong>{formatCurrency(totalPreview.tax)}</strong>
            </span>
            <span className="text-base font-bold text-brand-600 dark:text-brand-400">
              Total: {formatCurrency(totalPreview.total)}
            </span>
          </div>
        </div>

        {/* ── Quotation / Pricing Terms ─────────────────────────────────────── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
            <FiFileText className="size-4 text-brand-500" /> Quotation / Pricing Terms
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Payment Terms</label>
              <Input type="text" placeholder="e.g. Net 30, Milestone-based" value={formPaymentTerms} onChange={(e) => setFormPaymentTerms(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Validity (days)</label>
              <Input type="number" value={String(formValidityDays)} onChange={(e) => setFormValidityDays(Number(e.target.value))} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Delivery Timeline</label>
              <Input type="text" placeholder="e.g. 12 weeks from kickoff" value={formDeliveryTimeline} onChange={(e) => setFormDeliveryTimeline(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Warranty Period</label>
              <Input type="text" placeholder="e.g. 6 months post-deployment" value={formWarranty} onChange={(e) => setFormWarranty(e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Notes</label>
            <textarea value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-800 dark:text-white/90 resize-none h-16"
              placeholder="Additional notes..." />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Terms &amp; Conditions</label>
            <textarea value={formTnC} onChange={(e) => setFormTnC(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-800 dark:text-white/90 resize-none h-20"
              placeholder="Enter terms and conditions..." />
          </div>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button size="sm" type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" type="submit">
            {isEditMode ? "Update Proposal" : "Create Proposal"}
          </Button>
        </div>
      </form>
    </>
  );
}
