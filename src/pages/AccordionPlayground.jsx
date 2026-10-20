import { useState, useMemo, useCallback } from 'react';
import Accordion from '../components/Accordion';
import accordionItems from '../data/accordionItems';
import './AccordionPlayground.css';

/* ─────────────────────────────────────────
   JSX code generator
───────────────────────────────────────── */
function generateJSX({ count, variant, iconType, iconPosition, headingLevel }) {
  const items = accordionItems.slice(0, count);

  const itemsStr = items
    .map(
      (item) =>
        `  {\n    id: '${item.id}',\n    title: '${item.title}',\n    answer: '${item.answer.slice(0, 40)}…',\n    disabled: ${item.disabled},\n  }`,
    )
    .join(',\n');

  return `import Accordion from './components/Accordion';

const items = [
${itemsStr}
];

export default function App() {
  return (
    <Accordion
      items={items}
      variant="${variant}"
      iconType="${iconType}"
      iconPosition="${iconPosition}"
      headingLevel={${headingLevel}}
    />
  );
}`;
}

/* ─────────────────────────────────────────
   Select control
───────────────────────────────────────── */
function SelectControl({ id, label, value, onChange, options }) {
  return (
    <div className="control-row">
      <label className="control-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="control-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─────────────────────────────────────────
   CopyButton
───────────────────────────────────────── */
function CopyButton({ text }) {
  const [status, setStatus] = useState('idle'); // idle | copied | error

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  }

  const label =
    status === 'copied'
      ? 'تم النسخ ✓'
      : status === 'error'
        ? 'تعذّر النسخ'
        : 'نسخ الكود';

  return (
    <button
      type="button"
      className={`copy-btn${status === 'copied' ? ' copy-btn--copied' : ''}${status === 'error' ? ' copy-btn--error' : ''}`}
      onClick={handleCopy}
      aria-label="نسخ كود الأكورديون إلى الحافظة"
    >
      {status === 'idle' && (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────
   Main Playground Page
───────────────────────────────────────── */
export default function AccordionPlayground() {
  // ── Configuration state ──
  const [count, setCount] = useState(5);
  const [variant, setVariant] = useState('default');
  const [iconType, setIconType] = useState('chevron');
  const [iconPosition, setIconPosition] = useState('end');
  const [headingLevel, setHeadingLevel] = useState('3');

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState('');

  // ── Compute visible items ──
  const baseItems = useMemo(() => accordionItems.slice(0, count), [count]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return baseItems;
    return baseItems.filter((item) =>
      item.title.includes(q) || item.answer.includes(q),
    );
  }, [baseItems, searchQuery]);

  // ── Generate JSX ──
  const generatedCode = useMemo(
    () =>
      generateJSX({ count, variant, iconType, iconPosition, headingLevel: Number(headingLevel) }),
    [count, variant, iconType, iconPosition, headingLevel],
  );

  const handleCountChange = useCallback((e) => {
    setCount(Number(e.target.value));
  }, []);

  const questionWord = (n) => {
    if (n === 1) return 'سؤال';
    if (n >= 2 && n <= 10) return 'أسئلة';
    return 'سؤال';
  };

  return (
    <div className="playground">
      {/* ── App Header ── */}
      <header className="app-header">
        <span className="app-header-logo" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
        </span>
        <span className="app-header-title">مكتبة المكونات</span>

        {/* Visual-only nav buttons — no actions */}
        <nav className="app-header-nav" aria-label="المكونات">
          <span className="app-header-nav-btn" aria-current="true">الأكورديون</span>
          <span className="app-header-nav-btn app-header-nav-btn--inactive">التبويبات</span>
          <span className="app-header-nav-btn app-header-nav-btn--inactive">النافذة المنبثقة</span>
        </nav>
      </header>

      {/* ── Page heading ── */}
      <div className="page-intro">
        <div className="page-heading-row">
          <span className="page-heading-accent" aria-hidden="true" />
          <h1 className="page-heading">الأكورديون</h1>
        </div>
        <p className="page-description">سؤال واحد أو أكثر، مع حركة وأيقونات وأشكال مختلفة.</p>
      </div>

      {/* ── Main two-column layout ── */}
      <main className="playground-layout">
        {/* ── LEFT column: preview + code ── */}
        <div className="playground-preview-col">
          {/* Search + counter */}
          <div className="search-bar">
            <div className="search-input-wrapper">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="ابحث عن سؤال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="البحث في الأسئلة"
                dir="auto"
              />
            </div>
            <span className="question-counter" aria-live="polite" aria-atomic="true">
              {filteredItems.length} {questionWord(filteredItems.length)}
            </span>
          </div>

          {/* Accordion preview */}
          <div className="accordion-preview">
            {filteredItems.length === 0 ? (
              <div className="empty-state" role="status">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="empty-state-icon">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>لا توجد أسئلة مطابقة لبحثك.</p>
              </div>
            ) : (
              <Accordion
                items={filteredItems}
                variant={variant}
                iconType={iconType}
                iconPosition={iconPosition}
                headingLevel={Number(headingLevel)}
              />
            )}
          </div>

          {/* Code preview */}
          <section className="code-section" aria-label="معاينة الكود">
            <div className="code-section-header">
              <h2 className="code-section-title">الكود</h2>
              <CopyButton text={generatedCode} />
            </div>
            <pre className="code-block" dir="ltr">
              <code>{generatedCode}</code>
            </pre>
          </section>
        </div>

        {/* ── RIGHT column: config panel ── */}
        <aside className="playground-config-col" aria-label="لوحة الإعدادات">
          <div className="config-panel">
            <h2 className="config-heading">الإعدادات</h2>

            {/* Count */}
            <div className="control-row control-row--range">
              <label className="control-label" htmlFor="ctrl-count">
                عدد الأسئلة
              </label>
              <div className="range-wrapper">
                <input
                  id="ctrl-count"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={count}
                  onChange={handleCountChange}
                  className="control-range"
                  aria-valuemin={1}
                  aria-valuemax={5}
                  aria-valuenow={count}
                />
                <span className="range-value">{count}</span>
              </div>
            </div>

            <div className="config-divider" />

            {/* Variant */}
            <SelectControl
              id="ctrl-variant"
              label="الشكل"
              value={variant}
              onChange={setVariant}
              options={[
                { value: 'default', label: 'افتراضي' },
                { value: 'bordered', label: 'محاط بإطار' },
                { value: 'separated', label: 'مفصول' },
              ]}
            />

            {/* Icon type */}
            <SelectControl
              id="ctrl-icon-type"
              label="نوع الأيقونة"
              value={iconType}
              onChange={setIconType}
              options={[
                { value: 'chevron', label: 'سهم (Chevron)' },
                { value: 'plus-minus', label: 'زائد/ناقص' },
              ]}
            />

            {/* Icon position */}
            <SelectControl
              id="ctrl-icon-position"
              label="موضع الأيقونة"
              value={iconPosition}
              onChange={setIconPosition}
              options={[
                { value: 'end', label: 'النهاية' },
                { value: 'start', label: 'البداية' },
              ]}
            />

            {/* Heading level */}
            <SelectControl
              id="ctrl-heading-level"
              label="مستوى العنوان"
              value={headingLevel}
              onChange={setHeadingLevel}
              options={[
                { value: '2', label: 'H2' },
                { value: '3', label: 'H3' },
                { value: '4', label: 'H4' },
              ]}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
