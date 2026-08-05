import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Database,
  Search,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  Building,
  Anchor,
  Tag,
  Boxes,
  ShieldCheck,
} from 'lucide-react';
import { HsCode, ItemMaster, BusinessPartner } from '../../types';
import { KpiCard } from '../common/KpiCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

export const CustomsMasterModule: React.FC = () => {
  const {
    language,
    t,
    hsCodes,
    setHsCodes,
    items,
    setItems,
    partners,
    setPartners,
    hasPermission,
    showToast,
    addAuditLog,
    setIsAiModalOpen,
    globalSearch,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'HS_CODES' | 'ITEMS' | 'PARTNERS'>('HS_CODES');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New HS Code Form State
  const [newHsCode, setNewHsCode] = useState({
    code: '',
    descriptionEn: '',
    descriptionAr: '',
    dutyRatePercent: 5,
    vatRatePercent: 5,
    isRestricted: false,
    freeZoneExemptionEligible: true,
  });

  // New Item Master Form State
  const [newItem, setNewItem] = useState({
    itemCode: '',
    descriptionEn: '',
    descriptionAr: '',
    hsCode: '',
    uom: 'MTR',
    garmentCategory: 'FABRIC',
    unitValueAED: 15,
  });

  // New Partner Form State
  const [newPartner, setNewPartner] = useState({
    nameEn: '',
    nameAr: '',
    type: 'SUPPLIER' as const,
    country: 'China',
    trn: '',
    customsCode: '',
    contactEmail: '',
  });

  const query = (searchTerm || globalSearch).toLowerCase();

  const filteredHsCodes = hsCodes.filter(
    (h) =>
      (h.code || '').toLowerCase().includes(query) ||
      (h.descriptionEn || '').toLowerCase().includes(query) ||
      (h.descriptionAr ? h.descriptionAr.includes(query) : false)
  );

  const filteredItems = items.filter(
    (i) =>
      (i.itemCode || '').toLowerCase().includes(query) ||
      (i.descriptionEn || '').toLowerCase().includes(query) ||
      (i.hsCode || '').toLowerCase().includes(query)
  );

  const filteredPartners = partners.filter(
    (p) =>
      (p.nameEn || '').toLowerCase().includes(query) ||
      (p.country ? p.country.toLowerCase().includes(query) : false) ||
      (p.countryCode ? p.countryCode.toLowerCase().includes(query) : false) ||
      (p.trn ? p.trn.toLowerCase().includes(query) : false)
  );

  const handleAddHsCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHsCode.code || !newHsCode.descriptionEn) {
      showToast('Please fill in required fields');
      return;
    }
    const created: HsCode = {
      id: `hs-${Date.now()}`,
      code: newHsCode.code,
      descriptionEn: newHsCode.descriptionEn,
      descriptionAr: newHsCode.descriptionAr || newHsCode.descriptionEn,
      dutyRatePercent: newHsCode.dutyRatePercent,
      vatRatePercent: newHsCode.vatRatePercent,
      isRestricted: newHsCode.isRestricted,
      freeZoneExemptionEligible: newHsCode.freeZoneExemptionEligible,
      applicableUom: 'MTR',
    };
    setHsCodes([created, ...hsCodes]);
    addAuditLog('ADD_HS_CODE', 'masters', 'HsCode', created.id, created.code, `Added HS Code ${created.code}`);
    showToast(`HS Code ${created.code} added`);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg p-5 shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-[#111827] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#1E3A5F]" />
            <span>{t.nav_masters}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
              Enterprise Master Data
            </span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Tariff Catalog, Raw Fabric/Trims Item Master & International Trading Partners
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-[#374151] hover:text-[#111827] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1E3A5F]" />
            <span>AI HS Code Advisor</span>
          </button>
          {hasPermission('masters', 'create') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-[#1E3A5F] hover:bg-[#152B47] text-white shadow-2xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Record</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active HS Tariff Codes"
          value={hsCodes.length}
          subtitle="GCC Common Customs Tariff 2026"
          icon={Tag}
        />
        <KpiCard
          title="Item Master SKUs"
          value={items.length}
          subtitle="Raw fabrics, trims & finished garments"
          icon={Boxes}
        />
        <KpiCard
          title="Trading Partners"
          value={partners.length}
          subtitle="Suppliers, Buyers & Freight forwarders"
          icon={Building}
        />
        <KpiCard
          title="SAIF Zone Exemption Status"
          value="100% Eligible"
          subtitle="All items approved for Free Zone duty free"
          trend={{ value: 'Full Compliance', isPositive: true }}
          icon={ShieldCheck}
        />
      </div>

      {/* Tabs & Search Bar */}
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-2 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('HS_CODES')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'HS_CODES'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
            }`}
          >
            HS Tariff Codes ({hsCodes.length})
          </button>
          <button
            onClick={() => setActiveTab('ITEMS')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'ITEMS'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
            }`}
          >
            Garment Items & SKUs ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('PARTNERS')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'PARTNERS'
                ? 'bg-[#1E3A5F] text-white'
                : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
            }`}
          >
            Suppliers & Buyers ({partners.length})
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute inset-y-0 start-2.5 my-auto text-[#9CA3AF]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search master data..."
            className="w-full h-8 ps-8 pe-3 bg-[#F9FAFB] text-xs rounded-md border border-[#E5E7EB] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1E3A5F]"
          />
        </div>
      </div>

      {/* TAB 1: HS CODES */}
      {activeTab === 'HS_CODES' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'رمز HS' : 'HS Code'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'الوصف الجمركي' : 'Tariff Description'}</th>
                  <th className="py-2.5 px-3.5 text-end">{language === 'ar' ? 'نسبة الرسم' : 'Duty Rate'}</th>
                  <th className="py-2.5 px-3.5 text-end">{language === 'ar' ? 'نسبة الضريبة' : 'VAT Rate'}</th>
                  <th className="py-2.5 px-3.5 text-center">{language === 'ar' ? 'إعفاء المنطقة الحرة' : 'SAIF Exemption'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredHsCodes.map((hs) => (
                  <tr key={hs.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5 font-semibold font-mono text-[#1E3A5F]">{hs.code}</td>
                    <td className="py-3 px-3.5 text-[#111827] font-medium">
                      {language === 'ar' ? (hs.descriptionAr || hs.descriptionEn) : hs.descriptionEn}
                    </td>
                    <td className="py-3 px-3.5 text-end font-mono text-[#4B5563]">{hs.dutyRatePercent}%</td>
                    <td className="py-3 px-3.5 text-end font-mono text-[#4B5563]">{hs.vatRatePercent}%</td>
                    <td className="py-3 px-3.5 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {language === 'ar' ? '0% فئة المنطقة الحرة' : '0% Free Zone Rate'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ITEMS */}
      {activeTab === 'ITEMS' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'رمز الصنف (SKU)' : 'SKU Code'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'وصف الصنف' : 'Item Description'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'رمز HS المرتبط' : 'Linked HS Code'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'الفئة' : 'Category'}</th>
                  <th className="py-2.5 px-3.5 text-end">{language === 'ar' ? 'الوحدة' : 'UOM'}</th>
                  <th className="py-2.5 px-3.5 text-end">{language === 'ar' ? 'سعر الوحدة (درهم)' : 'Unit Value (AED)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5 font-semibold font-mono text-[#111827]">{item.itemCode}</td>
                    <td className="py-3 px-3.5 text-[#111827] font-medium">
                      {language === 'ar' ? (item.descriptionAr || item.descriptionEn) : item.descriptionEn}
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">{item.hsCode}</td>
                    <td className="py-3 px-3.5">
                      <span className="px-1.5 py-0.2 rounded bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB]">
                        {item.garmentCategory}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-end font-mono text-[#6B7280]">{item.uom}</td>
                    <td className="py-3 px-3.5 text-end font-semibold font-mono text-[#111827]">
                      AED {item.unitValueAED.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PARTNERS */}
      {activeTab === 'PARTNERS' && (
        <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-start border-collapse">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'اسم الشريك / الشركة' : 'Partner Name'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'النوع' : 'Type'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'البلد' : 'Country'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'الرقم الضريبي' : 'TRN / Tax ID'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'الرمز الجمركي' : 'Customs Code'}</th>
                  <th className="py-2.5 px-3.5 text-start">{language === 'ar' ? 'بيانات التواصل' : 'Contact'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-[#111827]">
                      {language === 'ar' ? (p.nameAr || p.nameEn) : p.nameEn}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-1.5 py-0.2 rounded bg-[#F1F5F9] text-[#1E3A5F] border border-[#E2E8F0] font-medium">
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-[#374151]">{p.country || p.countryCode}</td>
                    <td className="py-3 px-3.5 font-mono text-[#6B7280]">{p.trn || '—'}</td>
                    <td className="py-3 px-3.5 font-mono text-[#1E3A5F]">{p.customsCode || '—'}</td>
                    <td className="py-3 px-3.5 text-[#6B7280]">{p.contactEmail || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add HS Code */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add HS Tariff Code Record"
        subtitle="GCC Common Customs Tariff Master"
        footer={
          <>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="h-9 px-3.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-medium text-[#374151]"
            >
              Cancel
            </button>
            <button
              onClick={handleAddHsCode}
              className="h-9 px-4 rounded-lg bg-[#1E3A5F] hover:bg-[#152B47] text-white text-xs font-medium"
            >
              Save HS Code
            </button>
          </>
        }
      >
        <form onSubmit={handleAddHsCode} className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-[#374151] mb-1">HS Code (8-10 digits) *</label>
            <input
              type="text"
              value={newHsCode.code}
              onChange={(e) => setNewHsCode({ ...newHsCode, code: e.target.value })}
              placeholder="e.g. 5209.4200"
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-[#374151] mb-1">Description (English) *</label>
            <input
              type="text"
              value={newHsCode.descriptionEn}
              onChange={(e) => setNewHsCode({ ...newHsCode, descriptionEn: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-[#374151] mb-1">Description (Arabic)</label>
            <input
              type="text"
              dir="rtl"
              value={newHsCode.descriptionAr}
              onChange={(e) => setNewHsCode({ ...newHsCode, descriptionAr: e.target.value })}
              className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-arabic"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#374151] mb-1">Standard Duty Rate (%)</label>
              <input
                type="number"
                value={newHsCode.dutyRatePercent}
                onChange={(e) => setNewHsCode({ ...newHsCode, dutyRatePercent: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-[#374151] mb-1">Standard VAT Rate (%)</label>
              <input
                type="number"
                value={newHsCode.vatRatePercent}
                onChange={(e) => setNewHsCode({ ...newHsCode, vatRatePercent: parseFloat(e.target.value) || 0 })}
                className="w-full h-8 px-2.5 bg-white text-xs rounded-md border border-[#E5E7EB] font-mono"
              />
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};
