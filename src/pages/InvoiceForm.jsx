import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import InvoicePreview from "@/components/invoice/InvoicePreview";

const emptyAnimal = () => ({
  rfid: "",
  breed: "",
  cattle_type: "",
  sum_insured: "",
  owner_name: "",
  loan_account: "",
});

const blankInvoice = () => ({
  tax_invoice_no: "",
  p400_policy: "",
  issuance_date: "",
  period_from: "",
  period_to: "",
  insured_name: "",
  address: "",
  place_of_supply: "",
  pin_code: "",
  ckyc: "",
  gstn: "",
  sum_insured: "",
  premium_taxable_value: "",
  gross_premium: "",
  hypothecation: "",
  purpose_of_animal: "",
  policy_excess: "",
  number_of_cattle: "",
  intermediary_no: "",
  intermediary_name: "",
  intermediary_phone: "",
  cgst_percentage: 9,
  sgst_percentage: 9,
  cgst_amount: "",
  sgst_amount: "",
  co_insurance_percentage: 100,
  pay_method: "",
  receipt_amount: "",
  instrument_no: "",
  instrument_date: "",
  bank: "",
  signature_name: "",
  signature_date: "",
  signature_reason: "",
  signature_location: "",
});

function Section({ title, children }) {
  return (
    <div className="bg-card rounded-lg border border-border p-5">
      <h2 className="text-base font-semibold mb-4 text-foreground">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, full, type = "text" }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 text-sm"
          rows={2}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 text-sm"
        />
      )}
    </div>
  );
}

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [inv, setInv] = useState(blankInvoice);
  const [animals, setAnimals] = useState([emptyAnimal()]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const supabase = await getSupabase();
        const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
        if (error) throw error;
        setInv({ ...blankInvoice(), ...data });
        try {
          const parsed = JSON.parse(data.animals || "[]");
          setAnimals(parsed.length ? parsed : [emptyAnimal()]);
        } catch {
          setAnimals([emptyAnimal()]);
        }
      } catch (e) {
        console.error('Failed to load invoice:', e);
      }
      setLoading(false);
    })();
  }, [id]);

  const previewInvoice = { ...inv, animals: JSON.stringify(animals) };

  const set = (key) => (val) => setInv((p) => ({ ...p, [key]: val }));

  const setAnimal = (i, key, val) =>
    setAnimals((prev) =>
      prev.map((a, idx) => (idx === i ? { ...a, [key]: val } : a))
    );

  const addAnimal = () => setAnimals((p) => [...p, emptyAnimal()]);
  const removeAnimal = (i) =>
    setAnimals((p) => p.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...inv,
        animals: JSON.stringify(animals),
        number_of_cattle: Number(inv.number_of_cattle) || animals.length,
        sum_insured: Number(inv.sum_insured) || 0,
        premium_taxable_value: Number(inv.premium_taxable_value) || 0,
        gross_premium: Number(inv.gross_premium) || 0,
        cgst_percentage: Number(inv.cgst_percentage) || 0,
        sgst_percentage: Number(inv.sgst_percentage) || 0,
        cgst_amount: Number(inv.cgst_amount) || 0,
        sgst_amount: Number(inv.sgst_amount) || 0,
        co_insurance_percentage: Number(inv.co_insurance_percentage) || 100,
        receipt_amount: Number(inv.receipt_amount) || 0,
      };
      const supabase = await getSupabase();
      if (isEdit) {
        const { error } = await supabase.from('invoices').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: row, error } = await supabase.from('invoices').insert({ ...payload, created_by_id: user.id }).select('*').single();
        if (error) throw error;
        navigate(`/invoices/${row.id}`);
        return;
      }
      navigate(`/invoices/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            </Link>
            <h1 className="text-2xl font-heading font-bold">
              {isEdit ? "Edit Invoice" : "New Invoice"}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(380px,44%)] gap-6 items-start">
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground bg-muted/40 rounded-md px-3 py-2">
            Live preview on the right updates as you type.
          </p>
          <Section title="Policy & Invoice Details">
            <Field label="Tax Invoice No." value={inv.tax_invoice_no} onChange={set("tax_invoice_no")} />
            <Field label="P400 Policy" value={inv.p400_policy} onChange={set("p400_policy")} />
            <Field label="Issuance/Invoice Date" value={inv.issuance_date} onChange={set("issuance_date")} />
            <Field label="Period of Insurance From" value={inv.period_from} onChange={set("period_from")} />
            <Field label="To: Midnight on" value={inv.period_to} onChange={set("period_to")} />
          </Section>

          <Section title="Insured Details">
            <Field label="Insured's Name" value={inv.insured_name} onChange={set("insured_name")} />
            <Field label="Address" value={inv.address} onChange={set("address")} type="textarea" full />
            <Field label="Place of Supply" value={inv.place_of_supply} onChange={set("place_of_supply")} />
            <Field label="Pin Code" value={inv.pin_code} onChange={set("pin_code")} />
            <Field label="CKYC #" value={inv.ckyc} onChange={set("ckyc")} />
            <Field label="GSTN" value={inv.gstn} onChange={set("gstn")} />
          </Section>

          <Section title="Intermediary Details">
            <Field label="Intermediary #" value={inv.intermediary_no} onChange={set("intermediary_no")} />
            <Field label="Intermediary Name" value={inv.intermediary_name} onChange={set("intermediary_name")} />
            <Field label="Intermediary Phone #" value={inv.intermediary_phone} onChange={set("intermediary_phone")} />
          </Section>

          <Section title="Premium Details">
            <Field label="Sum Insured (INR)" value={inv.sum_insured} onChange={set("sum_insured")} type="number" />
            <Field label="Premium/Taxable Value (INR)" value={inv.premium_taxable_value} onChange={set("premium_taxable_value")} type="number" />
            <Field label="Gross Premium Payable (INR)" value={inv.gross_premium} onChange={set("gross_premium")} type="number" />
            <Field label="Hypothecation" value={inv.hypothecation} onChange={set("hypothecation")} />
            <Field label="Purpose Of Animal" value={inv.purpose_of_animal} onChange={set("purpose_of_animal")} />
            <Field label="Policy Excess" value={inv.policy_excess} onChange={set("policy_excess")} />
            <Field label="Number Of Cattle" value={inv.number_of_cattle} onChange={set("number_of_cattle")} type="number" />
            <Field label="Co-Insurance %" value={inv.co_insurance_percentage} onChange={set("co_insurance_percentage")} type="number" />
          </Section>

          <Section title="GST Details">
            <Field label="CGST Percentage" value={inv.cgst_percentage} onChange={set("cgst_percentage")} type="number" />
            <Field label="SGST Percentage" value={inv.sgst_percentage} onChange={set("sgst_percentage")} type="number" />
            <Field label="CGST Amount" value={inv.cgst_amount} onChange={set("cgst_amount")} type="number" />
            <Field label="SGST Amount" value={inv.sgst_amount} onChange={set("sgst_amount")} type="number" />
          </Section>

          <div className="bg-card rounded-lg border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Animals Insured</h2>
              <Button variant="outline" size="sm" onClick={addAnimal}>
                <Plus className="w-4 h-4 mr-1" /> Add Animal
              </Button>
            </div>
            <div className="space-y-3">
              {animals.map((a, i) => (
                <div key={i} className="border border-border rounded-md p-3 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Animal #{i + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAnimal(i)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Field label="RFID # / Manual Tag #" value={a.rfid} onChange={(v) => setAnimal(i, "rfid", v)} />
                    <Field label="Type Of Breed" value={a.breed} onChange={(v) => setAnimal(i, "breed", v)} />
                    <Field label="Type Of Cattle" value={a.cattle_type} onChange={(v) => setAnimal(i, "cattle_type", v)} />
                    <Field label="Sum Insured (Rs.)" value={a.sum_insured} onChange={(v) => setAnimal(i, "sum_insured", v)} type="number" />
                    <Field label="Cattle Owner Name" value={a.owner_name} onChange={(v) => setAnimal(i, "owner_name", v)} />
                    <Field label="Loan Account #" value={a.loan_account} onChange={(v) => setAnimal(i, "loan_account", v)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Section title="Receipt Particulars">
            <Field label="Pay Method" value={inv.pay_method} onChange={set("pay_method")} />
            <Field label="Receipt Amount" value={inv.receipt_amount} onChange={set("receipt_amount")} type="number" />
            <Field label="Instrument #" value={inv.instrument_no} onChange={set("instrument_no")} />
            <Field label="Instrument Date" value={inv.instrument_date} onChange={set("instrument_date")} />
            <Field label="Bank" value={inv.bank} onChange={set("bank")} />
          </Section>

          <Section title="Digital Signature">
            <Field label="Signature Name" value={inv.signature_name} onChange={set("signature_name")} />
            <Field label="Signature Date" value={inv.signature_date} onChange={set("signature_date")} />
            <Field label="Signature Reason" value={inv.signature_reason} onChange={set("signature_reason")} />
            <Field label="Signature Location" value={inv.signature_location} onChange={set("signature_location")} />
          </Section>
        </div>

        <div className="lg:sticky lg:top-4">
          <div className="text-sm font-semibold mb-2 text-muted-foreground">Live Preview</div>
          <InvoicePreview invoice={previewInvoice} />
        </div>
        </div>
      </div>
    </div>
  );
}