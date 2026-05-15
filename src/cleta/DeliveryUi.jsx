export function HeroBanner({ imageUrl, bottomCaption, compact }) {
  return (
    <div className={`delivery-hero ${compact ? 'delivery-hero--sm' : ''}`}>
      <img src={imageUrl} alt="" className="delivery-hero__img" />
      {bottomCaption ? <div className="delivery-hero__caption">{bottomCaption}</div> : null}
    </div>
  );
}

export function ImagePrimaryRow({ imageUrl, title, subtitle, onClick, enabled = true, loading = false }) {
  return (
    <button
      type="button"
      className="delivery-row delivery-row--primary"
      onClick={onClick}
      disabled={!enabled || loading}
    >
      <img src={imageUrl} alt="" className="delivery-row__thumb" />
      <div className="delivery-row__text">
        <div className="delivery-row__title">{loading ? 'Cargando…' : title}</div>
        {subtitle ? <div className="delivery-row__sub">{subtitle}</div> : null}
      </div>
    </button>
  );
}

export function ImageOutlinedRow({ imageUrl, title, subtitle, onClick, enabled = true }) {
  return (
    <button
      type="button"
      className="delivery-row delivery-row--outline"
      onClick={onClick}
      disabled={!enabled}
    >
      <img src={imageUrl} alt="" className="delivery-row__thumb" />
      <div className="delivery-row__text">
        <div className="delivery-row__title">{title}</div>
        {subtitle ? <div className="delivery-row__sub">{subtitle}</div> : null}
      </div>
    </button>
  );
}

export function ModulePhotoTile({ imageUrl, title, subtitle, onClick }) {
  return (
    <button type="button" className="delivery-tile" onClick={onClick}>
      <div className="delivery-tile__img-wrap">
        <img src={imageUrl} alt="" className="delivery-tile__img" />
      </div>
      <div className="delivery-tile__body">
        <div className="delivery-tile__title">{title}</div>
        <div className="delivery-tile__sub">{subtitle}</div>
      </div>
    </button>
  );
}

export function DrawerThumb({ imageUrl, size = 40 }) {
  return (
    <img
      src={imageUrl}
      alt=""
      width={size}
      height={size}
      className="delivery-drawer-thumb rounded"
      style={{ objectFit: 'cover' }}
    />
  );
}

export function CompactChip({ imageUrl, label, onClick, outlined }) {
  return (
    <button
      type="button"
      className={`delivery-chip ${outlined ? 'delivery-chip--outline' : ''}`}
      onClick={onClick}
    >
      <img src={imageUrl} alt="" className="delivery-chip__img" />
      <span>{label}</span>
    </button>
  );
}

export function ToolbarIconButton({ imageUrl, onClick, label }) {
  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm delivery-toolbar-btn d-inline-flex align-items-center gap-2 py-1 px-2"
      onClick={onClick}
      aria-label={label}
    >
      <img src={imageUrl} alt="" width={28} height={28} className="rounded" style={{ objectFit: 'cover' }} />
      {label ? <span className="small fw-medium">{label}</span> : null}
    </button>
  );
}
