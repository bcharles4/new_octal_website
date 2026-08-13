import '../TermsOfUse/TermsOfUse.css';

export default function PrivacyPolicy() {
  return (
    <section className="terms">
      <div className="terms__container">
        <header className="terms__hero">
          <p className="terms__eyebrow">Legal Information</p>
          <h1>Privacy Policy</h1>
          <p className="terms__lead">
            Octal Philippines Inc. respects your privacy. This policy explains what information we collect,
            how we use it, and the choices you have when you visit our website or contact us.
          </p>
        </header>

        <section className="terms__summary" aria-label="Privacy summary">
          <h2>At a Glance</h2>
          <ul>
            <li>We collect only the information needed to respond to inquiries and operate the site.</li>
            <li>We do not sell personal information.</li>
            <li>You may request access, correction, or deletion of your data where applicable.</li>
            <li>We use standard safeguards to protect the information you submit.</li>
          </ul>
        </section>

        <article className="terms__section">
          <h2>1. Information We Collect</h2>
          <p>
            We may collect information you voluntarily provide through forms, such as your name, email
            address, phone number, company, and message content. If you apply for a role, we may also
            collect resume details, work history, and related application information.
          </p>
          <p>
            We may also collect limited technical data such as browser type, device information, pages
            visited, and general usage patterns to help us maintain and improve the website.
          </p>
        </article>

        <article className="terms__section">
          <h2>2. How We Use Information</h2>
          <ul>
            <li>Respond to inquiries and provide requested services.</li>
            <li>Process job applications and recruitment-related communication.</li>
            <li>Improve our website, content, and user experience.</li>
            <li>Meet legal, regulatory, and operational requirements.</li>
          </ul>
        </article>

        <article className="terms__section">
          <h2>3. Sharing and Disclosure</h2>
          <p>
            We may share information with trusted service providers who help us operate our website or
            business processes. These providers are expected to protect the information and use it only for
            the purposes we authorize.
          </p>
          <p>
            We may also disclose information when required by law, to protect our rights, or to respond to
            a lawful request from public authorities.
          </p>
        </article>

        <article className="terms__section">
          <h2>4. Data Retention</h2>
          <p>
            We keep personal information only as long as necessary for the purposes described in this policy,
            unless a longer retention period is required or permitted by law.
          </p>
        </article>

        <article className="terms__section">
          <h2>5. Cookies and Analytics</h2>
          <p>
            Our website may use cookies or similar technologies to support essential functionality and to
            understand how visitors use the site. You can control cookies through your browser settings.
          </p>
        </article>

        <article className="terms__section">
          <h2>6. Your Rights</h2>
          <p>
            Depending on your location and applicable law, you may have the right to access, correct, update,
            or request deletion of your personal information. You may also object to or restrict certain
            processing activities.
          </p>
        </article>

        <article className="terms__section">
          <h2>7. Security</h2>
          <p>
            We use reasonable administrative, technical, and organizational safeguards designed to protect
            personal information from unauthorized access, use, or disclosure. No method of transmission or
            storage is completely secure, so we cannot guarantee absolute security.
          </p>
        </article>

        <article className="terms__section">
          <h2>8. Third-Party Links</h2>
          <p>
            Our website may contain links to external websites. We are not responsible for the privacy
            practices or content of those third-party sites.
          </p>
        </article>

        <article className="terms__section">
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with
            an updated effective date.
          </p>
        </article>

        <article className="terms__section">
          <h2>10. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or how we handle personal information, please use
            the Contact Us form or email us at <a href="mailto:info@octaltech.net">info@octaltech.net</a>.
          </p>
        </article>

        <p className="terms__updated">Privacy Policy updated as of August 11, 2026.</p>
      </div>
    </section>
  );
}
