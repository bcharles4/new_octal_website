import './TermsOfUse.css';

export default function TermsOfUse() {
  return (
    <section className="terms">
      <div className="terms__container">
        <header className="terms__hero">
          <p className="terms__eyebrow">Legal Information</p>
          <h1>Terms of Use</h1>
          <p className="terms__lead">
            We believe legal pages should be clear and readable. These Terms explain how to use our website
            responsibly and what you can expect when engaging with Octal Philippines Inc.
          </p>
        </header>

        <section className="terms__summary" aria-label="Terms summary">
          <h2>At a Glance</h2>
          <ul>
            <li>Use the site lawfully and responsibly.</li>
            <li>Content is protected by intellectual property laws.</li>
            <li>Job seekers are accountable for submitted resume details.</li>
            <li>By using the site, you agree to these Terms.</li>
          </ul>
        </section>

        <article className="terms__section">
          <h2>Ownership and Scope</h2>
          <p>
            This website is owned and operated by Octal Philippines Inc. with its registered office address
            at QY Building, 233 Tomas Morato Ext, Brgy. South Triangle, Quezon City Philippines.
          </p>
          <p>
            Throughout the site, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer to Octal Philippines Inc., while
            references &ldquo;You&rdquo; and &ldquo;Your&rdquo; refer to the persons accessing this website.
          </p>
          <p>
            These Terms of Use (&ldquo;Terms&rdquo;) govern your use of our website, services, and any other offerings
            we provide. Please read these Terms carefully.
          </p>
        </article>

        <article className="terms__section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our website, you acknowledge that you have read, understood, and agree,
            without restriction, to be bound by these Terms. If you do not agree with the Terms, you should
            not access, use, or download materials from our Website.
          </p>
        </article>

        <article className="terms__section">
          <h2>2. Use of the Site</h2>
          <p>
            Our website provides information about our company, our services, and our products. It is free of
            charge and for informational purposes only. It is also one of our platforms to post our job
            openings and for job seekers to submit their resumes/curriculum vitae. You will use this website
            only for lawful purposes and in accordance with these Terms.
          </p>
          <ul>
            <li>
              <strong>User Responsibility:</strong> Job seekers are responsible for the accuracy and legality
              of the resumes/curriculum vitae they submit.
            </li>
            <li>
              <strong>Communication:</strong> By submitting your resume/curriculum vitae, you agree to receive
              communications by email or phone calls.
            </li>
            <li>
              <strong>Data Protection:</strong> You consent to the collection, use, and sharing of your
              personal information as outlined in our Privacy Policy.
            </li>
          </ul>
        </article>

        <article className="terms__section">
          <h2>3. Eligibility</h2>
          <p>
            You must be at least 18 years old or have legal parental or guardian consent to use our website.
            You represent and warrant that you meet these eligibility requirements.
          </p>
        </article>

        <article className="terms__section">
          <h2>4. Intellectual Property</h2>
          <p>
            All content on this website, including, but not limited to, the text, graphics, pictures, logos,
            articles, source codes, and software, are owned by or licensed to Octal Philippines Inc. and is
            protected by copyright and other intellectual property laws. All trademarks used or referred to in
            this website are the property of their respective owners.
          </p>
          <p>
            You agree not to copy, reproduce, republish, upload, post, transmit, distribute, or create
            derivative works in any way, without prior written consent, except that you may copy or print
            information to a computer or mobile device solely for your personal, non-commercial use only,
            provided that you do not modify the content in any way and you keep intact all copyright,
            trademark, and other proprietary notices.
          </p>
        </article>

        <article className="terms__section">
          <h2>5. Prohibited Activities</h2>
          <p>When using our website, you agree not to:</p>
          <ul>
            <li>Engage in unlawful, abusive, or harmful activities.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation.</li>
            <li>Alter or modify any part of the Site or the Content.</li>
            <li>Introduce viruses, malware, or other harmful software.</li>
            <li>Use any data mining, robots, or similar data gathering or extraction methods.</li>
            <li>
              Disrupt or interfere with the security, integrity, or performance of the website or servers.
            </li>
          </ul>
        </article>

        <article className="terms__section">
          <h2>6. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites or platforms. We neither monitor nor
            control inputs in such sites. We are not responsible for the content, privacy policies, or
            practices of any third-party websites.
          </p>
        </article>

        <article className="terms__section">
          <h2>7. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless to us, our affiliates, our respective officers,
            and employees from any claims, liabilities, damages, losses, or expenses arising out of your
            violation of these Terms or any misuse of the services.
          </p>
        </article>

        <article className="terms__section">
          <h2>8. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Any changes will be effective immediately upon posting on
            our site. Your continued use of the site after any changes constitutes your acceptance of the new
            terms.
          </p>
        </article>

        <article className="terms__section">
          <h2>9. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the Republic of the
            Philippines. Any disputes arising from these Terms shall be resolved in the courts of Jurisdiction.
          </p>
        </article>

        <article className="terms__section">
          <h2>10. Contact Information</h2>
          <p>
            If you have questions about our Terms, you may send us a message through the Contact Us form or
            email us at <a href="mailto:info@octaltech.net">info@octaltech.net</a>. Please provide accurate
            contact information to ensure we can respond effectively.
          </p>
        </article>

        <p className="terms__updated">Terms of Use updated as of October 1, 2024.</p>
      </div>
    </section>
  );
}
