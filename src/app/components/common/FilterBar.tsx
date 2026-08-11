import './FilterBar.css';
import { useT } from '../../i18n';
import type { FilterValue } from '../../utils/filterProjets';

const STRINGS = {
  fr: { all: 'Tous', mobile: 'Mobile', web: 'Web', branding: 'Branding' },
  en: { all: 'All', mobile: 'Mobile', web: 'Web', branding: 'Branding' },
};

const ORDER: FilterValue[] = ['all', 'mobile', 'web', 'branding'];

export default function FilterBar({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const t = useT(STRINGS);
  return (
    <div className="filter-bar" role="tablist" aria-label="Filtrer par discipline">
      {ORDER.map((v) => (
        <button
          key={v}
          type="button"
          role="tab"
          aria-selected={value === v}
          className={`filter-chip${value === v ? ' on' : ''}`}
          onClick={() => onChange(v)}
        >
          {t[v]}
        </button>
      ))}
    </div>
  );
}
