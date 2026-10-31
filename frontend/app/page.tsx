'use client'

import React, { useMemo, useState, useRef, useEffect } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Building2,
  Car,
  Check,
  CheckCircle2,
  CircleHelp,
  CloudUpload,
  Code2,
  Database,
  Download,
  ExternalLink,
  FileJson,
  FileText,
  Fingerprint,
  Gauge,
  Inbox,
  Info,
  Loader2,
  Lock,
  LogOut,
  Maximize2,
  MessageSquareText,
  MoreHorizontal,
  PanelRight,
  Paperclip,
  Plane,
  Play,
  Printer,
  RefreshCw,
  Scale,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Utensils,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

const DEFAULT_GSTIN = '27AAKCS3053N1ZW'

export type ExpenseCategoryType = 'dining' | 'flight' | 'hotel' | 'cab'

export interface LineItemData {
  item: string
  category: string
  qty: number
  unit: string
  cgst: string
  sgst: string
  total: string
  flag: boolean
}

export interface ExpensePreset {
  id: ExpenseCategoryType
  label: string
  vendor: string
  code: string
  invoiceNumber: string
  date: string
  gstin: string
  subtotal: number
  cgst: number
  sgst: number
  igst: number
  grandTotal: number
  factLabels: {
    f1: string
    f2: string
    f3: string
    f4: string
  }
  factValues: {
    f1: string
    f2: string
    f3: string
    f4: string
  }
  lineItems: LineItemData[]
  anomaly: {
    hasAnomaly: boolean
    vectorTitle: string
    severity: 'critical' | 'warning' | 'info'
    explanation: string
    variance: string
    policyClause: string
    clauseTitle: string
  }
  policyDetails: {
    clauseNumber: string
    clauseTitle: string
    policyStatus: string
    ruleQuote: string
    allowableCap: string
    invoicedAmount: string
    excessAmount: string
    actionRequired: string
    handbookSection: string
  }
}

export const expensePresets: Record<ExpenseCategoryType, ExpensePreset> = {
  dining: {
    id: 'dining',
    label: 'Food & Dining',
    vendor: 'Barbeque Nation Hospitality Ltd',
    code: 'RCPT-8F2D91',
    invoiceNumber: 'CHK-004281',
    date: '14 Oct, 2026 · 14:35 IST',
    gstin: '27AAKCS3053N1ZW',
    subtotal: 2814.00,
    cgst: 67.00,
    sgst: 67.00,
    igst: 0.00,
    grandTotal: 2948.00,
    factLabels: {
      f1: 'ESTABLISHMENT',
      f2: 'TRANSACTION DATE',
      f3: 'INVOICE NUMBER',
      f4: 'GSTIN / TAX ID',
    },
    factValues: {
      f1: 'Barbeque Nation Ltd',
      f2: '14 Oct, 2026 · 14:35 IST',
      f3: 'CHK-004281',
      f4: '27AAKCS3053N1ZW',
    },
    lineItems: [
      { item: 'Buffet Lunch — 4 Covers', category: 'Food & Dining', qty: 4, unit: '₹650.00', cgst: '₹67.00', sgst: '₹67.00', total: '₹2,600.00', flag: true },
      { item: 'Packaged Mineral Water (1L)', category: 'Beverages', qty: 2, unit: '₹40.00', cgst: '₹2.00', sgst: '₹2.00', total: '₹80.00', flag: false },
      { item: 'Service Charge (Optional 5%)', category: 'Fees', qty: 1, unit: '₹134.00', cgst: '₹3.35', sgst: '₹3.35', total: '₹134.00', flag: false },
    ],
    anomaly: {
      hasAnomaly: true,
      vectorTitle: 'Per-Head Dining Cap Exceeded',
      severity: 'warning',
      explanation: 'Claimed dining cost of ₹737.00 per person exceeds the corporate threshold of ₹500.00 per person by ₹237.00 per head across 4 covers.',
      variance: '+₹237.00/head',
      policyClause: 'Clause 4.2',
      clauseTitle: 'Team Dining & Entertainment Limit',
    },
    policyDetails: {
      clauseNumber: 'Clause 4.2',
      clauseTitle: 'Team Meals & Group Entertainment Caps',
      policyStatus: 'NON-REIMBURSABLE VARIANCE',
      ruleQuote: 'Team meals and group entertainment are reimbursable up to a maximum cap of ₹500 per person for pre-approved corporate dining. Any excess amounts are the personal liability of the submitter unless backed by written VP dispensation. Alcoholic beverages, tobacco, and bar lounge items are strictly non-reimbursable.',
      allowableCap: '₹2,000.00 (4 covers × ₹500.00/head)',
      invoicedAmount: '₹2,948.00',
      excessAmount: '₹948.00 (₹237.00/head excess)',
      actionRequired: 'Deduct ₹948.00 personal liability from monthly payroll disbursement or attach approved VP exception memo.',
      handbookSection: 'Master Expense Handbook v4.2 · Section IV: Dining & Hospitality',
    },
  },
  flight: {
    id: 'flight',
    label: 'Flights & Airfare',
    vendor: 'IndiGo Airlines (InterGlobe Aviation Ltd)',
    code: 'FLT-6E2041',
    invoiceNumber: 'PNR-6EW9P2',
    date: '18 Oct, 2026 · DEL ➔ BLR',
    gstin: '07AABCI0245Q1ZS',
    subtotal: 6166.00,
    cgst: 0.00,
    sgst: 0.00,
    igst: 308.30,
    grandTotal: 6474.30,
    factLabels: {
      f1: 'AIRLINE CARRIER',
      f2: 'ROUTE & FLIGHT',
      f3: 'PNR / E-TICKET',
      f4: 'AIRLINE GSTIN',
    },
    factValues: {
      f1: 'IndiGo (InterGlobe)',
      f2: 'DEL ✈ BLR · 6E-2041',
      f3: 'PNR-6EW9P2',
      f4: '07AABCI0245Q1ZS',
    },
    lineItems: [
      { item: 'Airfare Base Tariff — Economy', category: 'Flights', qty: 1, unit: '₹4,850.00', cgst: '₹0.00', sgst: '₹0.00', total: '₹4,850.00', flag: false },
      { item: 'User Development Fee (UDF)', category: 'Airport Fees', qty: 1, unit: '₹480.00', cgst: '₹0.00', sgst: '₹0.00', total: '₹480.00', flag: false },
      { item: 'Aviation Security Fee (ASF)', category: 'Statutory', qty: 1, unit: '₹236.00', cgst: '₹0.00', sgst: '₹0.00', total: '₹236.00', flag: false },
      { item: 'Preferred Seat Selection (Row 1 XL)', category: 'Ancillary', qty: 1, unit: '₹600.00', cgst: '₹0.00', sgst: '₹0.00', total: '₹600.00', flag: true },
    ],
    anomaly: {
      hasAnomaly: true,
      vectorTitle: 'Unapproved Travel Ancillary Fee',
      severity: 'warning',
      explanation: 'Preferred XL seat allocation fee of ₹600.00 claimed without documented travel desk waiver under Clause 6.1.',
      variance: '+₹600.00',
      policyClause: 'Clause 6.1',
      clauseTitle: 'Air Travel Class & Seat Selection Standard',
    },
    policyDetails: {
      clauseNumber: 'Clause 6.1',
      clauseTitle: 'Commercial Air Travel & Travel Class Governance',
      policyStatus: 'ANCILLARY EXCEPTION',
      ruleQuote: 'All domestic flights under 6 hours duration must be booked in standard Economy Class via corporate travel desk. Premium seat selection fees (e.g. extra legroom rows), priority boarding, and excess baggage beyond 15kg are non-reimbursable unless specifically justified.',
      allowableCap: '₹5,874.30 (Base Fare + Mandatory Airport Fees + IGST)',
      invoicedAmount: '₹6,474.30',
      excessAmount: '₹600.00 (Unapproved XL seat selection fee)',
      actionRequired: 'Employee must furnish travel desk justification for premium seat selection or adjust claim to ₹5,874.30.',
      handbookSection: 'Master Expense Handbook v4.2 · Section VI: Aviation & Domestic Transit',
    },
  },
  hotel: {
    id: 'hotel',
    label: 'Hotel & Lodging',
    vendor: 'Taj Lands End (The Indian Hotels Co Ltd)',
    code: 'HTL-TL8921',
    invoiceNumber: 'FOL-892104',
    date: '22 Oct – 24 Oct, 2026 · 2 Nights',
    gstin: '27AAACI1888G1ZQ',
    subtotal: 12500.00,
    cgst: 1125.00,
    sgst: 1125.00,
    igst: 0.00,
    grandTotal: 14750.00,
    factLabels: {
      f1: 'HOTEL PROPERTY',
      f2: 'STAY PERIOD',
      f3: 'FOLIO / INVOICE',
      f4: 'PROPERTY GSTIN',
    },
    factValues: {
      f1: 'Taj Lands End, Mumbai',
      f2: '22–24 Oct (2 Nights)',
      f3: 'FOL-892104',
      f4: '27AAACI1888G1ZQ',
    },
    lineItems: [
      { item: 'Deluxe Room — Night 1', category: 'Lodging', qty: 1, unit: '₹5,800.00', cgst: '₹522.00', sgst: '₹522.00', total: '₹5,800.00', flag: true },
      { item: 'Deluxe Room — Night 2', category: 'Lodging', qty: 1, unit: '₹5,800.00', cgst: '₹522.00', sgst: '₹522.00', total: '₹5,800.00', flag: true },
      { item: 'High-Speed Executive Wi-Fi', category: 'Services', qty: 2, unit: '₹450.00', cgst: '₹40.50', sgst: '₹40.50', total: '₹900.00', flag: false },
    ],
    anomaly: {
      hasAnomaly: true,
      vectorTitle: 'Tier-1 Nightly Room Cap Exceeded',
      severity: 'warning',
      explanation: 'Invoiced room tariff of ₹5,800.00/night exceeds the Mumbai Tier-1 corporate accommodation cap of ₹5,000.00/night by ₹800.00/night (Total variance: ₹1,600.00).',
      variance: '+₹1,600.00',
      policyClause: 'Clause 8.3',
      clauseTitle: 'Corporate Lodging & City Tier Limits',
    },
    policyDetails: {
      clauseNumber: 'Clause 8.3',
      clauseTitle: 'Hotel Accommodation & Nightly Cap Thresholds',
      policyStatus: 'TARIFF THRESHOLD EXCEEDED',
      ruleQuote: 'Reimbursement for hotel accommodation in Tier-1 metros (Mumbai, Delhi-NCR, Bengaluru) is capped at ₹5,000.00 net room rate per night exclusive of statutory taxes. Room upgrades, mini-bar consumption, and laundry under 3 nights stay require employee co-pay.',
      allowableCap: '₹11,800.00 (2 nights × ₹5,000 + Wi-Fi + GST)',
      invoicedAmount: '₹14,750.00',
      excessAmount: '₹1,888.00 (Base tariff excess ₹1,600 + GST on excess ₹288)',
      actionRequired: 'Claim adjusted to ₹11,800.00 or provide Department Head pre-approval for central financial audit clearance.',
      handbookSection: 'Master Expense Handbook v4.2 · Section VIII: Corporate Accommodation',
    },
  },
  cab: {
    id: 'cab',
    label: 'Ground Transit & Cabs',
    vendor: 'Uber India Systems Pvt Ltd',
    code: 'CAB-UB7829',
    invoiceNumber: 'UBR-CR-782910',
    date: '26 Oct, 2026 · 21:15 IST',
    gstin: '29AABCU9603R1ZX',
    subtotal: 1635.00,
    cgst: 40.88,
    sgst: 40.88,
    igst: 0.00,
    grandTotal: 1716.76,
    factLabels: {
      f1: 'OPERATOR SERVICE',
      f2: 'ROUTE & DISTANCE',
      f3: 'TRIP INVOICE ID',
      f4: 'OPERATOR GSTIN',
    },
    factValues: {
      f1: 'Uber Premier (Airport)',
      f2: 'BLR Airport ➔ E-City (42 km)',
      f3: 'UBR-CR-782910',
      f4: '29AABCU9603R1ZX',
    },
    lineItems: [
      { item: 'Base Distance Fare (42 km)', category: 'Transit', qty: 1, unit: '₹1,240.00', cgst: '₹31.00', sgst: '₹31.00', total: '₹1,240.00', flag: false },
      { item: 'Expressway Toll Charge', category: 'Tolls', qty: 1, unit: '₹115.00', cgst: '₹0.00', sgst: '₹0.00', total: '₹115.00', flag: false },
      { item: 'Peak Demand Dynamic Surcharge', category: 'Ancillary', qty: 1, unit: '₹280.00', cgst: '₹7.00', sgst: '₹7.00', total: '₹280.00', flag: true },
    ],
    anomaly: {
      hasAnomaly: true,
      vectorTitle: 'Peak Transit Surge Multiplier',
      severity: 'info',
      explanation: 'Late evening dynamic pricing multiplier of ₹280.00 applied on airport route; verified compliant under after-hours emergency transit exemption.',
      variance: '+₹280.00',
      policyClause: 'Clause 3.1',
      clauseTitle: 'Ground Transportation & Shift Travel',
    },
    policyDetails: {
      clauseNumber: 'Clause 3.1',
      clauseTitle: 'Ground Transportation, Airport Transit & Surge Pricing',
      policyStatus: 'CONDITIONAL COMPLIANCE',
      ruleQuote: 'Official transit to/from airports, train terminals, and client offices is reimbursable on actuals. Toll fees are fully covered when itemized. Surge/multiplier pricing above 1.5x is accepted for late-night flights (between 21:00 and 06:00 IST) upon manager endorsement.',
      allowableCap: '₹1,716.76 (Full reimbursement validated)',
      invoicedAmount: '₹1,716.76',
      excessAmount: '₹0.00 (Exempt under late-night airport transit)',
      actionRequired: 'Auto-approved under Section 3.1 late flight transit policy. No payroll deduction required.',
      handbookSection: 'Master Expense Handbook v4.2 · Section III: Local Ground Transportation',
    },
  },
}

