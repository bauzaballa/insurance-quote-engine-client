import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';

import styles from './Select.module.scss';

// Normalizador de opciones (string/number/boolean u objetos)
const normalizeOptions = options =>
  (options || [])
    .map(opt => {
      if (opt == null) return null;
      const t = typeof opt;
      if (t === 'string' || t === 'number' || t === 'boolean') {
        const s = String(opt);
        return { value: s, label: s };
      }
      if (t === 'object') {
        const rawValue = opt.value ?? opt.id ?? opt.label ?? opt.name;
        const rawLabel = opt.label ?? opt.name ?? opt.value ?? opt.id;
        return { value: String(rawValue ?? ''), label: String(rawLabel ?? '') };
      }
      return null;
    })
    .filter(Boolean);

const SearchSelect = forwardRef(function SearchSelect(
  {
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Seleccioná…',
    defaultOption, // { label: 'Año' } -> value: ""
    disabled = false,
    loading = false,
    loadingLabel = 'Cargando…',
    searchable = true,
    searchPlaceholder = 'Buscar…',
    noOptionsText = 'Sin resultados',
    className = '',
    name,
    id,
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);

  const rootRef = useRef(null);
  const listRef = useRef(null);
  const inputSearchRef = useRef(null);

  // Exponer API imperativa
  useImperativeHandle(
    ref,
    () => ({
      open: () => setOpen(true),
      close: () => setOpen(false),
      isOpen: () => open,
      focus: () => inputSearchRef.current?.focus(),
    }),
    [open]
  );

  const opts = useMemo(() => normalizeOptions(options), [options]);

  const defOpt = useMemo(() => {
    if (!defaultOption) return null;
    const lbl = String(defaultOption.label ?? placeholder ?? 'Seleccioná…');
    return { value: '', label: lbl };
  }, [defaultOption, placeholder]);

  const selected = useMemo(() => opts.find(o => o.value === value) || null, [opts, value]);

  const filteredCore = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return opts;
    return opts.filter(o => o.label.toLowerCase().includes(q));
  }, [opts, query]);

  const filtered = useMemo(() => {
    return defOpt ? [defOpt, ...filteredCore] : filteredCore;
  }, [defOpt, filteredCore]);

  // Cerrar al clickear afuera
  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }

    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Foco en buscador al abrir
  // useEffect(() => {
  //     if (open && searchable && inputSearchRef.current) inputSearchRef.current.focus();
  //     if (open) setHighlight(0);
  // }, [open, searchable]);
  useEffect(() => {
    if (open && searchable && inputSearchRef.current) inputSearchRef.current.focus();
    if (open) {
      // Si existe defaultOption, comenzamos en el índice 1 (primera opción válida)
      setHighlight(defOpt ? 1 : 0);
    }
  }, [open, searchable, defOpt]);

  // Reset query al cerrar
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  function handleToggle() {
    if (disabled) return;
    setOpen(p => !p);
  }

  // function handleSelect(opt) {
  //     if (disabled) return;
  //     onChange?.(opt.value);
  //     setOpen(false);
  // }

  function handleSelect(opt) {
    if (disabled) return;
    // Evitar que se seleccione la opción por defecto (value === "")
    if (!opt || opt.value === '') return;
    onChange?.(opt.value);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (disabled) return;
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
      scrollIntoView(highlight + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
      scrollIntoView(highlight - 1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[highlight];
      // Si es la opción por defecto, no hace nada
      if (!opt || opt.value === '') return;
      handleSelect(opt);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  }

  function scrollIntoView(idx) {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector(`[data-idx="${idx}"]`);
    if (!el) return;
    const top = el.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop) list.scrollTop = top;
    else if (bottom > list.scrollTop + list.clientHeight)
      list.scrollTop = bottom - list.clientHeight;
  }

  const hasValue = Boolean(selected);
  const isLoading = Boolean(loading);
  const displayLabel = isLoading ? loadingLabel : hasValue ? selected.label : placeholder;

  return (
    <div className={`${styles.selectRoot} ${className}`} ref={rootRef}>
      {label ? <span className={styles.label}>{label}</span> : null}

      <button
        type='button'
        id={id}
        name={name}
        className={styles.control}
        onClick={handleToggle}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-haspopup='listbox'
        aria-expanded={open}
        aria-busy={isLoading}
        data-has-value={hasValue}
        title={displayLabel}
      >
        <span className={styles.value}>{displayLabel}</span>
        <svg className={styles.caret} width='12' height='8' viewBox='0 0 12 8' aria-hidden='true'>
          <path d='M1.41.31 6 4.89 10.59.31 12 1.72 6 7.72 0 1.72 1.41.31Z' fill='currentColor' />
        </svg>
      </button>

      {open && (
        <div className={styles.dropdown} role='dialog' aria-label={label || 'selector'}>
          {searchable && (
            <div className={styles.searchWrap}>
              <svg width='16' height='16' viewBox='0 0 24 24' aria-hidden='true'>
                <path
                  d='M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 20.49 21.49 19 15.5 14zM4 9.5C4 6.46 6.46 4 9.5 4S15 6.46 15 9.5 12.54 15 9.5 15 4 12.54 4 9.5z'
                  fill='currentColor'
                />
              </svg>
              <input
                ref={inputSearchRef}
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
              />
            </div>
          )}

          <div className={styles.list} role='listbox' ref={listRef}>
            {isLoading ? (
              <div className={styles.listMsg}>Cargando…</div>
            ) : filtered.length === 0 ? (
              <div className={styles.listMsg}>{noOptionsText}</div>
            ) : (
              filtered.map((opt, idx) => {
                const selectedItem = selected?.value === opt.value;
                const highlighted = idx === highlight;
                const isDefault = opt.value === '';
                return (
                  <button
                    type='button'
                    key={`${opt.value}__${idx}`}
                    role='option'
                    aria-selected={selectedItem}
                    aria-disabled={isDefault}
                    className={[
                      styles.option,
                      selectedItem ? styles.optionSelected : '',
                      highlighted ? styles.optionHighlighted : '',
                      // opt.value === "" ? styles.optionDefault : "",
                      isDefault ? styles.optionDefault : '',
                    ].join(' ')}
                    onMouseEnter={() => setHighlight(idx)}
                    // onClick={() => handleSelect(opt)}
                    onClick={() => {
                      if (!isDefault) handleSelect(opt);
                    }}
                    disabled={isDefault}
                    data-idx={idx}
                    title={opt.label}
                  >
                    <span className={styles.optionLabel}>{opt.label}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default SearchSelect;
