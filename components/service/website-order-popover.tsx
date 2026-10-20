'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import {
  cloudyWebsiteProducts,
  type CloudyWebsitePackageKey,
} from '@/lib/cloudy-service-products';
import styles from '@/app/service/service.module.css';

type Props = {
  packageKey: CloudyWebsitePackageKey;
  pages: number;
  price: number;
};

export function WebsiteOrderPopover({ packageKey, pages, price }: Props) {
  const cart = useCart();
  const router = useRouter();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('');

  const id = `cloudy-studio-order-${packageKey.toLowerCase()}`;
  const title = `Cloudy Studio ${packageKey.toLowerCase()}`;

  const close = () => {
    popoverRef.current?.hidePopover();
  };

  const addToBasket = () => {
    const product = cloudyWebsiteProducts[packageKey];

    cart.addItem(product, 1, {
      customer_name: fullName,
      customer_email: email,
      project_description: project,
    });

    try {
      const current = JSON.parse(localStorage.getItem('checkout_form_data') || '{}');
      localStorage.setItem('checkout_form_data', JSON.stringify({ ...current, email }));
    } catch {
      localStorage.setItem('checkout_form_data', JSON.stringify({ email }));
    }

    close();
    router.push('/cart');
  };

  return (
    <>
      <button
        type="button"
        className={styles.buyButton}
        popoverTarget={id}
        popoverTargetAction="show"
      >
        Buy
      </button>

      <div
        ref={popoverRef}
        id={id}
        popover="manual"
        data-cloudy-order
        className={styles.orderPopover}
      >
        <button className={styles.close} type="button" onClick={close} aria-label="Close">×</button>

        <h2>{title}</h2>
        <p>
          {step === 'form'
            ? `${pages} pages · €${price.toLocaleString('en-GB')}. Enter your details below.`
            : 'Check your details before continuing.'}
        </p>

        {step === 'form' ? (
          <form
            onSubmit={event => {
              event.preventDefault();
              setStep('review');
            }}
          >
            <label htmlFor={`${id}-name`}>Full name</label>
            <input
              id={`${id}-name`}
              value={fullName}
              onChange={event => setFullName(event.target.value)}
              required
              autoComplete="name"
              placeholder="Your full name"
            />

            <label htmlFor={`${id}-email`}>Email address</label>
            <input
              id={`${id}-email`}
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />

            <label htmlFor={`${id}-project`}>Your website</label>
            <textarea
              id={`${id}-project`}
              value={project}
              onChange={event => setProject(event.target.value)}
              required
              placeholder="Tell us what the website is for and what you want on it."
            />

            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={close}>Cancel</button>
              <button type="submit" className={styles.primaryButton}>Review</button>
            </div>
          </form>
        ) : (
          <div>
            <div className={styles.reviewText}>
              <p><strong>Package:</strong> {title}</p>
              <p><strong>Pages:</strong> {pages}</p>
              <p><strong>Price:</strong> €{price.toLocaleString('en-GB')}</p>
              <p><strong>Name:</strong> {fullName}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Website:</strong> {project}</p>
            </div>

            <div className={styles.previewNotice}>
              Preview mode: the final payment action stays disabled until this preview is approved.
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setStep('form')}>
                Back
              </button>
              <button type="button" className={styles.primaryButton} onClick={addToBasket}>
                Continue to basket
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