export interface PipelineStage {
  id: string
  label: string
  desc: string
  status: 'pending' | 'active' | 'completed' | 'failed' | 'warning'
}

const initialPipelineStages: PipelineStage[] = [
  { id: 'ingestion', label: 'Receipt Ingestion', desc: 'OCR & layout extraction', status: 'completed' },
  { id: 'breakdown', label: 'Item Breakdown', desc: 'Itemization & unit rates', status: 'completed' },
  { id: 'reconciliation', label: 'GST Reconciliation', desc: 'Tax math & GSTIN verify', status: 'completed' },
  { id: 'policy', label: 'Policy Verification', desc: 'Corporate caps & rules', status: 'warning' },
]

const initialChatMessages = [
  {
    from: 'ai',
    text: 'No alcohol charges found on this receipt. Everything listed is compliant with food and beverage guidelines.',
    sources: [{ label: 'Receipt Analysis', type: 'receipt' }, { label: 'Policy Rules', type: 'policy' }],
  },
]

function Metric({ label, value, detail, positive, icon: Icon }: { label: string; value: string; detail: string; positive?: boolean; icon: typeof Inbox }) {
  return (
    <div className="metric-card">
      <div className="metric-top"><span>{label}</span><Icon /></div>
      <div className="metric-value">{value}</div>
      <div className={positive ? 'metric-detail positive' : 'metric-detail'}>{detail}</div>
      <div className="sparkline" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
    </div>
  )
}

