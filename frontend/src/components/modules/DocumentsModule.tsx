import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCheck2,
  Search,
  Plus,
  Upload,
  Printer,
  Download,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { CustomsDocument, DocumentType } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const DocumentsModule: React.FC = () => {
  const {
    language,
    t,
    documents,
    setDocuments,
    declarations,
    setPrintDocData,
    currentUser,
    hasPermission,
    showToast,
    addAuditLog,
    globalSearch,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New Document Upload State
  const [newDoc, setNewDoc] = useState({
    title: 'Certificate of Origin (Chamber Certified)',
    documentType: 'CERTIFICATE_OF_ORIGIN' as DocumentType,
    linkedEntityRef: declarations[0]?.declarationNo || 'IMP-2026-0001',
    expiryDate: '2027-08-01',
    fileSizeMb: 1.4,
  });

  const query = (searchTerm || globalSearch).toLowerCase();

  const filteredDocs = documents
    .filter((doc) => (docTypeFilter === 'ALL' ? true : doc.documentType === docTypeFilter))
    .filter(
      (doc) =>
        (doc.title || '').toLowerCase().includes(query) ||
        (doc.documentNo || '').toLowerCase().includes(query) ||
        (doc.linkedEntityRef ? doc.linkedEntityRef.toLowerCase().includes(query) : false)
    );

  const handleUploadDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const count = documents.length + 1;
    const docTitle = newDoc.title || 'Document';
    const created: CustomsDocument = {
      id: `doc-${Date.now()}`,
      documentNo: `DOC-2026-${String(count).padStart(4, '0')}`,
      title: docTitle,
      fileName: `${docTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      documentType: newDoc.documentType,
      linkedEntityType: 'DECLARATION',
      linkedEntityId: 'decl-1',
      linkedEntityRef: newDoc.linkedEntityRef,
      fileUrl: '/mock/docs/sample.pdf',
      fileSizeKb: (newDoc.fileSizeMb || 1) * 1024,
      uploadedBy: currentUser.name,
      uploadedAt: new Date().toISOString(),
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: newDoc.expiryDate,
      version: 1,
      isGeneratedBySystem: false,
    };

    setDocuments((prev) => [created, ...prev]);
    addAuditLog(
      'UPLOAD_DOCUMENT',
      'documents',
      'CustomsDocument',
      created.id,
      created.documentNo,
      `Uploaded ${created.title} linked to ${created.linkedEntityRef}`
    );
    showToast(`Document ${created.documentNo} added to Vault`);
    setIsUploadModalOpen(false);
  };

  const handlePrintSystemDoc = (type?: string) => {
    const sampleDecl = declarations[0];
    const safeType = type || 'CUSTOMS_DOCUMENT';
    setPrintDocData({
      titleEn: `OFFICIAL SAIF ZONE ${safeType.replace(/_/g, ' ')}`,
      titleAr: 'مستند تخليص جمركي رسمي معتمد - المنطقة الحرة لمطار الشارقة الدولي',
      docNumber: `SZ-DOC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      declarationNo: sampleDecl?.declarationNo,
      bayanRef: sampleDecl?.saifZoneCustomsRefNo || 'SZ-BAYAN-2026-08129',
      issueDate: new Date().toISOString().split('T')[0],
      preparedBy: currentUser.name,
      sections: [
        {
          title: 'Document Metadata & Archival Record',
          fields: [
            { label: 'Document Type', value: safeType.replace(/_/g, ' ') },
            { label: 'Linked Declaration', value: sampleDecl?.declarationNo || 'IMP-2026-0001' },
            { label: 'Importer / Exporter', value: sampleDecl?.partnerName || 'Euro Trousers' },
            { label: 'Storage Retention', value: '5 Years SAIF Mandate' },
          ],
        },
      ],
    });
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_documents}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              {documents.length} Files in Vault
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Electronic Document Repository: Certificates of Origin, Delivery Orders, Packing Lists & Bayan Receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('documents', 'create') && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Documents in Vault"
          value={documents.length}
          subtitle="Indexed by Declaration #"
          icon={FileText}
        />
        <KpiCard
          title="Certificates of Origin"
          value={documents.filter((d) => d.documentType === 'CERTIFICATE_OF_ORIGIN').length}
          subtitle="Chamber of Commerce stamped"
          icon={ShieldCheck}
        />
        <KpiCard
          title="Audit Compliance Score"
          value="100%"
          subtitle="Zero missing declaration attachments"
          trend={{ value: 'Full coverage', isPositive: true }}
          icon={CheckCircle2}
        />
        <KpiCard
          title="Retention Statute"
          value="5 Years"
          subtitle="SAIF Zone customs compliance requirement"
          icon={Calendar}
        />
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              'ALL',
              'CERTIFICATE_OF_ORIGIN',
              'COMMERCIAL_INVOICE',
              'PACKING_LIST',
              'BILL_OF_LADING',
              'DELIVERY_ORDER',
              'BAYAN_DECLARATION',
            ].map((dt) => (
              <button
                key={dt}
                onClick={() => setDocTypeFilter(dt)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors border text-xs ${
                  docTypeFilter === dt
                    ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] font-medium'
                    : 'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6] hover:text-[#111827]'
                }`}
              >
                {dt === 'ALL'
                  ? (language === 'ar' ? 'جميع المستندات' : 'All Types')
                  : ((dt || '').replace(/_/g, ' '))}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search document title, ref #..."
              className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-lg border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
            />
          </div>

        </div>
      </div>

      {/* Dense Sortable Enterprise Table */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-start border-collapse">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5 text-start">Document #</th>
                <th className="py-2.5 px-3.5 text-start">Document Title</th>
                <th className="py-2.5 px-3.5 text-start">Type</th>
                <th className="py-2.5 px-3.5 text-start">Linked Declaration</th>
                <th className="py-2.5 px-3.5 text-start">Uploaded By</th>
                <th className="py-2.5 px-3.5 text-end">File Size</th>
                <th className="py-2.5 px-3.5 text-end">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">
                    {doc.documentNo}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-medium text-[#111827]">{doc.title}</div>
                    <div className="text-[11px] text-[#6B7280] font-mono">{doc.fileName}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#1E3A5F] text-[11px] border border-[#E2E8F0] font-medium">
                      {(doc.documentType || 'DOCUMENT').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">
                    {doc.linkedEntityRef || '—'}
                  </td>
                  <td className="py-3 px-3.5 text-[#374151]">{doc.uploadedBy}</td>
                  <td className="py-3 px-3.5 text-end font-mono text-[#6B7280]">
                    {(doc.fileSizeKb / 1024).toFixed(1)} MB
                  </td>
                  <td className="py-3 px-3.5 text-end">
                    <button
                      onClick={() => handlePrintSystemDoc(doc.documentType)}
                      className="p-1 rounded-md text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] border border-transparent hover:border-[#E5E7EB] transition-colors inline-flex items-center gap-1 text-[11px]"
                      title="View & Print Official PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Print Copy</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Upload Document */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Customs Supporting Document"
        subtitle="Electronic Document Vault (5-Year Archival)"
        footer={
          <>
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleUploadDoc}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Upload to Vault
            </button>
          </>
        }
      >
        <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#374151] mb-1">Document Title *</label>
            <input
              type="text"
              value={newDoc.title}
              onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Document Category *</label>
              <select
                value={newDoc.documentType}
                onChange={(e) => setNewDoc({ ...newDoc, documentType: e.target.value as any })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              >
                <option value="CERTIFICATE_OF_ORIGIN">Certificate of Origin (COO)</option>
                <option value="COMMERCIAL_INVOICE">Commercial Invoice</option>
                <option value="PACKING_LIST">Packing List</option>
                <option value="BILL_OF_LADING">Bill of Lading / Air Waybill</option>
                <option value="DELIVERY_ORDER">Delivery Order (DO)</option>
                <option value="BAYAN_DECLARATION">Official Sharjah Bayan</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Linked Declaration *</label>
              <select
                value={newDoc.linkedEntityRef}
                onChange={(e) => setNewDoc({ ...newDoc, linkedEntityRef: e.target.value })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              >
                {declarations.map((d) => (
                  <option key={d.id} value={d.declarationNo}>
                    {d.declarationNo} ({d.partnerName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 border-2 border-dashed border-[#CBD5E1] rounded-lg text-center bg-[#F8FAFC]">
            <Upload className="w-6 h-6 text-[#94A3B8] mx-auto mb-1" />
            <p className="text-xs font-medium text-[#334155]">Select PDF, scanned TIFF or JPEG file</p>
            <p className="text-[11px] text-[#64748B]">Max file size: 25 MB</p>
          </div>
        </form>
      </Modal>

    </div>
  );
};
