import React from 'react';
import styles from '../styles/components/Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>MediLog</div>
    </header>
  );
};

export default Header;