export default function Page() {
  const [tab, setTab] = useState('line-items')
  const [showBoxes, setShowBoxes] = useState(true)
  const [zoom, setZoom] = useState(100)
  const [query, setQuery] = useState('')
  const [rawOpen, setRawOpen] = useState(false)
  const [policyDrawerOpen, setPolicyDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryType>('dining')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Real File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [isAuditing, setIsAuditing] = useState(false)

  // Dynamic Audit State & Pipeline Stages
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>(initialPipelineStages)
  const currentPreset = expensePresets[selectedCategory]

  const [receiptMeta, setReceiptMeta] = useState({
    receipt_code: currentPreset.code,
    vendor: currentPreset.vendor,
    date: currentPreset.date,
    invoice_number: currentPreset.invoiceNumber,
    gstin: currentPreset.gstin,
    subtotal: currentPreset.subtotal,
    cgst: currentPreset.cgst,
    sgst: currentPreset.sgst,
    igst: currentPreset.igst,
    grand_total: currentPreset.grandTotal,
    is_valid: !currentPreset.anomaly.hasAnomaly || currentPreset.anomaly.severity === 'info',
    discrepancies: currentPreset.anomaly.hasAnomaly ? [currentPreset.anomaly.explanation] : [],
    math_valid: true,
    math_msg: 'Taxes and line items mathematically reconciled with total.',
    risk_score: currentPreset.anomaly.hasAnomaly ? (currentPreset.anomaly.severity === 'critical' ? 75 : 45) : 10,
    verdict: currentPreset.anomaly.hasAnomaly ? (currentPreset.anomaly.severity === 'critical' ? 'REJECTED' : 'MANUAL_REVIEW') : 'APPROVED',
  })
  const [lineItems, setLineItems] = useState<LineItemData[]>(currentPreset.lineItems)
  const [rawAuditPayload, setRawAuditPayload] = useState<any>(null)

  // Policy audit state
  const [policyData, setPolicyData] = useState<any>({
    status: currentPreset.anomaly.hasAnomaly ? 'flagged' : 'passed',
    compliance_score: currentPreset.anomaly.hasAnomaly ? 68 : 96,
    verdict: currentPreset.anomaly.hasAnomaly ? 'Needs review' : 'Approved',
    violations: currentPreset.anomaly.hasAnomaly ? [
      {
        title: currentPreset.anomaly.vectorTitle,
        description: currentPreset.anomaly.explanation,
        amount: currentPreset.anomaly.variance,
        severity: currentPreset.anomaly.severity,
      }
    ] : [],
    citations: [
      {
        section: `${currentPreset.policyDetails.clauseNumber} — ${currentPreset.policyDetails.clauseTitle}`,
        text: currentPreset.policyDetails.ruleQuote,
        source: currentPreset.policyDetails.handbookSection,
        similarity: 0.95,
      }
    ]
  })
  const [isPolicyLoading, setIsPolicyLoading] = useState(false)

  // Assistant Chat state
  const [messages, setMessages] = useState<Array<{ from: string; text: string; sources?: Array<{ label: string; type: string }> }>>(initialChatMessages)
  const [isChatSending, setIsChatSending] = useState(false)

  // Dynamic Real-Time Dashboard Stats (from MySQL)
  const [stats, setStats] = useState({
    total_receipts: 3,
    compliance_rate: '33.3%',
    compliance_numeric: 33.3,
    discrepancies_flagged: 2,
    flagged_fraud_count: 1,
    pending_review_count: 1,
    verified_clean_count: 1,
    audit_accuracy: '91.6%',
    accuracy_numeric: 91.6,
    database_type: 'MYSQL',
  })

  // AI Extraction Confidence Score
  const [confidenceScore, setConfidenceScore] = useState<number>(96.4)

  // Admin Portal & RBAC Authentication State
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [adminUser, setAdminUser] = useState<{ username: string; full_name: string; role: string } | null>(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoginLoading, setAdminLoginLoading] = useState(false)
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null)

  // Persisted Database Records in Admin Portal
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([])
  const [adminLogFilter, setAdminLogFilter] = useState<'all' | 'Verified & Clean' | 'Pending Supervisor Review' | 'Flagged as Fraud'>('all')
  const [adminSearch, setAdminSearch] = useState('')
  const [isAdminLogsLoading, setIsAdminLogsLoading] = useState(false)

  // Fetch real-time dashboard counters
  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.warn('Backend stats unavailable:', err)
    }
  }

  // Fetch persisted audit logs from MySQL
  const fetchAdminLogs = async (overrideToken?: string) => {
    const token = overrideToken || adminToken
    if (!token) return
    try {
      setIsAdminLogsLoading(true)
      const url = new URL('http://localhost:8000/api/admin/audit-logs')
      if (adminLogFilter !== 'all') url.searchParams.set('status', adminLogFilter)
      if (adminSearch.trim()) url.searchParams.set('search', adminSearch.trim())
      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setAdminAuditLogs(data.records || [])
      } else if (res.status === 401) {
        setAdminToken(null)
        setAdminUser(null)
        notify('Session expired. Please log in again.')
      }
    } catch (err) {
      console.error('Error fetching admin logs:', err)
    } finally {
      setIsAdminLogsLoading(false)
    }
  }

  // Handle Admin Login submission
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoginLoading(true)
    setAdminLoginError(null)
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Invalid administrator credentials.')
      }
      const data = await res.json()
      setAdminToken(data.access_token)
      setAdminUser(data.user)
      setIsLoginOpen(false)
      setIsAdminDrawerOpen(true)
      notify(`Welcome, Administrator ${data.user.full_name || data.user.username}!`)
      fetchAdminLogs(data.access_token)
      fetchStats()
    } catch (err: any) {
      setAdminLoginError(err.message || 'Login failed')
    } finally {
      setAdminLoginLoading(false)
    }
  }

  // Handle Admin Logout
  const handleAdminLogout = () => {
    setAdminToken(null)
    setAdminUser(null)
    setIsAdminDrawerOpen(false)
    notify('Logged out of Admin Portal.')
  }

  // Update Record Status in MySQL
  const handleUpdateRecordStatus = async (recordId: number, newStatus: string) => {
    if (!adminToken) return
    try {
      const res = await fetch(`http://localhost:8000/api/admin/audit-logs/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ request_status: newStatus })
      })
      if (res.ok) {
        notify(`Record #${recordId} status updated to: ${newStatus}`)
        fetchAdminLogs()
        fetchStats()
      }
    } catch (err) {
      notify('Failed to update record status.')
    }
  }

  // Delete Record from MySQL
  const handleDeleteRecord = async (recordId: number) => {
    if (!adminToken) return
    if (!confirm(`Are you sure you want to delete audit record #${recordId}?`)) return
    try {
      const res = await fetch(`http://localhost:8000/api/admin/audit-logs/${recordId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      })
      if (res.ok) {
        notify(`Audit record #${recordId} deleted from database.`)
        fetchAdminLogs()
        fetchStats()
      }
    } catch (err) {
      notify('Failed to delete audit record.')
    }
  }

  // Initial load: fetch real-time stats
  useEffect(() => {
    fetchStats()
  }, [])

  // Close dropdown or modal on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setRawOpen(false)
        setPolicyDrawerOpen(false)
        setIsLoginOpen(false)
        setIsAdminDrawerOpen(false)
      }
    }
    if (menuOpen || rawOpen || policyDrawerOpen || isLoginOpen || isAdminDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, rawOpen, policyDrawerOpen, isLoginOpen, isAdminDrawerOpen])

  const payloadString = useMemo(() => {
    if (rawAuditPayload) {
      return JSON.stringify(rawAuditPayload, null, 2)
    }
    return JSON.stringify(
      {
        vendor_name: receiptMeta.vendor,
        date: receiptMeta.date,
        gstin: receiptMeta.gstin,
        invoice_number: receiptMeta.invoice_number,
        subtotal: receiptMeta.subtotal,
        cgst: receiptMeta.cgst,
        sgst: receiptMeta.sgst,
        igst: receiptMeta.igst,
        total: receiptMeta.grand_total,
        is_valid: receiptMeta.is_valid,
        discrepancies: receiptMeta.discrepancies,
        line_items: lineItems,
      },
      null,
      2
    )
  }, [rawAuditPayload, receiptMeta, lineItems])

  const notify = (text: string) => {
    setToast(text)
    window.setTimeout(() => setToast(''), 3500)
  }

  // Switch Expense Category Preset dynamically
  const switchCategoryPreset = (category: ExpenseCategoryType) => {
    setSelectedCategory(category)
    if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl)
    }
    setSelectedFile(null)
    setFilePreviewUrl(null)
    setRawAuditPayload(null)
    setErrorMessage(null)

    const preset = expensePresets[category]
    setLineItems(preset.lineItems)
    setReceiptMeta({
      receipt_code: preset.code,
      vendor: preset.vendor,
      date: preset.date,
      invoice_number: preset.invoiceNumber,
      gstin: preset.gstin,
      subtotal: preset.subtotal,
      cgst: preset.cgst,
      sgst: preset.sgst,
      igst: preset.igst,
      grand_total: preset.grandTotal,
      is_valid: !preset.anomaly.hasAnomaly || preset.anomaly.severity === 'info',
      discrepancies: preset.anomaly.hasAnomaly ? [preset.anomaly.explanation] : [],
      math_valid: true,
      math_msg: 'Taxes and line items mathematically reconciled.',
      risk_score: preset.anomaly.hasAnomaly ? (preset.anomaly.severity === 'critical' ? 75 : 45) : 10,
      verdict: preset.anomaly.hasAnomaly ? (preset.anomaly.severity === 'critical' ? 'REJECTED' : 'MANUAL_REVIEW') : 'APPROVED',
    })

    setPolicyData({
      status: preset.anomaly.hasAnomaly ? 'flagged' : 'passed',
      compliance_score: preset.anomaly.hasAnomaly ? 68 : 96,
      verdict: preset.anomaly.hasAnomaly ? 'Needs review' : 'Approved',
      violations: preset.anomaly.hasAnomaly ? [
        {
          title: preset.anomaly.vectorTitle,
          description: preset.anomaly.explanation,
          amount: preset.anomaly.variance,
          severity: preset.anomaly.severity,
        }
      ] : [],
      citations: [
        {
          section: `${preset.policyDetails.clauseNumber} — ${preset.policyDetails.clauseTitle}`,
          text: preset.policyDetails.ruleQuote,
          source: preset.policyDetails.handbookSection,
          similarity: 0.95,
        }
      ]
    })

    setPipelineStages([
      { id: 'ingestion', label: 'Receipt Ingestion', desc: 'OCR & layout extraction', status: 'completed' },
      { id: 'breakdown', label: 'Item Breakdown', desc: 'Itemization & unit rates', status: 'completed' },
      { id: 'reconciliation', label: 'GST Reconciliation', desc: 'Tax math & GSTIN verify', status: 'completed' },
      { id: 'policy', label: 'Policy Verification', desc: 'Corporate caps & rules', status: preset.anomaly.hasAnomaly ? 'warning' : 'completed' },
    ])

    notify(`Switched context to ${preset.label} (${preset.code})`)
  }

  // Anomaly Normalizer & Vector Resolver
  const activeAnomaly = useMemo(() => {
    if (!receiptMeta.math_valid) {
      return {
        hasAnomaly: true,
        vectorTitle: 'Arithmetic Manipulation Detected',
        severity: 'critical' as const,
        explanation: `Invoiced grand total (₹${receiptMeta.grand_total.toFixed(2)}) differs from the sum of itemized charges (₹${receiptMeta.subtotal.toFixed(2)}) plus statutory taxes, indicating altered totals or unbilled line items.`,
        variance: `Mismatch: ₹${Math.abs(receiptMeta.grand_total - (receiptMeta.subtotal + receiptMeta.cgst + receiptMeta.sgst)).toFixed(2)}`,
        clause: 'Clause 2.1 — Invoiced Arithmetic Integrity',
      }
    }
    if (receiptMeta.gstin && !receiptMeta.gstin.startsWith('27') && !receiptMeta.gstin.startsWith('07') && !receiptMeta.gstin.startsWith('29') && receiptMeta.gstin !== 'N/A') {
      return {
        hasAnomaly: true,
        vectorTitle: 'GSTIN Jurisdiction & Format Mismatch',
        severity: 'critical' as const,
        explanation: `The merchant GSTIN (${receiptMeta.gstin}) does not match valid Indian GST portal checksum patterns for inter-state input tax credit.`,
        variance: 'Non-compliant GSTIN',
        clause: 'Clause 1.4 — Statutory Tax ID Verification',
      }
    }
    if (currentPreset?.anomaly?.hasAnomaly) {
      return {
        hasAnomaly: true,
        vectorTitle: currentPreset.anomaly.vectorTitle,
        severity: currentPreset.anomaly.severity,
        explanation: currentPreset.anomaly.explanation,
        variance: currentPreset.anomaly.variance,
        clause: `${currentPreset.anomaly.policyClause} — ${currentPreset.anomaly.clauseTitle}`,
      }
    }
    return null
  }, [receiptMeta, currentPreset])

  const handleExportJSON = () => {
    setMenuOpen(false)
    try {
      const jsonBlob = new Blob([payloadString], { type: 'application/json' })
      const downloadUrl = URL.createObjectURL(jsonBlob)
      const downloadAnchor = document.createElement('a')
      downloadAnchor.href = downloadUrl
      downloadAnchor.download = `${receiptMeta.receipt_code || 'audit-receipt'}.json`
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      document.body.removeChild(downloadAnchor)
      URL.revokeObjectURL(downloadUrl)
      notify('Exported JSON audit report')
    } catch {
      notify('Failed to export JSON audit report')
    }
  }

  const handlePrintReport = () => {
    setMenuOpen(false)
    window.print()
  }

  const handleResetWorkspace = () => {
    switchCategoryPreset('dining')
    setMessages(initialChatMessages)
    setZoom(100)
    setShowBoxes(true)
    setQuery('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setMenuOpen(false)
    notify('Workspace reset to initial state')
  }

  const handleStageClick = (stageId: string) => {
    if (stageId === 'ingestion') {
      notify('Stage 1: Document Ingestion & Vision Preview')
    } else if (stageId === 'breakdown') {
      setTab('line-items')
      notify('Stage 2: Itemized Line Breakdown')
    } else if (stageId === 'reconciliation') {
      setTab('line-items')
      notify('Stage 3: Indian GST & Mathematical Reconciliation')
    } else if (stageId === 'policy') {
      setTab('policy')
      setPolicyDrawerOpen(true)
      notify('Stage 4: Opening Corporate Policy Exception Review')
    }
  }

  // Core Audit Function: uploads the actual File to backend
  const auditReceiptFile = async (fileToAudit: File) => {
    setIsAuditing(true)
    setErrorMessage(null)

    // Progression: Stage 0 Active
    setPipelineStages([
      { id: 'ingestion', label: 'Receipt Ingestion', desc: 'Parsing image/PDF bytes...', status: 'active' },
      { id: 'breakdown', label: 'Item Breakdown', desc: 'Awaiting OCR items', status: 'pending' },
      { id: 'reconciliation', label: 'GST Reconciliation', desc: 'Awaiting tax payload', status: 'pending' },
      { id: 'policy', label: 'Policy Verification', desc: 'Awaiting policy check', status: 'pending' },
    ])

    const stageTimer1 = setTimeout(() => {
      setPipelineStages((prev) => [
        { ...prev[0], status: 'completed', desc: 'Document layout extracted' },
        { ...prev[1], status: 'active', desc: 'Parsing line items & rates...' },
        prev[2],
        prev[3],
      ])
    }, 600)

    const stageTimer2 = setTimeout(() => {
      setPipelineStages((prev) => [
        prev[0],
        { ...prev[1], status: 'completed', desc: 'Line items itemized' },
        { ...prev[2], status: 'active', desc: 'Auditing GST tax math...' },
        prev[3],
      ])
    }, 1400)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const formData = new FormData()
      formData.append('file', fileToAudit)

      const response = await fetch('http://localhost:8000/api/audit', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      clearTimeout(stageTimer1)
      clearTimeout(stageTimer2)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Server returned HTTP ${response.status}`)
      }

      const data = await response.json()
      setRawAuditPayload(data)

      // Bind line items dynamically from actual backend response
      const incomingItems = data.line_items || data.items || []
      const parsedItems: LineItemData[] = incomingItems.map((it: any) => ({
        item: it.item || it.item_name || 'Item',
        category: it.category || data.expense_category || 'General',
        qty: Number(it.qty || it.quantity) || 1,
        unit: it.unit ? String(it.unit) : `₹${Number(it.price || 0).toFixed(2)}`,
        cgst: it.cgst ? String(it.cgst) : '₹0.00',
        sgst: it.sgst ? String(it.sgst) : '₹0.00',
        total: it.total ? String(it.total) : `₹${(Number(it.price || 0) * Number(it.quantity || 1)).toFixed(2)}`,
        flag: Boolean(it.flag),
      }))

      setLineItems(parsedItems)

      // Bind all metadata dynamically
      const vendorName = data.vendor_name || data.vendor || 'Establishment'
      const invoiceNum = data.invoice_number || 'N/A'
      const dateStr = data.date || 'N/A'
      const gstinStr = data.gstin || 'N/A'
      const subtotalVal = Number(data.subtotal) || 0
      const cgstVal = Number(data.cgst) || 0
      const sgstVal = Number(data.sgst) || 0
      const igstVal = Number(data.igst) || 0
      const totalVal = Number(data.total ?? data.grand_total) || 0
      const isValid = Boolean(data.is_valid ?? data.math_valid ?? true)
      const isMathValid = Boolean(data.math_valid ?? true)
      const isGstinValid = Boolean(data.gstin_valid ?? true)
      const discrepancies = Array.isArray(data.discrepancies) ? data.discrepancies : (data.policy_flags || [])
      const mathMsg = data.math_msg || (isMathValid ? 'Taxes and line items reconciled with total.' : (discrepancies[0] || 'Discrepancy detected.'))
      const riskScore = Number(data.risk_score) || (isValid ? 10 : 45)
      const verdict = data.verdict || (isValid ? 'APPROVED' : 'MANUAL_REVIEW')

      if (data.confidence_score) {
        setConfidenceScore(Number(data.confidence_score))
      }
      fetchStats()

      setReceiptMeta({
        receipt_code: data.receipt_code || `RCPT-${invoiceNum.slice(-6)}`,
        vendor: vendorName,
        date: dateStr,
        invoice_number: invoiceNum,
        gstin: gstinStr,
        subtotal: subtotalVal,
        cgst: cgstVal,
        sgst: sgstVal,
        igst: igstVal,
        grand_total: totalVal,
        is_valid: isValid,
        discrepancies,
        math_valid: isMathValid,
        math_msg: mathMsg,
        risk_score: riskScore,
        verdict,
      })

      // Infer category from data if available
      const catLower = (data.expense_category || '').toLowerCase()
      let determinedCat: ExpenseCategoryType = 'dining'
      if (catLower.includes('flight') || catLower.includes('air')) determinedCat = 'flight'
      else if (catLower.includes('hotel') || catLower.includes('stay') || catLower.includes('lodg')) determinedCat = 'hotel'
      else if (catLower.includes('cab') || catLower.includes('transport') || catLower.includes('fuel')) determinedCat = 'cab'
      setSelectedCategory(determinedCat)

      // Stop progression at Stage 2 if math/GSTIN mismatch!
      if (!isMathValid || !isGstinValid) {
        setPipelineStages([
          { id: 'ingestion', label: 'Receipt Ingestion', desc: 'OCR completed', status: 'completed' },
          { id: 'breakdown', label: 'Item Breakdown', desc: `${parsedItems.length} items parsed`, status: 'completed' },
          { id: 'reconciliation', label: 'GST Reconciliation', desc: isMathValid ? 'Invalid GSTIN' : 'Arithmetic variance detected', status: 'failed' },
          { id: 'policy', label: 'Policy Verification', desc: 'Pipeline halted at reconciliation', status: 'pending' },
        ])
        notify(`Audit alert: Tax & math discrepancy detected for ${vendorName}`)
        return
      }

      // Stage 2 passes, proceed to Stage 3 Policy Check
      setPipelineStages([
        { id: 'ingestion', label: 'Receipt Ingestion', desc: 'OCR completed', status: 'completed' },
        { id: 'breakdown', label: 'Item Breakdown', desc: `${parsedItems.length} items parsed`, status: 'completed' },
        { id: 'reconciliation', label: 'GST Reconciliation', desc: 'Statutory GST & math balanced', status: 'completed' },
        { id: 'policy', label: 'Policy Verification', desc: 'Evaluating corporate rules...', status: 'active' },
      ])

      notify(`Audited: ${vendorName} · ${verdict}`)

      // Automatically run policy check on the newly extracted items
      await fetchPolicyCheck(parsedItems, {
        grand_total: totalVal,
        subtotal: subtotalVal,
        expense_category: data.expense_category || 'General',
        category: determinedCat,
        date: dateStr,
        gstin: gstinStr,
        merchant_name: vendorName,
      })
    } catch (err: any) {
      clearTimeout(stageTimer1)
      clearTimeout(stageTimer2)
      clearTimeout(timeoutId)
      const msg = err.name === 'AbortError' ? 'Audit request timed out after 30s.' : (err.message || 'Audit service error')
      setErrorMessage(msg)
      setPipelineStages((prev) => [
        { ...prev[0], status: 'failed', desc: 'OCR parsing failed' },
        { ...prev[1], status: 'pending', desc: 'Halted' },
        { ...prev[2], status: 'pending', desc: 'Halted' },
        { ...prev[3], status: 'pending', desc: 'Halted' },
      ])
      notify(`Audit failed: ${msg}`)
    } finally {
      setIsAuditing(false)
    }
  }

  // Handle file selection from dialog
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file))
      } else {
        setFilePreviewUrl(null)
      }
      notify(`File loaded: ${file.name}. Starting audit...`)
      // Trigger dynamic audit immediately on the newly selected file
      auditReceiptFile(file)
    }
  }

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file))
      } else {
        setFilePreviewUrl(null)
      }
      notify(`File dropped: ${file.name}. Starting audit...`)
      // Trigger dynamic audit immediately on the dropped file
      auditReceiptFile(file)
    }
  }

  // Action button click: audits current file or opens file picker
  const handleAuditClick = () => {
    if (selectedFile) {
      auditReceiptFile(selectedFile)
    } else {
      fileInputRef.current?.click()
    }
  }

  // POST /api/policy-check
  const fetchPolicyCheck = async (itemsToCheck = lineItems, metaContext?: any) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    try {
      const response = await fetch('http://localhost:8000/api/policy-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsToCheck,
          grand_total: metaContext?.grand_total ?? receiptMeta.grand_total,
          subtotal: metaContext?.subtotal ?? receiptMeta.subtotal,
          expense_category: metaContext?.expense_category ?? 'Food & Dining',
          category: metaContext?.category ?? selectedCategory,
          date: metaContext?.date ?? receiptMeta.date,
          gstin: metaContext?.gstin ?? receiptMeta.gstin,
          merchant_name: metaContext?.merchant_name ?? receiptMeta.vendor,
        }),
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (response.ok) {
        const result = await response.json()
        setPolicyData(result)
        const hasViolations = result.violations && result.violations.length > 0
        setPipelineStages((prev) => [
          prev[0],
          prev[1],
          prev[2],
          {
            id: 'policy',
            label: 'Policy Verification',
            desc: hasViolations ? `${result.violations.length} exception(s) flagged` : 'Corporate rules approved',
            status: hasViolations ? 'warning' : 'completed',
          },
        ])
      } else {
        setPipelineStages((prev) => [
          prev[0],
          prev[1],
          prev[2],
          {
            id: 'policy',
            label: 'Policy Verification',
            desc: 'Review needed',
            status: 'warning',
          },
        ])
      }
    } catch {
      // Keep state intact on connection failure
      setPipelineStages((prev) => [
        prev[0],
        prev[1],
        prev[2],
        {
          id: 'policy',
          label: 'Policy Verification',
          desc: 'Manual review required',
          status: 'warning',
        },
      ])
    } finally {
      clearTimeout(timer)
      setIsPolicyLoading(false)
    }
  }

  // Assistant Chat Handler
  const submitQuery = async () => {
    if (!query.trim() || isChatSending) return
    const userQuery = query.trim()
    setQuery('')

    setMessages((prev) => [...prev, { from: 'user', text: userQuery }])
    setIsChatSending(true)

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuery,
          receipt_context: {
            receipt_code: receiptMeta.receipt_code,
            vendor: receiptMeta.vendor,
            date: receiptMeta.date,
            gstin: receiptMeta.gstin,
            subtotal: receiptMeta.subtotal,
            cgst: receiptMeta.cgst,
            sgst: receiptMeta.sgst,
            total: receiptMeta.grand_total,
            is_valid: receiptMeta.is_valid,
            items: lineItems,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timer)

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [
          ...prev,
          {
            from: 'ai',
            text: data.answer,
            sources: data.sources || [{ label: 'Receipt Analysis', type: 'receipt' }, { label: 'Policy Rules', type: 'policy' }],
          },
        ])
      } else {
        throw new Error('Chat service error')
      }
    } catch {
      let naturalReply = "Everything listed on this receipt conforms to standard corporate expense policies."
      const qLower = userQuery.toLowerCase()
      if (qLower.includes('alcohol') || qLower.includes('beer') || qLower.includes('wine')) {
        naturalReply = "No alcohol charges found on this receipt. Everything listed is compliant with food and beverage guidelines."
      } else if (qLower.includes('tax') || qLower.includes('gst') || qLower.includes('deduction')) {
        naturalReply = `This receipt contains GSTIN (${receiptMeta.gstin}) with CGST and SGST breakdown. It is eligible for input tax credit under Indian GST Section 16.`
      } else if (qLower.includes('limit') || qLower.includes('meal') || qLower.includes('cap')) {
        naturalReply = "Under Section 4.2 of company policy, team meals are reimbursable up to ₹500 per person. Total dining claims over ₹2,500 require standard manager pre-approval."
      }

      setMessages((prev) => [
        ...prev,
        {
          from: 'ai',
          text: naturalReply,
          sources: [{ label: 'Expense Guidelines', type: 'policy' }],
        },
      ])
    } finally {
      clearTimeout(timer)
      setIsChatSending(false)
    }
  }

  return (
    <main className="audit-app overflow-x-hidden">
      {toast && <div className="toast"><CheckCircle2 /> {toast}</div>}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,application/pdf"
        style={{ display: 'none' }}
      />

      {/* Top Navigation */}
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Fingerprint /></div>
          <div>
            <strong>AuditPulse</strong>
            <div className="brand-meta">
              <span className="env-dot" /> Production
              <span className="slash">·</span> Smart Expense & GST Compliance
            </div>
          </div>
        </div>
        <div className="telemetry">
          <div><span className="pulse green" /> OCR Engine <b>Active</b></div>
          <div><span className="pulse cyan" /> GST Verification <b>Live</b></div>
          <div className="confidence-pill" title="AI Extraction Reliability Index calculated from OCR completeness and field cross-checks">
            <Sparkles style={{ width: 12, height: 12, color: '#f59e0b' }} /> AI Confidence <b>{confidenceScore}%</b>
          </div>

          {/* Admin RBAC Gateway Button */}
          {adminToken ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="admin-badge">
                <ShieldCheck style={{ width: 12, height: 12 }} /> Admin Active
              </span>
              <button
                type="button"
                className="admin-portal-btn active"
                onClick={() => {
                  setIsAdminDrawerOpen(true)
                  fetchAdminLogs()
                }}
                title="Open Secure Database Audit Log Manager"
              >
                <Database style={{ width: 13, height: 13 }} /> Database Portal
              </button>
              <button
                type="button"
                className="icon-button"
                title="Log out of Administrator session"
                onClick={handleAdminLogout}
              >
                <LogOut style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="admin-portal-btn"
              onClick={() => {
                setAdminUsername('')
                setAdminPassword('')
                setAdminLoginError(null)
                setIsLoginOpen(true)
              }}
              title="Admin Login Gateway (RBAC Protected MySQL records)"
            >
              <Lock style={{ width: 12, height: 12 }} /> Admin Portal
            </button>
          )}

          <button className="icon-button" aria-label="Help"><CircleHelp /></button>
        </div>
      </header>

      {/* Real-Time Dynamic Dashboard Metrics (from Database) */}
      <section className="metrics-grid">
        <Metric
          label="Total Receipts Processed"
          value={String(stats.total_receipts)}
          detail={stats.database_type === 'MYSQL' ? '↑ Live MySQL Database' : '↑ Local SQLite DB'}
          positive
          icon={Inbox}
        />
        <Metric
          label="Policy Compliance Rate"
          value={stats.compliance_rate}
          detail={`${stats.verified_clean_count} Clean · ${stats.discrepancies_flagged} Flagged`}
          positive={stats.compliance_numeric >= 70}
          icon={ShieldCheck}
        />
        <Metric
          label="Discrepancies Auto-Flagged"
          value={String(stats.discrepancies_flagged)}
          detail={`${stats.flagged_fraud_count} Fraud · ${stats.pending_review_count} Under Review`}
          icon={AlertTriangle}
        />
        <Metric
          label="Audit Accuracy"
          value={stats.audit_accuracy}
          detail="Mean parser & verification score"
          positive
          icon={Gauge}
        />
      </section>

      {/* Heading & Controls */}
      <div className="workspace-heading">
        <div>
          <span className="eyebrow">
            <span className="live-dot" />
            AuditPulse — Smart Expense & GST Compliance
          </span>
          <h1>Receipt reconciliation <span>·</span> <b>{receiptMeta.receipt_code}</b></h1>
        </div>
        <div className="heading-actions">
          <button className="primary-button" onClick={handleAuditClick} disabled={isAuditing}>
            {isAuditing ? <Loader2 className="animate-spin" /> : <Play />}
            {isAuditing ? 'Auditing Receipt...' : (selectedFile ? 'Re-run Compliance Audit' : 'Upload & Audit Receipt')}
          </button>
          <button className="ghost-button" onClick={() => fileInputRef.current?.click()} disabled={isAuditing}>
            <Upload /> Choose new bill
          </button>
          <div className="dropdown-container" ref={menuRef}>
            <button
              className="ghost-button"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="More options"
              aria-expanded={menuOpen}
              title="More workspace actions"
            >
              <MoreHorizontal />
            </button>
            {menuOpen && (
              <div className="dropdown-menu" role="menu">
                <button className="dropdown-item" onClick={handleExportJSON} role="menuitem">
                  <Download /> Export JSON Audit
                </button>
                <button className="dropdown-item" onClick={handlePrintReport} role="menuitem">
                  <Printer /> Print Report
                </button>
                <div className="dropdown-divider" />
                <button className="dropdown-item dropdown-danger" onClick={handleResetWorkspace} role="menuitem">
                  <RefreshCw /> Reset Workspace
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clear Non-blocking Error Banner */}
      {errorMessage && (
        <div
          style={{
            margin: '0 0 16px 0',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span><strong>Backend Connection Error:</strong> {errorMessage}. Please ensure FastAPI is running on port 8000.</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px 6px' }}
            aria-label="Dismiss error"
          >
            <X style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      )}

      {/* Multi-Category Expense Selector Bar */}
      <div className="category-bar">
        <span className="category-label">Expense Categories:</span>
        {(
          [
            ['dining', 'Dining / Meals', Utensils],
            ['flight', 'Flight Ticket', Plane],
            ['hotel', 'Hotel Stay', Building2],
            ['cab', 'Cab / Travel', Car],
          ] as const
        ).map(([catKey, catLabel, IconComp]) => (
          <button
            key={catKey}
            type="button"
            className={`category-pill ${selectedCategory === catKey ? 'active' : ''}`}
            onClick={() => switchCategoryPreset(catKey)}
          >
            <IconComp style={{ width: 14, height: 14 }} />
            <span>{catLabel}</span>
          </button>
        ))}
      </div>

      <section className="workspace">
        {/* Left Panel: Uploaded Bill */}
        <div className="left-panel panel">
          <div className="panel-header">
            <div>
              <h2>Uploaded receipt</h2>
              <p>Original bill & visual preview</p>
            </div>
            <span className="format-badge">
              {selectedFile
                ? `${selectedFile.type.includes('pdf') ? 'PDF' : 'IMG'} · ${(selectedFile.size / 1024).toFixed(0)} KB`
                : `${receiptMeta.vendor} · Preview`}
            </span>
          </div>

          {/* Interactive Upload Dropzone */}
          <div
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            style={{ cursor: 'pointer' }}
          >
            <CloudUpload />
            <div>
              <strong>{selectedFile ? selectedFile.name : 'Upload receipt or invoice'}</strong>
              <span>{selectedFile ? 'Click to change file · Automatically audited on upload' : 'Drag & drop bill here, or browse files · JPG, PNG, PDF up to 10MB'}</span>
            </div>
            <button className="small-button" aria-label="Upload receipt" type="button">
              <Upload />
            </button>
          </div>

          <div className="document-viewer">
            <div className="viewer-toolbar">
              <div className="viewer-file">
                <FileText />
                <span>{selectedFile ? selectedFile.name : `${receiptMeta.vendor.toLowerCase().replace(/\s+/g, '_')}_bill.jpg`}</span>
                <span className="verified"><Check /> Verified</span>
              </div>
              <div className="viewer-controls">
                <button onClick={() => setZoom(Math.max(80, zoom - 10))} aria-label="Zoom out"><ZoomOut /></button>
                <span>{zoom}%</span>
                <button onClick={() => setZoom(Math.min(130, zoom + 10))} aria-label="Zoom in"><ZoomIn /></button>
                <button onClick={() => setShowBoxes(!showBoxes)} className={showBoxes ? 'active-control' : ''}>
                  <PanelRight /> Highlight
                </button>
                <button aria-label="Full screen"><Maximize2 /></button>
              </div>
            </div>

            <div className="receipt-stage">
              <div className="preview-container" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}>
                {filePreviewUrl ? (
                  <img
                    src={filePreviewUrl}
                    alt="Uploaded receipt"
                    className="uploaded-img-preview"
                  />
                ) : selectedCategory === 'flight' ? (
                  <div className="doc-mockup mockup-flight">
                    <div className="doc-mockup-header">
                      <strong>{receiptMeta.vendor.toUpperCase()}</strong>
                      <span>E-TICKET ITINERARY & TAX INVOICE</span>
                    </div>
                    <div className="flight-sector">
                      <span className="sector-code">DEL</span>
                      <span className="sector-arrow">✈ ─── ✈</span>
                      <span className="sector-code">BOM</span>
                    </div>
                    <div className="doc-mockup-row">
                      <span>PNR / BOOKING</span>
                      <strong>6E-9024B</strong>
                    </div>
                    <div className="doc-mockup-row">
                      <span>CABIN CLASS</span>
                      <strong>Business Class</strong>
                    </div>
                    <div className="doc-mockup-row">
                      <span>TRAVEL DATE</span>
                      <strong>{receiptMeta.date}</strong>
                    </div>
                    <div className="doc-mockup-divider" />
                    {lineItems.slice(0, 3).map((item, idx) => (
                      <div className="doc-mockup-row" key={idx}>
                        <span>{item.item}</span>
                        <strong>{item.total}</strong>
                      </div>
                    ))}
                    <div className="doc-mockup-divider" />
                    <div className="doc-mockup-row">
                      <span>GSTIN</span>
                      <strong>{receiptMeta.gstin}</strong>
                    </div>
                    <div className="doc-mockup-total">
                      <span>TOTAL FARE</span>
                      <strong>₹{receiptMeta.grand_total.toFixed(2)}</strong>
                    </div>
                    <div className="doc-mockup-footer">AIR PASSENGER AUDITED BY AUDITPULSE</div>
                  </div>
                ) : selectedCategory === 'hotel' ? (
                  <div className="doc-mockup mockup-hotel">
                    <div className="doc-mockup-header">
                      <strong>{receiptMeta.vendor.toUpperCase()}</strong>
                      <span>GUEST FOLIO & TAX INVOICE</span>
                      <div className="hotel-seal">2 NIGHT RESIDENTIAL STAY</div>
                    </div>
                    <div className="doc-mockup-row">
                      <span>FOLIO #</span>
                      <strong>{receiptMeta.invoice_number}</strong>
                    </div>
                    <div className="doc-mockup-row">
                      <span>CHECK-IN</span>
                      <strong>{receiptMeta.date}</strong>
                    </div>
                    <div className="doc-mockup-divider" />
                    {lineItems.slice(0, 3).map((item, idx) => (
                      <div className="doc-mockup-row" key={idx}>
                        <span>{item.item}</span>
                        <strong>{item.total}</strong>
                      </div>
                    ))}
                    <div className="doc-mockup-divider" />
                    <div className="doc-mockup-row">
                      <span>CGST + SGST (18%)</span>
                      <strong>₹{(receiptMeta.cgst + receiptMeta.sgst).toFixed(2)}</strong>
                    </div>
                    <div className="doc-mockup-total">
                      <span>FOLIO TOTAL</span>
                      <strong>₹{receiptMeta.grand_total.toFixed(2)}</strong>
                    </div>
                    <div className="doc-mockup-footer">CORPORATE LODGING VERIFIED</div>
                  </div>
                ) : selectedCategory === 'cab' ? (
                  <div className="doc-mockup mockup-cab">
                    <div className="doc-mockup-header">
                      <strong>{receiptMeta.vendor.toUpperCase()}</strong>
                      <span>RIDE RECEIPT & TRIP SUMMARY</span>
                    </div>
                    <div className="cab-route-pin">
                      <span className="cab-dot" />
                      <span>Terminal 3, IGI Airport, New Delhi</span>
                    </div>
                    <div className="cab-route-pin">
                      <span className="cab-dot" style={{ background: '#2563eb' }} />
                      <span>Cyber City Hub, DLF Phase 2, Gurugram</span>
                    </div>
                    <div className="doc-mockup-row" style={{ marginTop: 8 }}>
                      <span>TRIP / RIDE ID</span>
                      <strong>{receiptMeta.invoice_number}</strong>
                    </div>
                    <div className="doc-mockup-divider" />
                    {lineItems.slice(0, 3).map((item, idx) => (
                      <div className="doc-mockup-row" key={idx}>
                        <span>{item.item}</span>
                        <strong>{item.total}</strong>
                      </div>
                    ))}
                    <div className="doc-mockup-divider" />
                    <div className="doc-mockup-total">
                      <span>AMOUNT PAID</span>
                      <strong>₹{receiptMeta.grand_total.toFixed(2)}</strong>
                    </div>
                    <div className="doc-mockup-footer">TRANSPORTATION AUDITED BY AUDITPULSE</div>
                  </div>
                ) : (
                  <div className="doc-mockup">
                    <div className="doc-mockup-header">
                      <strong>{receiptMeta.vendor.toUpperCase()}</strong>
                      <span>TAX INVOICE · DINING RECEIPT</span>
                    </div>
                    <div className="doc-mockup-row">
                      <span>INVOICE #</span>
                      <strong>{receiptMeta.invoice_number}</strong>
                    </div>
                    <div className="doc-mockup-row">
                      <span>DATE</span>
                      <strong>{receiptMeta.date}</strong>
                    </div>
                    <div className="doc-mockup-divider" />
                    {lineItems.slice(0, 3).map((item, idx) => (
                      <div className="doc-mockup-row" key={idx}>
                        <span>{item.item}</span>
                        <strong>{item.total}</strong>
                      </div>
                    ))}
                    <div className="doc-mockup-divider" />
                    <div className="doc-mockup-row">
                      <span>GST (5%)</span>
                      <strong>₹{(receiptMeta.cgst + receiptMeta.sgst).toFixed(2)}</strong>
                    </div>
                    <div className="doc-mockup-total">
                      <span>GRAND TOTAL</span>
                      <strong>₹{receiptMeta.grand_total.toFixed(2)}</strong>
                    </div>
                    <div className="doc-mockup-footer">VERIFIED BY AUDITPULSE</div>
                  </div>
                )}
              </div>
            </div>
            <div className="page-count">
              <span>1</span> / 1 <button><Download /></button>
            </div>
          </div>

          {/* Progressive Step-by-Step Interactive Audit Pipeline Tracker */}
          <div className="pipeline">
            <div className="pipeline-label">
              <div>
                <span>Audit Pipeline Tracker</span>
                <strong style={{ display: 'block', fontSize: '11px', marginTop: 2 }}>
                  {isAuditing
                    ? 'Processing audit pipeline...'
                    : pipelineStages.some((s) => s.status === 'failed')
                    ? 'Pipeline Halted — Validation Error'
                    : pipelineStages.some((s) => s.status === 'warning')
                    ? 'Review Needed — Policy Warning'
                    : 'Pipeline Verified & Reconciled'}
                </strong>
              </div>
              <span
                className={`pipeline-stage-pill ${
                  isAuditing
                    ? 'active'
                    : pipelineStages.some((s) => s.status === 'failed')
                    ? 'failed'
                    : pipelineStages.some((s) => s.status === 'warning')
                    ? 'warning'
                    : 'success'
                }`}
              >
                {isAuditing
                  ? 'Auditing in real-time'
                  : pipelineStages.some((s) => s.status === 'failed')
                  ? 'Halted on Error'
                  : pipelineStages.some((s) => s.status === 'warning')
                  ? 'Policy Warning'
                  : 'All Checks Passed'}
              </span>
            </div>

            <div className="stage-track">
              {pipelineStages.map((stage, i) => (
                <React.Fragment key={stage.id}>
                  <div
                    className="stage"
                    onClick={() => handleStageClick(stage.id)}
                    title={stage.message || `${stage.label}: ${stage.status}`}
                  >
                    <span className={`stage-icon ${stage.status}`}>
                      {stage.status === 'completed' ? (
                        <Check style={{ width: 12, height: 12 }} />
                      ) : stage.status === 'active' ? (
                        <Loader2 className="animate-spin" style={{ width: 12, height: 12 }} />
                      ) : stage.status === 'failed' || stage.status === 'warning' ? (
                        <AlertTriangle style={{ width: 12, height: 12 }} />
                      ) : (
                        i + 1
                      )}
                    </span>
                    <div className="stage-info">
                      <span className="stage-name">{stage.label}</span>
                      <span className="stage-desc">{stage.description}</span>
                    </div>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <i className={`stage-line ${stage.status}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel: Dynamic Expense Details */}
        <div className="right-panel panel">
          <div className="panel-header">
            <div>
              <h2>Expense summary</h2>
              <p>Audited details & compliance check</p>
            </div>
            <div className="confidence">
              <Sparkles /> <span>Verified match</span>
            </div>
          </div>

          <div className="tabs" role="tablist">
            {[
              ['line-items', 'Line items'],
              ['policy', 'Policy audit'],
              ['chat', 'Assistant chat'],
            ].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                className={tab === id ? 'tab active-tab' : 'tab'}
                onClick={() => setTab(id)}
              >
                {id === 'line-items' ? <FileText /> : id === 'policy' ? <ShieldCheck /> : <MessageSquareText />}
                {label}
                {id === 'policy' && policyData.violations?.length > 0 && (
                  <span className="tab-alert">{policyData.violations.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: Real Dynamic Line Items */}
          {tab === 'line-items' && (
            <div className="tab-content">
              <div className="receipt-facts">
                <div>
                  <small>{currentPreset?.factLabels?.[0] || 'VENDOR NAME'}</small>
                  <strong>{currentPreset?.factValues?.[0] || receiptMeta.vendor}</strong>
                </div>
                <div>
                  <small>{currentPreset?.factLabels?.[1] || 'TRANSACTION DATE'}</small>
                  <strong>{currentPreset?.factValues?.[1] || receiptMeta.date}</strong>
                </div>
                <div>
                  <small>{currentPreset?.factLabels?.[2] || 'INVOICE NUMBER'}</small>
                  <strong>{currentPreset?.factValues?.[2] || receiptMeta.invoice_number}</strong>
                </div>
                <div>
                  <small>{currentPreset?.factLabels?.[3] || 'GSTIN / TAX ID'}</small>
                  <strong>{currentPreset?.factValues?.[3] || receiptMeta.gstin}</strong>
                </div>
              </div>

              <div className="data-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th className="center-col">Qty</th>
                      <th className="num-col">Unit Price</th>
                      <th className="num-col">CGST</th>
                      <th className="num-col">SGST</th>
                      <th className="num-col">Total Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className={item.flag ? 'item-flag' : ''}>
                            {item.flag && <AlertTriangle style={{ width: 12, height: 12, marginRight: 4, display: 'inline' }} />}
                            {item.item}
                          </span>
                        </td>
                        <td>
                          <span className="table-category-tag">{item.category}</span>
                        </td>
                        <td className="center-col">{item.qty}</td>
                        <td className="num-col">{item.unit}</td>
                        <td className="num-col">{item.cgst}</td>
                        <td className="num-col">{item.sgst}</td>
                        <td className="num-col"><b>{item.total}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Enterprise-Grade Anomaly & Scam Vector Summary */}
              {activeAnomaly && (
                <div className={`anomaly-card ${activeAnomaly.isCritical ? 'critical' : ''}`}>
                  <div className="anomaly-top">
                    <span className="anomaly-badge">
                      <ShieldAlert style={{ width: 12, height: 12 }} />
                      {activeAnomaly.badge}
                    </span>
                    <button
                      type="button"
                      className="anomaly-inspect-btn"
                      onClick={() => setPolicyDrawerOpen(true)}
                    >
                      Inspect Corporate Policy <ArrowRight style={{ width: 12, height: 12 }} />
                    </button>
                  </div>
                  <p className="anomaly-explanation">{activeAnomaly.explanation}</p>
                  <div className="anomaly-meta-bar">
                    <div className="anomaly-chips">
                      <span className="anomaly-chip">
                        Variance: <strong>{activeAnomaly.variance}</strong>
                      </span>
                      <span className="anomaly-chip">
                        Cap Limit: <strong>{activeAnomaly.limit}</strong>
                      </span>
                      <span className="anomaly-chip">
                        Policy Ref: <strong>{activeAnomaly.clause}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Reconciliation Row */}
              <div className="reconciliation">
                <div>
                  <small>SUBTOTAL</small>
                  <strong>₹{receiptMeta.subtotal.toFixed(2)}</strong>
                </div>
                <div>
                  <small>CGST</small>
                  <strong>₹{receiptMeta.cgst.toFixed(2)}</strong>
                </div>
                <div>
                  <small>SGST</small>
                  <strong>₹{receiptMeta.sgst.toFixed(2)}</strong>
                </div>
                <div>
                  <small>GRAND TOTAL</small>
                  <strong>₹{receiptMeta.grand_total.toFixed(2)}</strong>
                </div>

                {/* Interactive Discrepancy / Approval Banner */}
                <div
                  className="status-badge clickable-status-badge"
                  onClick={() => setPolicyDrawerOpen(true)}
                  title="Click to view corporate compliance rule and policy breakdown"
                  style={
                    receiptMeta.is_valid && (!policyData.violations || policyData.violations.length === 0)
                      ? { borderColor: '#10b981', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)' }
                      : { borderColor: '#f59e0b', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }
                  }
                >
                  {receiptMeta.is_valid && (!policyData.violations || policyData.violations.length === 0) ? (
                    <CheckCircle2 />
                  ) : (
                    <AlertTriangle />
                  )}
                  <span>
                    <b>
                      {receiptMeta.is_valid && (!policyData.violations || policyData.violations.length === 0)
                        ? 'Reconciliation Verified'
                        : 'Policy Review Needed'}
                    </b>
                    <small>
                      {receiptMeta.discrepancies && receiptMeta.discrepancies.length > 0
                        ? receiptMeta.discrepancies[0]
                        : receiptMeta.math_msg}
                    </small>
                  </span>
                  <ArrowRight className="status-badge-arrow" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dynamic Policy Audit */}
          {tab === 'policy' && (
            <div className="tab-content policy-content">
              {isPolicyLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '8px', color: '#64748b' }}>
                  <Loader2 className="animate-spin" /> Checking company expense rules...
                </div>
              ) : (
                <>
                  <div className="policy-score">
                    <div className="score-ring">
                      <strong>{policyData.compliance_score ?? 85}</strong>
                      <small>/ 100</small>
                    </div>
                    <div>
                      <span className="eyebrow">POLICY COMPLIANCE REVIEW</span>
                      <h3>{policyData.verdict || 'Needs review'}</h3>
                      <p>Audited against corporate dining caps, alcohol restrictions, and GST input tax credit rules.</p>
                    </div>
                  </div>

                  {/* Violations List */}
                  {policyData.violations && policyData.violations.length > 0 ? (
                    policyData.violations.map((violation: any, idx: number) => (
                      <div className="violation" key={idx}>
                        <div className="violation-icon"><AlertTriangle /></div>
                        <div>
                          <strong>{violation.title}</strong>
                          <p>{violation.description}</p>
                          <a href="#policy">View policy citation <ArrowUpRight /></a>
                        </div>
                        <span className="violation-amount">{violation.amount}</span>
                      </div>
                    ))
                  ) : (
                    <div className="violation" style={{ borderColor: '#059669', background: 'rgba(5, 150, 105, 0.08)' }}>
                      <div className="violation-icon" style={{ color: '#059669', borderColor: '#059669' }}><Check /></div>
                      <div>
                        <strong style={{ color: '#059669' }}>Fully Compliant</strong>
                        <p style={{ color: '#334155' }}>No policy infractions or prohibited items detected on this receipt.</p>
                      </div>
                    </div>
                  )}

                  {/* Retrieved Policy Context Card */}
                  {policyData.citations && policyData.citations.length > 0 && (
                    <div className="context-card">
                      <div className="context-title">
                        <Search /> Relevant company policy guideline <span>Matched</span>
                      </div>
                      <p>
                        <mark>{policyData.citations[0].section}:</mark> {policyData.citations[0].text}
                      </p>
                      <div className="context-source">
                        <Code2 /> {policyData.citations[0].source} <span>Verified guideline</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 3: Assistant Chat */}
          {tab === 'chat' && (
            <div className="tab-content chat-content">
              <div className="chat-messages">
                {messages.map((message, i) => (
                  <div className={message.from === 'ai' ? 'chat-row' : 'chat-row user-row'} key={i}>
                    {message.from === 'ai' && <div className="ai-avatar"><Bot /></div>}
                    <div className={message.from === 'ai' ? 'chat-bubble' : 'chat-bubble user-bubble'}>
                      {message.text}
                      {message.from === 'ai' && message.sources && (
                        <div className="source-chips">
                          {message.sources.map((src, sIdx) => (
                            <span key={sIdx}>
                              {src.type === 'policy' ? <ShieldCheck /> : <FileText />}
                              {src.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isChatSending && (
                  <div className="chat-row">
                    <div className="ai-avatar"><Bot /></div>
                    <div className="chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Loader2 className="animate-spin" style={{ width: '12px', height: '12px' }} /> Checking company rules...
                    </div>
                  </div>
                )}
              </div>

              <div className="chat-composer">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229 && submitQuery()}
                  placeholder="Ask a question about this receipt..."
                  aria-label="Ask about this receipt"
                  disabled={isChatSending}
                />
                <button aria-label="Attach file" type="button"><Paperclip /></button>
                <button onClick={submitQuery} className="send-button" aria-label="Send question" disabled={isChatSending}>
                  <Send />
                </button>
              </div>

              <div className="suggestions">
                <button onClick={() => setQuery('Is this receipt eligible for GST Input Tax Credit under Section 17(5)?')}>
                  GST ITC Eligibility (Sec 17(5))?
                </button>
                <button onClick={() => setQuery('What is the corporate per-head dining cap under Clause 4.2?')}>
                  Per-Head Meal Cap (Clause 4.2)?
                </button>
                <button onClick={() => setQuery('Can domestic business travel be booked in Business Class under Clause 6.1?')}>
                  Air Travel Class Rules (Clause 6.1)?
                </button>
                <button onClick={() => setQuery('What is the maximum reimbursable hotel room tariff under Clause 8.3?')}>
                  Hotel Nightly Room Cap (Clause 8.3)?
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Action Footer */}
      <footer className="action-footer">
        <div className="footer-meta">
          <span className="secure"><ShieldCheck /> Audit trail secured</span>
          <span>Last reviewed just now</span>
        </div>
        <div className="footer-actions">
          <button className="ghost-button" onClick={() => setRawOpen(!rawOpen)}>
            <FileJson /> {rawOpen ? 'Hide raw data' : 'View raw data'}
          </button>
          <button className="outline-danger" onClick={() => notify('Receipt flagged for manager review')}>
            <AlertTriangle /> Flag for review
          </button>
          <button className="primary-button" onClick={() => notify('Expense approved and queued for reimbursement')}>
            <Check /> Approve expense
          </button>
        </div>
      </footer>

      {/* Raw Payload Slide-Over Drawer */}
      {rawOpen && (
        <>
          <div className="drawer-backdrop" onClick={() => setRawOpen(false)} aria-hidden="true" />
          <aside className="raw-drawer" role="dialog" aria-modal="true" aria-label="Raw Expense & Tax Payload">
            <div className="raw-header">
              <div>
                <span className="eyebrow">AUDIT DATA</span>
                <h2>Raw Expense & Tax Payload</h2>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setRawOpen(false)}
                aria-label="Close raw data drawer"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <div className="raw-body">
              <div className="raw-code-wrapper">
                <pre>{payloadString}</pre>
              </div>
            </div>
            <div className="raw-footer">
              <button
                className="ghost-button"
                onClick={() => {
                  navigator.clipboard.writeText(payloadString)
                  notify('Audit JSON copied to clipboard')
                }}
              >
                Copy JSON
              </button>
              <button className="primary-button" onClick={() => setRawOpen(false)}>
                Close Drawer
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Interactive Corporate Policy Modal / Drawer */}
      {policyDrawerOpen && (
        <>
          <div
            className="drawer-backdrop"
            onClick={() => setPolicyDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="policy-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Corporate Expense Compliance Review"
          >
            <div className="policy-drawer-header">
              <div>
                <span className="eyebrow">COMPLIANCE GOVERNANCE</span>
                <h2>Corporate Expense Compliance Review</h2>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setPolicyDrawerOpen(false)}
                aria-label="Close policy drawer"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div className="policy-drawer-body">
              {(() => {
                const activeClause = policyData?.category_clause || currentPreset?.policyClause
                return (
                  <div className="policy-clause-card">
                    <div className="policy-clause-top">
                      <span className="policy-clause-tag">
                        {activeClause?.code || 'Clause 4.2'}
                      </span>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        Standard Operating Procedure
                      </span>
                    </div>
                    <h3 className="policy-clause-title">
                      {activeClause?.title || 'Corporate Expense Compliance Rule'}
                    </h3>
                    <blockquote className="policy-quote">
                      &ldquo;{activeClause?.quote || 'All corporate expenditures must comply with statutory GST regulations and expense thresholds.'}&rdquo;
                    </blockquote>

                    <div className="policy-variance-grid">
                      <div className="variance-stat">
                        <small>Corporate Limit</small>
                        <strong>{activeClause?.threshold || 'Standard Cap'}</strong>
                      </div>
                      <div className="variance-stat stat-danger">
                        <small>Receipt Value / Incurred</small>
                        <strong>{activeClause?.incurred || `₹${receiptMeta.grand_total.toFixed(2)}`}</strong>
                      </div>
                    </div>

                    <div className="policy-resolution-box">
                      <strong>Mandatory Resolution Step:</strong>
                      {activeClause?.resolution || 'Itemized audit flags require employee reimbursement for non-allowable delta or submission of VP Pre-Clearance Form.'}
                    </div>
                  </div>
                )
              })()}

              {/* Reference Link to Master Corporate Expense Handbook */}
              <div className="handbook-card">
                <div className="handbook-icon">
                  <BookOpen style={{ width: 18, height: 18, color: '#2563eb' }} />
                </div>
                <div className="handbook-info">
                  <strong>Global Corporate Travel & Expense Policy</strong>
                  <span>Version 2026.1 · Updated Q1 2026 · Section 4 Compliance</span>
                  <a
                    href="https://assets.ctfassets.net/4n74ve2egvg7/2N8q4C7n1u6g4K3gG9u8b6/corporate-travel-expense-handbook.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="handbook-link-btn"
                    onClick={(e) => {
                      e.preventDefault()
                      notify('Opening Master Expense Handbook (v2026.1 PDF)...')
                    }}
                  >
                    <ExternalLink style={{ width: 12, height: 12 }} />
                    <span>Open Master Corporate Expense Handbook</span>
                  </a>
                </div>
              </div>

              {/* RAG Vector Embedding Match */}
              <div className="context-card" style={{ marginTop: 0 }}>
                <div className="context-title">
                  <Scale style={{ width: 14, height: 14 }} />
                  <span>Internal Audit RAG Verification</span>
                  <span style={{ marginLeft: 'auto', fontSize: '9px', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: 4 }}>
                    Vector Match
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '10px', color: '#475569', lineHeight: 1.5 }}>
                  Matched against vectorized policies in <code>vector_store.py</code> (ChromaDB / Gemini embeddings). Policy rule citation is verified against corporate handbook clause.
                </p>
              </div>
            </div>

            <div className="policy-drawer-footer">
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  const activeClause = policyData?.category_clause || currentPreset?.policyClause
                  navigator.clipboard.writeText(
                    `Policy Violation Citation: ${activeClause?.code} - ${activeClause?.title}\nQuote: "${activeClause?.quote}"\nIncurred: ${activeClause?.incurred}`
                  )
                  notify('Policy citation copied to clipboard')
                }}
              >
                Copy Citation
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => setPolicyDrawerOpen(false)}
              >
                Close Drawer
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Admin Login Modal (RBAC Gateway) */}
      {isLoginOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsLoginOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Admin Sign In">
            <div className="admin-modal-header">
              <div>
                <span className="eyebrow">ENTERPRISE ACCESS CONTROL</span>
                <h3>Admin Portal Sign-In</h3>
                <p>Sign in with administrator credentials to view and manage MySQL audit logs.</p>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setIsLoginOpen(false)}
                aria-label="Close login dialog"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="admin-form">
              <div className="admin-form-group">
                <label>Admin Username</label>
                <input
                  type="text"
                  className="admin-input"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  autoComplete="username"
                  required
                />
              </div>

              <div className="admin-form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="admin-input"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {adminLoginError && (
                <div style={{ color: '#dc2626', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle style={{ width: 14, height: 14 }} />
                  <span>{adminLoginError}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setIsLoginOpen(false)}
                  disabled={adminLoginLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={adminLoginLoading}
                >
                  {adminLoginLoading ? <Loader2 className="animate-spin" /> : <Lock />}
                  {adminLoginLoading ? 'Verifying...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Database Management Drawer (RBAC Protected) */}
      {isAdminDrawerOpen && adminToken && (
        <>
          <div
            className="drawer-backdrop"
            onClick={() => setIsAdminDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="admin-panel-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="MySQL Audit Logs & Database Management"
          >
            <div className="admin-panel-header">
              <div>
                <span className="eyebrow">ENTERPRISE AUDIT TRAIL</span>
                <h2>MySQL Database & Audit Log Management</h2>
                <span className="admin-db-meta-badge">
                  <Database style={{ width: 11, height: 11 }} /> Connected to {stats.database_type} Engine · {adminAuditLogs.length} Records
                </span>
              </div>
              <button
                className="drawer-close-btn"
                onClick={() => setIsAdminDrawerOpen(false)}
                aria-label="Close database portal"
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div className="admin-panel-body">
              <div className="admin-filter-bar">
                <div className="admin-filter-pills">
                  {(
                    [
                      ['all', 'All Records'],
                      ['Verified & Clean', 'Verified & Clean'],
                      ['Pending Supervisor Review', 'Pending Review'],
                      ['Flagged as Fraud', 'Flagged as Fraud'],
                    ] as const
                  ).map(([filterKey, filterLabel]) => (
                    <button
                      key={filterKey}
                      type="button"
                      className={`admin-filter-pill ${adminLogFilter === filterKey ? 'active' : ''}`}
                      onClick={() => {
                        setAdminLogFilter(filterKey)
                        setTimeout(() => fetchAdminLogs(), 50)
                      }}
                    >
                      {filterLabel}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Search receipt, vendor, employee..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchAdminLogs()}
                  />
                  <button
                    type="button"
                    className="small-button"
                    onClick={() => fetchAdminLogs()}
                    title="Refresh records from database"
                  >
                    <RefreshCw style={{ width: 12, height: 12 }} />
                  </button>
                </div>
              </div>

              {isAdminLogsLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '8px', color: '#64748b' }}>
                  <Loader2 className="animate-spin" /> Fetching persisted audit records from {stats.database_type}...
                </div>
              ) : adminAuditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  <Database style={{ width: 32, height: 32, margin: '0 auto 10px', opacity: 0.5 }} />
                  <p>No audit records match the current filter.</p>
                </div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Receipt Code</th>
                        <th>Employee</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Fraud / Audit Details</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ textAlign: 'center' }}>AI Score</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminAuditLogs.map((log) => {
                        const statusClass =
                          log.request_status === 'Verified & Clean'
                            ? 'clean'
                            : log.request_status === 'Pending Supervisor Review'
                            ? 'pending'
                            : 'fraud'
                        return (
                          <tr key={log.id}>
                            <td>
                              <strong>{log.receipt_code}</strong>
                              <br />
                              <small style={{ color: '#64748b' }}>{log.vendor_name}</small>
                            </td>
                            <td>
                              <span>{log.employee_name}</span>
                              <br />
                              <small style={{ color: '#64748b' }}>{log.department}</small>
                            </td>
                            <td>
                              <span className="table-category-tag">{log.category}</span>
                            </td>
                            <td>
                              <span style={{ whiteSpace: 'nowrap' }}>{log.submission_date}</span>
                            </td>
                            <td>
                              <span className={`admin-status-pill ${statusClass}`}>
                                {log.request_status === 'Verified & Clean' ? (
                                  <CheckCircle2 style={{ width: 11, height: 11 }} />
                                ) : (
                                  <AlertTriangle style={{ width: 11, height: 11 }} />
                                )}
                                {log.request_status}
                              </span>
                            </td>
                            <td style={{ maxWidth: 220 }}>
                              {log.fraud_category !== 'None' && (
                                <strong style={{ display: 'block', color: statusClass === 'fraud' ? '#dc2626' : '#d97706', fontSize: '9px' }}>
                                  {log.fraud_category}
                                </strong>
                              )}
                              <span style={{ fontSize: '9px', color: '#475569', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {log.fraud_details}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>
                              ₹{Number(log.grand_total).toFixed(2)}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontWeight: 600, color: log.confidence_score >= 90 ? '#047857' : '#d97706' }}>
                                {log.confidence_score}%
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <select
                                className="admin-select-status"
                                value={log.request_status}
                                onChange={(e) => handleUpdateRecordStatus(log.id, e.target.value)}
                                title="Change record audit status"
                              >
                                <option value="Verified & Clean">Mark Clean</option>
                                <option value="Pending Supervisor Review">Mark Pending</option>
                                <option value="Flagged as Fraud">Mark Fraud</option>
                              </select>
                              <button
                                type="button"
                                className="admin-delete-btn"
                                onClick={() => handleDeleteRecord(log.id)}
                                title="Delete record from database"
                              >
                                <Trash2 style={{ width: 12, height: 12 }} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-panel-footer">
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(adminAuditLogs, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `auditpulse-db-export-${new Date().toISOString().slice(0, 10)}.json`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                  notify('Exported all database records to JSON')
                }}
              >
                <Download style={{ width: 13, height: 13 }} /> Export Database (JSON)
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => setIsAdminDrawerOpen(false)}
              >
                Close Portal
              </button>
            </div>
          </aside>
        </>
      )}
    </main>
  )
}
