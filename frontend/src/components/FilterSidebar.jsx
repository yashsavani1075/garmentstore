import React, { useState } from 'react';
import './FilterSidebar.css';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹1,500', min: 1000, max: 1500 },
  { label: '₹1,500 – ₹2,000', min: 1500, max: 2000 },
  { label: '₹2,000 – ₹2,500', min: 2000, max: 2500 },
  { label: 'Above ₹2,500', min: 2500, max: Infinity },
];

export default function FilterSidebar({ garments, filters, onFilterChange, onClearAll, className = '' }) {
  const [open, setOpen] = useState({ price: true, subcategory: true, fabric: true, color: true, size: true });
  const toggle = (k) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const uniqueSubcats = [...new Set(garments.map((g) => g.subCategory).filter(Boolean))];
  const uniqueFabrics = [...new Set(garments.map((g) => g.fabric).filter(Boolean))];
  const uniqueSizes = [...new Set(garments.flatMap((g) => g.sizes || []).filter(Boolean))];
  const uniqueColors = [
    ...new Set(
      garments.flatMap((g) => [
        ...(g.color ? [g.color] : []),
        ...(g.colorVariants?.map(v => v.colorCode) || [])
      ])
    ),
  ];

  const toggleMulti = (field, value) => {
    const current = filters[field] || [];
    onFilterChange({
      ...filters,
      [field]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
    });
  };

  const setPriceRange = (range) => {
    const same = filters.priceMin === range.min && filters.priceMax === range.max;
    onFilterChange({ ...filters, priceMin: same ? null : range.min, priceMax: same ? null : range.max });
  };

  const activeCount = [
    filters.priceMin !== null && filters.priceMin !== undefined ? 1 : 0,
    (filters.subcategories || []).length,
    (filters.fabrics || []).length,
    (filters.colors || []).length,
    (filters.sizes || []).length,
  ].reduce((a, b) => a + b, 0);

  return (
    <aside className={`filter-sidebar ${className}`.trim()}>
      {/* Header */}
      <div className="filter-sidebar-header">
        <h3 className="filter-title">
          {/* <span className="filter-icon">⚙</span>  */}
          Filters
          {activeCount > 0 && <span className="active-filter-count">{activeCount}</span>}
        </h3>
        {activeCount > 0 && (
          <button className="clear-all-btn" onClick={onClearAll}>Clear all</button>
        )}
      </div>

      {/* Price */}
      <FilterSection label="Price" open={open.price} onToggle={() => toggle('price')}>
        <ul className="filter-list">
          {PRICE_RANGES.map((r) => (
            <li key={r.label}>
              <button
                className={`filter-chip${filters.priceMin === r.min && filters.priceMax === r.max ? ' active' : ''}`}
                onClick={() => setPriceRange(r)}
              >{r.label}</button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Subcategory */}
      {uniqueSubcats.length > 0 && (
        <FilterSection label="Subcategory" open={open.subcategory} onToggle={() => toggle('subcategory')}>
          <ul className="filter-list">
            {uniqueSubcats.map((s) => (
              <li key={s}>
                <button
                  className={`filter-chip${(filters.subcategories || []).includes(s) ? ' active' : ''}`}
                  onClick={() => toggleMulti('subcategories', s)}
                >{s}</button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Fabric */}
      {uniqueFabrics.length > 0 && (
        <FilterSection label="Fabric" open={open.fabric} onToggle={() => toggle('fabric')}>
          <ul className="filter-list">
            {uniqueFabrics.map((f) => (
              <li key={f}>
                <button
                  className={`filter-chip${(filters.fabrics || []).includes(f) ? ' active' : ''}`}
                  onClick={() => toggleMulti('fabrics', f)}
                >{f}</button>
              </li>
            ))}
          </ul>
        </FilterSection>
      )}

      {/* Color */}
      {uniqueColors.length > 0 && (
        <FilterSection label="Color" open={open.color} onToggle={() => toggle('color')}>
          <div className="color-swatches">
            {uniqueColors.map((c) => (
              <button
                key={c}
                className={`color-filter-swatch${(filters.colors || []).includes(c) ? ' active' : ''}`}
                style={{ backgroundColor: c }}
                title={c}
                onClick={() => toggleMulti('colors', c)}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Size */}
      {uniqueSizes.length > 0 && (
        <FilterSection label="Size" open={open.size} onToggle={() => toggle('size')}>
          <div className="size-chips">
            {uniqueSizes.map((sz) => (
              <button
                key={sz}
                className={`size-filter-chip${(filters.sizes || []).includes(sz) ? ' active' : ''}`}
                onClick={() => toggleMulti('sizes', sz)}
              >{sz}</button>
            ))}
          </div>
        </FilterSection>
      )}
    </aside>
  );
}

function FilterSection({ label, open, onToggle, children }) {
  return (
    <div className="filter-section">
      <button className="filter-section-header" onClick={onToggle}>
        <span>{label}</span>
        <span className={`chevron${open ? ' open' : ''}`}>›</span>
      </button>
      {open && <div className="filter-section-body">{children}</div>}
    </div>
  );
}
