/**
 * Based on Geist UI. https://react.geist-ui.dev/en-us/components/loading
 */
import React from 'react';
import styles from './style.module.less';

export interface PendingProps {
  className?: string;
}

export const Pending: React.FC<PendingProps> = ({ className = '' }) => {
  return (
    <div
      className={`flex justify-center items-center select-none relative min-h-[1em] ${className}`}
    >
      <i className={styles.dot} />
      <i className={styles.dot} />
      <i className={styles.dot} />
    </div>
  );
};
