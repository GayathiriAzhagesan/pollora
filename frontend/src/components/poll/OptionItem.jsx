import React from 'react';
import { CheckIcon } from '../../assets/icons';

export const OptionItem = ({
  id,
  text,
  selected = false,
  onSelect,
  disabled = false,
  index = 0,
}) => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const letter = letters[index % letters.length];

  return (
    <div
      onClick={() => !disabled && onSelect(id)}
      className={`voting-option-card ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      role="radio"
      aria-checked={selected}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
          e.preventDefault();
          onSelect(id);
        }
      }}
    >
      <div className="option-indicator-wrap">
        <span className="option-letter">{letter}</span>
      </div>
      <span className="option-text">{text}</span>
      <div className={`option-check-circle ${selected ? 'checked' : ''}`}>
        {selected && <CheckIcon size={14} className="check-icon" />}
      </div>
    </div>
  );
};
