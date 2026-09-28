import { LOGO_BASE64, QR_BASE64 } from "./invoiceAssets";

// Helper to escape user input for safe HTML injection
const esc = (v) =>
  String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Build the animal rows table HTML from the animals array
const animalRows = (animals) => {
  const list = Array.isArray(animals) ? animals : [];
  if (!list.length) {
    return `<tr><td colspan="7" class="c" style="height:15pt"></td></tr>`;
  }
  return list
    .map(
      (a, i) => `<tr>
<td class='c'>${i + 1}</td>
<td class='c'>${esc(a.rfid)}</td>
<td class='c'>${esc(a.breed)}</td>
<td class='c'>${esc(a.cattle_type)}</td>
<td class='c'>${esc(a.sum_insured)}</td>
<td class='c'>${esc(a.owner_name)}</td>
<td>${esc(a.loan_account)}</td>
</tr>`
    )
    .join("\n");
};

// Generate the full HTML document matching the original IFFCO-TOKIO template exactly,
// with dynamic data injected. Adds the "Muskurate Raho" tagline present in the original.
export function generateInvoiceHTML(inv, options = {}) {
  const qrSvg = options.qrSvg || null;
  const qrSrc = options.qrSrc || QR_BASE64;
  const qrMarkup = qrSvg
    ? qrSvg
    : `<img src="${qrSrc}" alt="Policy QR code" style="width:88pt;height:88pt" />`;
  const animals = (() => {
    try {
      return JSON.parse(inv.animals || "[]");
    } catch {
      return [];
    }
  })();

  const sigName = esc(inv.signature_name || "MOHINDRA SINGH INDOLIA");
  const sigDate = esc(inv.signature_date || "2026.02.20 16:36:04 IST");
  const sigReason = esc(inv.signature_reason || "Valid Policy Copy");
  const sigLocation = esc(
    inv.signature_location || "IFFCO Tokio General Insurance Company Ltd, India"
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pashu Dhan Bima Policy (Micro Insurance) &amp; Tax Invoice - ${esc(
    inv.p400_policy
  )}</title>
<style>
  @page { size: letter; margin: 0; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0;
    background: #5c5c5c; color: #000;
    font-family: Helvetica, Arial, "Liberation Sans", sans-serif;
    font-weight: 400;
  }
  .page {
    width: 612pt; height: 792pt; background: #fff;
    margin: 16px auto; padding: 0; position: relative; overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,.35);
  }
  .sheet { margin: 23.7pt 36pt 0 35pt; width: 541pt; }
  table.g {
    width: 100%; border-collapse: collapse; table-layout: fixed;
  }
  table.g + table.g { margin-top: -0.6pt; }
  table.g > tbody > tr > td, table.g > tr > td {
    border: 0.6pt solid #000; vertical-align: top;
    padding: 1pt 3pt; font-size: 7pt; line-height: 1.2; font-weight: 400;
  }
  table.kv {
    width: 100%; border-collapse: collapse; table-layout: fixed;
  }
  table.kv td {
    border: 0; padding: 0.6pt 3pt; font-size: 7pt; line-height: 1.2;
    font-weight: 400; vertical-align: top;
  }
  table.kv td.k {
    text-align: right; white-space: nowrap; padding-right: 4pt;
  }
  table.kv td.v { text-align: left; padding-left: 4pt; }
  table.split td.k { border-right: 0.6pt solid #000; }
  .inv-cell { position: relative; }
  .inv-cell::after {
    content: ""; position: absolute; top: 0; bottom: 0; left: 48%;
    border-left: 0.6pt solid #000; pointer-events: none;
  }
  table.prem td.k {
    text-align: left; white-space: normal; border-right: 0.6pt solid #000;
    padding: 0.7pt 4pt 0.7pt 3pt;
  }
  table.prem td.v { padding: 0.7pt 4pt; }
  .c { text-align: center; }
  .b, .b td, td.b, tr.b > td, tr.b td, b, strong { font-weight: 700 !important; }
  .company .s11, .company .s9, .company .tiny.u { font-weight: 700 !important; }
  .disc, .conditions, .conditions table.kv td, .cancellation { font-weight: 700 !important; }
  .animals .animal-head td, .animals .animal-title { font-weight: 700 !important; }
  .warranty-title { font-size: 10pt; font-weight: 700 !important; }
  .tagline { font-weight: 700 !important; }
  .tiny { font-size: 6pt; }
  .s8 { font-size: 8pt; }
  .s9 { font-size: 9pt; }
  .s11 { font-size: 11pt; }
  .u { text-decoration: underline; }
  .pad0 { padding: 0 !important; }
  .vmid { vertical-align: middle !important; }
  .company { text-align: center; padding: 0 3pt 3pt !important; }
  .company img.logo { height: 50pt; width: auto; max-width: 100%; display: block; margin: 0 auto 1pt; object-fit: contain; }
  .tagline { font-size: 8pt; font-weight: 700; margin: 0 0 2pt; }
  .qr-wrap { height: 112pt; display: flex; align-items: center; justify-content: center; }
  .qr-wrap img, .qr-wrap svg { width: 88pt; height: 88pt; image-rendering: pixelated; }
  .animals td { height: 15pt; vertical-align: middle !important; padding: 0 2pt !important; }
  .disc { font-size: 7pt; line-height: 1.18; padding: 1.5pt 3.5pt 2.5pt !important; }
  .app {
    margin: 22pt 36pt 0 35pt; width: 541pt;
    font-size: 10pt; line-height: 1.28; font-weight: 400;
  }
  .app a { color: #00f; }
  .sig-wrap {
    position: absolute; left: 40pt; top: 726pt; width: 320pt; z-index: 5;
    background: transparent;
  }
  #page1 .sig-wrap { top: 714pt; }
  .sig-text {
    position: relative; z-index: 2; font-size: 7pt; line-height: 1.13; font-weight: 400; color: #000; opacity: .8;
  }
  .sig-text .sig-body { position: relative; z-index: 3; }
  .sig-text .title {
    font-size: 11pt; line-height: 1.05; font-weight: 700; margin: 0 0 1pt; color: #000;
  }
  .sig-icon {
    position: absolute; left: calc(50% - 80px); top: 2pt;
    transform: translateX(-50%) scaleX(.82);
    transform-origin: top center;
    color: #ffff99; font: 700 47.5pt/1 Helvetica, Arial, sans-serif;
    text-shadow: 1.2pt 1.2pt 0 #000, 0.6pt 0.6pt 0.8pt rgba(0,0,0,.5);
    z-index: 1; opacity: .95;
    user-select: none; pointer-events: none;
  }
  @media print {
    html, body { background: #fff; }
    .page { margin: 0; box-shadow: none; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
  }
</style>
</head>
<body>

<div class="page" id="page1">
  <div class="sheet">
    <table class="g">
      <colgroup>
        <col style="width:127pt">
        <col style="width:208pt">
        <col style="width:206pt">
      </colgroup>
      <tr>
        <td rowspan="2" class="pad0 vmid">
          <div class="qr-wrap">${qrMarkup}</div>
        </td>
        <td rowspan="2" class="company">
          <img class="logo" src="${LOGO_BASE64}" alt="IFFCO-TOKIO">
          <div class="s11">IFFCO-TOKIO GENERAL<br>INSURANCE CO.LTD</div>
          <div class="tiny" style="margin-top:2pt;font-weight:400">Regd. Office: IFFCO Sadan C1 Distt. Centre, Saket,<br>New Delhi – 110017</div>
          <div class="s9 u" style="margin-top:3pt">Pashu Dhan Bima Policy ( Micro Insurance )</div>
          <div class="s9 u">&amp; Tax Invoice</div>
          <div class="tiny u" style="margin-top:1pt">UIN :-IRDAN106P0014V01200809</div>
        </td>
        <td>
          <div class="s9 b u">Servicing Office</div>
          <div>IFFCO TOKIO GEN INS CO LTD Vrundavan Arcade, F-<br>7(5,6,8),<br>Second Floor, Vrundavan Arcade<br>PATAN GUJARAT</div>
          <div style="margin-top:7pt">General Insurance Services: <b>997139</b></div>
          <div><b>GSTIN:</b> 24AAACI7573H1ZI</div>
        </td>
      </tr>
      <tr>
        <td class="pad0 inv-cell">
          <table class="kv inv">
            <colgroup><col style="width:48%"><col style="width:52%"></colgroup>
            <tr><td class="k b">Intermediary #:</td><td class="v">${esc(
              inv.intermediary_no
            )}</td></tr>
            <tr><td class="k b">Intermediary Name:</td><td class="v">${esc(
              inv.intermediary_name
            )}</td></tr>
            <tr><td class="k b">Intermediary Phone #:</td><td class="v">${esc(
              inv.intermediary_phone
            )}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table class="g">
      <colgroup>
        <col style="width:335pt">
        <col style="width:206pt">
      </colgroup>
      <tr>
        <td class="pad0">
          <table class="kv split">
            <colgroup><col style="width:127pt"><col></colgroup>
            <tr><td class="k b">Insured's Name:</td><td class="v b">${esc(
              inv.insured_name
            )}</td></tr>
            <tr><td class="k b">Address:</td><td class="v b">${esc(
              inv.address
            )}</td></tr>
          </table>
        </td>
        <td class="pad0 inv-cell" rowspan="2">
          <table class="kv inv">
            <colgroup><col style="width:48%"><col style="width:52%"></colgroup>
            <tr><td class="k b">Tax Invoice No.:</td><td class="v b">${esc(
              inv.tax_invoice_no
            )}</td></tr>
            <tr><td class="k b">P400 Policy:</td><td class="v b">${esc(
              inv.p400_policy
            )}</td></tr>
            <tr><td class="k">Issuance/Invoice Date:</td><td class="v">${esc(
              inv.issuance_date
            )}</td></tr>
            <tr><td class="k">Period of Insurance From:</td><td class="v">${esc(
              inv.period_from
            )}</td></tr>
            <tr><td class="k">To: Midnight on:</td><td class="v">${esc(
              inv.period_to
            )}</td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td class="pad0">
          <table class="kv split">
            <colgroup><col style="width:127pt"><col></colgroup>
            <tr><td class="k">Place of Supply:</td><td class="v b">${esc(
              inv.place_of_supply
            )}</td></tr>
            <tr><td class="k">Pin code:</td><td class="v b">${esc(
              inv.pin_code
            )}</td></tr>
            <tr><td class="k b">CKYC #:</td><td class="v b">${esc(
              inv.ckyc
            )}</td></tr>
            <tr><td class="k b">GSTN:</td><td class="v">${esc(
              inv.gstn
            )}</td></tr>
          </table>
        </td>
      </tr>
    </table>

    <table class="g">
      <colgroup>
        <col style="width:335pt">
        <col style="width:206pt">
      </colgroup>
      <tr>
        <td class="c b">Premium Details</td>
        <td class="b">Co-Insurance Details</td>
      </tr>
      <tr>
        <td class="pad0">
          <table class="kv prem">
            <colgroup><col style="width:128pt"><col></colgroup>
            <tr><td class="k b">Sum Insured (INR)</td><td class="v">${esc(
              inv.sum_insured
            )}</td></tr>
            <tr><td class="k b">Premium/Taxable Value (INR)</td><td class="v">${esc(
              inv.premium_taxable_value
            )}</td></tr>
            <tr><td class="k b">Gross Premium Payable / Invoice<br>Value (INR)</td><td class="v">${esc(
              inv.gross_premium
            )}</td></tr>
            <tr><td class="k b">Hypothecation</td><td class="v">${esc(
              inv.hypothecation
            )}</td></tr>
            <tr><td class="k b">Purpose Of Animal</td><td class="v">${esc(
              inv.purpose_of_animal
            )}</td></tr>
            <tr><td class="k b">Policy Excess</td><td class="v">${esc(
              inv.policy_excess
            )}</td></tr>
            <tr><td class="k b">Number Of Cattle</td><td class="v">${esc(
              inv.number_of_cattle
            )}</td></tr>
          </table>
        </td>
        <td class="b">IFFCO TOKIO General Insurance Co. Ltd.<span style="float:right">${esc(
          inv.co_insurance_percentage
        )}%</span></td>
      </tr>
    </table>

    <table class="g">
      <colgroup>
        <col style="width:86pt"><col style="width:91pt"><col style="width:91pt"><col style="width:91pt"><col style="width:91pt"><col style="width:91pt">
      </colgroup>
      <tr class="tiny c b">
        <td></td><td>CGST</td><td>SGST</td><td>UTGST</td><td>IGST</td><td>CESS</td>
      </tr>
      <tr class="tiny">
        <td class="b">Percentage</td><td class="c">${esc(
          inv.cgst_percentage
        )}</td><td class="c">${esc(inv.sgst_percentage)}</td><td></td><td></td><td></td>
      </tr>
      <tr class="tiny">
        <td class="b">Amount</td><td class="c">${esc(
          inv.cgst_amount
        )}</td><td class="c">${esc(inv.sgst_amount)}</td><td class="c">0.00</td><td class="c">0.00</td><td></td>
      </tr>
      <tr>
        <td colspan="6" class="disc">
