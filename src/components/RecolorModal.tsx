import { useEffect, useRef } from 'react';
import type { StyleItemKey } from '../lib/styles';

interface RecolorModalProps {
  open: boolean;
  selectedItem: StyleItemKey;
  color: string;
  onClose: () => void;
  onItemChange: (item: StyleItemKey) => void;
  onColorChange: (color: string) => void;
  onApply: () => void;
}

export function RecolorModal({
  open,
  selectedItem,
  color,
  onClose,
  onItemChange,
  onColorChange,
  onApply,
}: RecolorModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recolor-modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="close-icon" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <h2 id="recolor-modal-title">Pick an Item to Change The Color</h2>
        <fieldset className="recolor-options">
          <legend className="sr-only">Garment to recolor</legend>
          <label>
            <input
              type="radio"
              name="garment"
              value="top"
              checked={selectedItem === 'top'}
              onChange={() => onItemChange('top')}
            />
            Top
          </label>
          <label>
            <input
              type="radio"
              name="garment"
              value="bottom"
              checked={selectedItem === 'bottom'}
              onChange={() => onItemChange('bottom')}
            />
            Bottom
          </label>
        </fieldset>
        <label className="color-picker-label" htmlFor="recolor-color">
          Color
          <input
            id="recolor-color"
            type="color"
            value={color || '#000000'}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>
        {color && (
          <button type="button" className="apply-recolor-btn" onClick={onApply}>
            Change Item Color
          </button>
        )}
      </div>
    </div>
  );
}
