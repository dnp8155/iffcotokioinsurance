import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSupabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, FileText, Eye, Pencil, Trash2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function Invoices() {
  const { logout } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('invoices').select('*').order('created_date', { ascending: false }).limit(200);
      if (error) throw error;
      setInvoices(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const supabase = await getSupabase();
      await supabase.from('invoices').delete().eq('id', pendingDelete.id);
      setPendingDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const fmtINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);

  const totalPremium = invoices.reduce((s, i) => s + (Number(i.gross_premium) || 0), 0);
  const totalSumInsured = invoices.reduce((s, i) => s + (Number(i.sum_insured) || 0), 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
              Invoices
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              IFFCO-TOKIO Pashu Dhan Bima Policy &amp; Tax Invoice
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link to="/invoices/new" className="flex-1 sm:flex-none">
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> New Invoice
              </Button>
            </Link>
            <Button variant="outline" onClick={() => logout()} className="px-3">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!loading && invoices.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground">Total Invoices</div>
              <div className="text-2xl font-bold mt-1">{invoices.length}</div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground">Total Gross Premium</div>
              <div className="text-2xl font-bold mt-1">{fmtINR(totalPremium)}</div>
            </div>
            <div className="bg-card rounded-lg border border-border p-4">
              <div className="text-xs text-muted-foreground">Total Sum Insured</div>
              <div className="text-2xl font-bold mt-1">{fmtINR(totalSumInsured)}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-lg border border-border">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No invoices yet.</p>
            <Link to="/invoices/new" className="inline-block mt-3">
              <Button variant="outline">Create your first invoice</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Invoice No.</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Policy No.</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Insured Name</th>
                    <th className="text-left px-4 py-3 font-medium whitespace-nowrap">Issuance Date</th>
                    <th className="text-right px-4 py-3 font-medium whitespace-nowrap">Gross Premium</th>
                    <th className="text-right px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{inv.tax_invoice_no || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.p400_policy || "—"}</td>
                      <td className="px-4 py-3">{inv.insured_name || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.issuance_date || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{fmtINR(inv.gross_premium)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Link to={`/invoices/${inv.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/invoices/${inv.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPendingDelete(inv)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden divide-y divide-border">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{inv.tax_invoice_no || "—"}</div>
                      <div className="text-sm text-muted-foreground truncate">{inv.insured_name || "—"}</div>
                    </div>
                    <div className="text-sm font-medium whitespace-nowrap tabular-nums">{fmtINR(inv.gross_premium)}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>Policy: {inv.p400_policy || "—"}</span>
                    <span>{inv.issuance_date || "—"}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link to={`/invoices/${inv.id}`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                    </Link>
                    <Link to={`/invoices/${inv.id}/edit`}>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(inv)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => { if (!open && !deleting) setPendingDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `Invoice "${pendingDelete.tax_invoice_no}" will be permanently deleted. This action cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}