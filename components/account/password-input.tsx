'use client';
import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from './password-input.module.css';

export function PasswordInput({ id, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  return <div className={styles.field}>
    <input {...props} id={id} type={visible ? 'text' : 'password'} />
    <button type="button" className={styles.toggle} onClick={() => setVisible(value => !value)} disabled={props.disabled} aria-label={visible ? 'Hide password' : 'Show password'} aria-controls={id} aria-pressed={visible}>
      {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
    </button>
  </div>;
}