"Whether GST is Payable on Reserve Changes Basis – No.<br>
We hereby declare that though our aggregate turnover in any preceding financial year from 2017-18 onwards is more than the aggregate turnover notified under sub-rule (4) of rule 48, we are not required to prepare an invoice in terms of the provisions of the said sub-rule."<br>
Disclaimer: - The issuance of this Insurance Policy is subject to satisfactory verification of KYC documentation of the Client/ Policyholder as per IRDAI Master Circular dated 1st August 2022 on AML/ CFT. In case, if any discrepancy is found in KYC Verification of the Client/ Policyholder, it is agreed by the Client/ Policyholder to complete/ rectify the discrepancy found in the KYC documents/information for the generation of CKYC Number, failing which the policy will be considered ineffective/suspended/ cancelled and no claim will be payable under this Insurance Policy.<br>
In case this policy is cancelled for any reason before 31st October of the following year, the refund calculated as per terms of the policy along with corresponding amount of GST would be refunded. However, in case this policy is cancelled beyond the said date (31st October of the following year), only the refund calculated as per terms of the policy would be refunded and any GST amount would NOT be refunded owing to the restrictions prescribed under the GST law.<br>
However, an unregistered GST customer can apply for refund of the GST amount from the government directly in FORM GST RFD-01 (along with relevant documents), within the prescribed timelines as per Circular No. 188/20/2022-GST dated 27/12/2022.
        </td>
      </tr>
    </table>

    <table class="g animals">
      <colgroup>
        <col style="width:32pt"><col style="width:88pt"><col style="width:68pt"><col style="width:60pt"><col style="width:72pt"><col style="width:135pt"><col style="width:86pt">
      </colgroup>
      <tr><td colspan="7" class="c animal-title" style="height:12pt;vertical-align:middle">Description of Animals Insured ( PDM )</td></tr>
      <tr class="c animal-head">
        <td>S.No</td>
        <td>RFID # / Manual Tag #</td>
        <td>Type Of Breed</td>
        <td>Type Of Cattle</td>
        <td>Sum Insured (Rs.)</td>
        <td>Cattle Owner Name</td>
        <td>Loan Account #</td>
      </tr>
      ${animalRows(animals)}
    </table>

    <table class="g">
      <tr>
        <td class="warranty-title" style="padding:3pt 4pt">Warranty:</td>
      </tr>
      <tr>
        <td style="padding:3pt 4pt;font-size:7pt">Notwithstanding anything stated to the contrary, it is here by declared and agreed that the coverage under the policy excludes the risk of Terrorism Damage as per printed clause attached.</td>
      </tr>
      <tr>
        <td class="s8 b" style="padding:3pt 4pt">Special Condition:</td>
      </tr>
    </table>
  </div>

  <div class="sig-wrap">
    <div class="sig-text">
      <div class="sig-body">
        <div class="title">Signature Not Verified</div>
        Digitally signed by ${sigName}<br>
        Date: ${sigDate}<br>
        Reason: ${sigReason}<br>
        Location: ${sigLocation}
      </div>
      <span class="sig-icon" aria-hidden="true">?</span>
    </div>
  </div>
