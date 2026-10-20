import { useState, useId, useRef, useEffect, useMemo } from 'react';
import './Accordion.css';

/* ─────────────────────────────────────────
   Icon helpers – pure SVG, no library
───────────────────────────────────────── */
function ChevronIcon({ open }) {
  return (
    <svg
      className={`accordion-icon accordion-icon--chevron${open ? ' accordion-icon--open' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PlusMinusIcon({ open }) {
  return (
    <svg
      className="accordion-icon accordion-icon--plusminus"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {open ? (
        <line x1="5" y1="12" x2="19" y2="12" />
      ) : (
        <>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────
   AnimatedPanel – handles height animation
   The effect owns height exclusively.
   No conflicting style prop on the element.
───────────────────────────────────────── */
function AnimatedPanel({ open, children, id, labelId }) {
  const ref = useRef(null);
  // Track whether this is the very first render so we can set the
  // initial collapsed state without triggering a transition.
  const isFirstRender = useRef(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (isFirstRender.current) {
      // On mount: set to 0 immediately (no animation) if closed,
      // or to auto if already open (shouldn't happen but safe).
      isFirstRender.current = false;
      el.style.height = open ? 'auto' : '0px';
      return;
    }

    if (open) {
      // Expand: measure natural height, animate up, then release to auto.
      el.style.height = '0px';          // start from 0
      void el.offsetHeight;             // force reflow so transition fires
      const scrollH = el.scrollHeight;
      el.style.height = scrollH + 'px';
      const onEnd = () => {
        // Only release to auto if still open (guard against rapid toggling).
        if (el.style.height !== '0px') {
          el.style.height = 'auto';
        }
        el.removeEventListener('transitionend', onEnd);
      };
      el.addEventListener('transitionend', onEnd);
    } else {
      // Collapse: pin to current pixel height first, then animate to 0.
      const current = el.getBoundingClientRect().height;
      el.style.height = current + 'px';
      void el.offsetHeight;             // force reflow
      el.style.height = '0px';
    }
  }, [open]);

  return (
    <div
      ref={ref}
      id={id}
      role="region"
      aria-labelledby={labelId}
      className="accordion-panel accordion-panel--animated"
    >
      <div className="accordion-panel-inner">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Single Accordion Item
───────────────────────────────────────── */
function AccordionItem({
  item,
  open,
  onToggle,
  iconType,
  iconPosition,
  HeadingTag,
  triggerId,
  panelId,
}) {
  const { title, answer, disabled } = item;
  const isOpen = open && !disabled;

  function handleClick() {
    if (disabled) return;
    onToggle();
  }

  function handleKeyDown(e) {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  }

  const icon =
    iconType === 'plus-minus' ? (
      <PlusMinusIcon open={isOpen} />
    ) : (
      <ChevronIcon open={isOpen} />
    );

  return (
    <div
      className={[
        'accordion-item',
        isOpen ? 'accordion-item--open' : '',
        disabled ? 'accordion-item--disabled' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <HeadingTag className="accordion-heading">
        <button
          id={triggerId}
          className={`accordion-trigger${iconPosition === 'start' ? ' accordion-trigger--icon-start' : ' accordion-trigger--icon-end'}`}
          type="button"
          aria-expanded={disabled ? undefined : isOpen}
          aria-controls={disabled ? undefined : panelId}
          aria-disabled={disabled ? 'true' : undefined}
          disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <span className="accordion-trigger-label">{title}</span>
          <span className="accordion-trigger-icon" aria-hidden="true">
            {icon}
          </span>
        </button>
      </HeadingTag>

      {!disabled && (
        <AnimatedPanel
          open={isOpen}
          id={panelId}
          labelId={triggerId}
        >
          <p className="accordion-answer">{answer}</p>
        </AnimatedPanel>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Accordion – public reusable component
   Single-open, collapsible behavior only.
───────────────────────────────────────── */
const HEADING_TAGS = { 2: 'h2', 3: 'h3', 4: 'h4' };

export default function Accordion({
  items = [],
  variant = 'default',
  iconType = 'chevron',
  iconPosition = 'end',
  headingLevel = 3,
}) {
  const uid = useId();

  // Single open ID — null means nothing is open.
  const [openId, setOpenId] = useState(null);

  // When the item list changes (search / count), close any item that
  // is no longer in the list so state stays consistent.
  const validIds = useMemo(() => new Set(items.map((i) => i.id)), [items]);

  const effectiveOpenId = validIds.has(openId) ? openId : null;

  const HeadingTag = HEADING_TAGS[headingLevel] ?? 'h3';

  function handleToggle(itemId) {
    setOpenId((prev) => {
      const currentOpen = validIds.has(prev) ? prev : null;
      // Clicking the already-open item closes it (collapsible).
      if (currentOpen === itemId) return null;
      // Otherwise open the clicked item (previous one closes implicitly).
      return itemId;
    });
  }

  const variantClass = `accordion--${variant}`;

  return (
    <div className={`accordion ${variantClass}`} role="list">
      {items.map((item) => {
        const triggerId = `${uid}-trigger-${item.id}`;
        const panelId = `${uid}-panel-${item.id}`;
        return (
          <div key={item.id} role="listitem">
            <AccordionItem
              item={item}
              open={effectiveOpenId === item.id}
              onToggle={() => handleToggle(item.id)}
              iconType={iconType}
              iconPosition={iconPosition}
              HeadingTag={HeadingTag}
              triggerId={triggerId}
              panelId={panelId}
            />
          </div>
        );
      })}
    </div>
  );
}