</div>

<div class="page" id="page2">
  <div class="sheet">
    <table class="g">
      <tr>
        <td class="conditions" style="padding:4pt 8pt 6pt;font-size:7pt;line-height:1.22">
          <table class="kv">
            <colgroup><col style="width:18pt"><col></colgroup>
            <tr>
              <td style="border:0;padding-top:1pt">1.</td>
              <td style="border:0">No Tag no claim: Claims shall not be entertained unless the ear tags are surrendered to the company in intact form along with the claim documents.<br>Broken tags will not be considered.</td>
            </tr>
            <tr>
              <td style="border:0;padding-top:4pt">2.</td>
              <td style="border:0;padding-top:4pt">In the event of loss of ear tags, it is the responsibility of the insured to give immediate notice to the company and get the animal retagged and dully<br>endorsed in the policy.
                <div style="padding-left:18pt;margin-top:2pt">
                  <div>• &nbsp;Retagging endorsement will be issued only when it is ascertained that the animal proposed for retagging is the one and same which was<br>originally tagged and covered in the policy.</div>
                  <div>• &nbsp;A waiting period of 15 days would be applicable after retagging endorsement.</div>
                  <div>• &nbsp;Fresh tagging photographs and health certificate and original tagging photographs would be mandatory for all retagging cases.</div>
                  <div>• &nbsp;No endorsement would be done if the animal proposed for retagging endorsement is found in ill health condition.</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="border:0;padding-top:4pt">3.</td>
              <td style="border:0;padding-top:4pt">1.Excess : 75 % excess on sum insured for each and every claims . 2.Death due to diseases contracted prior to and within 15 days of<br>commencement of Risk are not payable. 3.Any death due to Lumpy Skin Disease is excluded from the scope of cover</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table class="g">
      <colgroup>
        <col style="width:108pt"><col style="width:72pt"><col style="width:81pt"><col style="width:90pt"><col style="width:190pt">
      </colgroup>
      <tr>
        <td colspan="3" class="b">Receipt Particulars:</td>
        <td colspan="2" class="b">S.Tax.No. AAACI7573HST001</td>
      </tr>
      <tr class="b">
        <td>Pay Method</td>
        <td>Receipt Amount</td>
        <td>Instrument #</td>
        <td>Instrument Date</td>
        <td>Bank</td>
      </tr>
      <tr>
        <td>${esc(inv.pay_method)}</td>
        <td>${esc(inv.receipt_amount)}</td>
        <td>${esc(inv.instrument_no)}</td>
        <td>${esc(inv.instrument_date)}</td>
        <td>${esc(inv.bank)}</td>
      </tr>
      <tr>
        <td class="b">Amount Received</td>
        <td>${esc(inv.receipt_amount)}</td>
        <td></td>
        <td colspan="2" rowspan="2" class="c b" style="vertical-align:top;padding-top:6pt">For IFFCO-TOKIO General Insurance Co. Ltd</td>
      </tr>
      <tr>
        <td style="height:16pt"></td>
        <td></td>
        <td></td>
      </tr>
    </table>

    <table class="g" style="margin-top:2pt">
      <tr>
        <td class="cancellation" style="padding:8pt 10pt 12pt;font-size:8pt;line-height:1.32">
          <div class="s11 u b">Cancellation Clause</div>
          <div style="margin-top:10pt">a) &nbsp;You/Insured can cancel the policy at any time during the policy period, by giving a notice in writing to Us/IFFCO Tokio. In such a<br>scenario, We/IFFCO Tokio shall:</div>
          <div style="padding-left:36pt;margin-top:10pt">
            <div style="margin-bottom:8pt">i) &nbsp;Refund proportion premium for unexpired policy period, if the term of the policy is upto one year and there is no claim(s)<br>made during the policy period.</div>
            <div>ii) &nbsp;Refund premium for the unexpired policy period, in respect of policy with the term more than one year and risk coverage for<br>such policy years has not yet commenced.</div>
          </div>
          <div style="margin-top:12pt;margin-bottom:6pt">b) &nbsp;We/IFFCO Tokio can cancel the policy only on the grounds of established fraud, by giving minimum notice of 7 days to You/Insured.<br>There would be no refund of premium on cancellation on grounds of established fraud.</div>
        </td>
      </tr>
    </table>
  </div>

  <div class="app">
    <span class="s9 b">"For quick access to policy services and claim intimation &amp; settlement kindly down load our customer application from -</span><br>
    <a class="b" href="https://play.google.com/store/apps/details?id=com.iffcotokio.CustomerApp">https://play.google.com/store/apps/details?id=com.iffcotokio.CustomerApp</a> or<br>
    <a class="b" href="https://apps.apple.com/in/app/iffco-tokio-customer/id1346469176#?platform=iphone">https://apps.apple.com/in/app/iffco-tokio-customer/id1346469176#?platform=iphone</a> or Call our toll free number – 1<br>
    800 103 5499."
  </div>
  <div class="app" style="margin-top:14pt">
    <span class="s9 b">To download CIS (Customer Information Sheet) click</span> <a class="b" href="https://www.iffcotokio.co.in/portal-content/pdf/cis-pdm.pdf">https://www.iffcotokio.co.in/portal-content/pdf/cis-pdm.pdf</a>
  </div>

  <div class="sig-wrap">
    <div class="sig-text">
      <div class="sig-body">
        <div class="title">Signature Not Verified</div>
        Digitally signed by ${sigName}<br>
        Date: ${sigDate}<br>
        Reason: ${sigReason}<br>
        Location: ${sigLocation}
      </div>
      <span class="sig-icon" aria-hidden="true">?</span>
    </div>
  </div>
</div>

</body>
</html>`;
}