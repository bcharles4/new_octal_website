import { Link } from 'react-router-dom';
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
            responsibly, what you can expect when engaging with Octal Philippines Inc., and the limits of our
            responsibility.
          </p>
        </header>

        <section className="terms__summary" aria-label="Terms summary">
          <h2>At a Glance</h2>
          <ul>
            <li>Use the site lawfully and responsibly.</li>
            <li>Content is protected by intellectual property laws.</li>
            <li>Job seekers are accountable for the accuracy of what they submit.</li>
            <li>Applying does not create an employment relationship or a promise to hire.</li>
            <li>We never charge fees to apply for a job. Treat any such request as fraudulent.</li>
            <li>By using the site, you agree to these Terms.</li>
          </ul>
        </section>

        <article className="terms__section">
          <h2>Ownership and Scope</h2>
          <p>
            This website is owned and operated by Octal Philippines Inc. with its registered office address
            at QY Building, 233 Tomas Morato Ext., Brgy. South Triangle, Quezon City, Philippines.
          </p>
          <p>
            Throughout the site, the terms &ldquo;we&rdquo;, &ldquo;us&rdquo;, and &ldquo;our&rdquo; refer to Octal Philippines Inc., while
            references to &ldquo;you&rdquo; and &ldquo;your&rdquo; refer to the persons accessing this website.
          </p>
          <p>
            These Terms of Use (&ldquo;Terms&rdquo;) govern your use of our website, services, and any other offerings
            we provide. Please read these Terms carefully. They should be read together with our{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>, which explains how we handle personal data.
          </p>
        </article>

        <article className="terms__section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our website, you acknowledge that you have read, understood, and agree,
            without restriction, to be bound by these Terms. If you do not agree with the Terms, you should
            not access, use, or download materials from our website.
          </p>
        </article>

        <article className="terms__section">
          <h2>2. Use of the Site</h2>
          <p>
            Our website provides information about our company, our services, and our products. It is free of
            charge and for informational purposes only. It is also one of our platforms to post our job
            openings and for job seekers to submit their resumes or curricula vitae. You will use this website
            only for lawful purposes and in accordance with these Terms.
          </p>
          <ul>
            <li>
              <strong>User Responsibility:</strong> Job seekers are responsible for the accuracy, completeness,
              and legality of the resumes or curricula vitae and other information they submit.
            </li>
            <li>
              <strong>Communication:</strong> By submitting your resume or curriculum vitae, you agree to
              receive communications from us by email or phone in connection with your application.
            </li>
            <li>
              <strong>Data Protection:</strong> You consent to the collection, use, and sharing of your
              personal information as described in our <Link to="/privacy-policy">Privacy Policy</Link>.
            </li>
            <li>
              <strong>Third-Party Rights:</strong> Do not submit information about another person, or content
              that infringes anyone&rsquo;s intellectual property or confidentiality rights, without their
              authority to do so.
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
          <h2>4. Careers, Applications, and Recruitment</h2>
          <p>
            Job postings on this website are invitations to apply. They are not offers of employment and may
            be amended, suspended, or withdrawn at any time without notice.
          </p>
          <ul>
            <li>
              <strong>No employment relationship:</strong> Submitting an application does not create an
              employment relationship, a contract, or any obligation on our part to interview, consider, or
              hire you.
            </li>
            <li>
              <strong>No guarantee of response:</strong> While we review every application we receive, we
              cannot guarantee a response to each one.
            </li>
            <li>
              <strong>Verification:</strong> We may verify the information you provide, including your
              employment and educational background, in accordance with applicable law.
            </li>
            <li>
              <strong>Misrepresentation:</strong> Materially false or misleading information may result in
              your application being rejected, or in the termination of employment if discovered later.
            </li>
          </ul>
          <p>
            <strong>Recruitment fraud warning.</strong> Octal Philippines Inc. does not charge any fee at any
            stage of its recruitment process, whether for applications, processing, training, placement,
            equipment, or onboarding. We never ask applicants to send money, purchase equipment, or share
            bank account credentials, one-time passwords, or similar financial details. Legitimate
            communications come from our official channels and from addresses on our own domain. If you
            receive a suspicious offer or fee request claiming to come from us, do not act on it and report it
            to <a href="mailto:info@octaltech.net">info@octaltech.net</a>.
          </p>
        </article>

        <article className="terms__section">
          <h2>5. Intellectual Property</h2>
          <p>
            All content on this website, including but not limited to the text, graphics, pictures, logos,
            articles, source code, and software, is owned by or licensed to Octal Philippines Inc. and is
            protected by copyright and other intellectual property laws. All trademarks used or referred to in
            this website are the property of their respective owners.
          </p>
          <p>
            You agree not to copy, reproduce, republish, upload, post, transmit, distribute, or create
            derivative works in any way, without prior written consent, except that you may copy or print
            information to a computer or mobile device solely for your personal, non-commercial use, provided
            that you do not modify the content in any way and you keep intact all copyright, trademark, and
            other proprietary notices.
          </p>
        </article>

        <article className="terms__section">
          <h2>6. Feedback and Submissions</h2>
          <p>
            If you send us suggestions, ideas, or feedback about our website or services, you grant us a
            non-exclusive, royalty-free, perpetual, and worldwide right to use and incorporate them without
            obligation, attribution, or compensation to you. This section does not apply to your personal
            data or to the contents of your job application, which are governed by our{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
        </article>

        <article className="terms__section">
          <h2>7. Prohibited Activities</h2>
          <p>When using our website, you agree not to:</p>
          <ul>
            <li>Engage in unlawful, abusive, or harmful activities.</li>
            <li>Impersonate any person or entity or misrepresent your affiliation.</li>
            <li>Alter or modify any part of the site or the content.</li>
            <li>Introduce viruses, malware, or other harmful software.</li>
            <li>Use any data mining, robots, scraping, or similar data gathering or extraction methods.</li>
            <li>
              Attempt to gain unauthorized access to any part of the site, any account, or any server or
              system connected to it, or bypass any security or authentication measure.
            </li>
            <li>
              Disrupt or interfere with the security, integrity, or performance of the website or servers.
            </li>
            <li>
              Use the site or any posting to advertise, solicit, or send unsolicited commercial messages.
            </li>
          </ul>
        </article>

        <article className="terms__section">
          <h2>8. Restricted Areas and Staff Accounts</h2>
          <p>
            Parts of this website are restricted to authorized Octal personnel and require credentials. If you
            have been issued an account, you are responsible for keeping your credentials confidential and for
            all activity carried out under your account, and you must notify us promptly of any suspected
            unauthorized use. Accessing or attempting to access a restricted area without authorization is
            prohibited and may be unlawful under the Cybercrime Prevention Act of 2012 (Republic Act No.
            10175) and other applicable laws.
          </p>
        </article>

        <article className="terms__section">
          <h2>9. Availability and Changes to the Site</h2>
          <p>
            We may modify, suspend, or discontinue the website or any part of it, including any job posting or
            feature, at any time and without notice. We do not warrant that the site will be available
            uninterrupted or error-free, and we may carry out maintenance that temporarily limits access.
          </p>
        </article>

        <article className="terms__section">
          <h2>10. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites or platforms. We neither monitor nor
            control those sites. We are not responsible for the content, privacy policies, or practices of any
            third-party website, and a link does not imply our endorsement.
          </p>
        </article>

        <article className="terms__section">
          <h2>11. Disclaimer of Warranties</h2>
          <p>
            The website and its content are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis, without
            warranties of any kind, whether express or implied, including any implied warranties of
            merchantability, fitness for a particular purpose, title, and non-infringement, to the fullest
            extent permitted by applicable law.
          </p>
          <p>
            While we take care to keep the information on this site accurate and current, we do not warrant
            that it is complete, accurate, reliable, or up to date, and it should not be relied upon as
            professional, technical, or legal advice. We do not warrant that the site will be free of viruses
            or other harmful components.
          </p>
        </article>

        <article className="terms__section">
          <h2>12. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, Octal Philippines Inc., its affiliates, and
            their respective directors, officers, employees, and agents shall not be liable for any indirect,
            incidental, special, consequential, punitive, or exemplary damages, or for any loss of profits,
            revenue, data, goodwill, or business opportunity, arising out of or in connection with your use of
            or inability to use the website, whether based on contract, tort, negligence, statute, or any
            other legal theory, even if we have been advised of the possibility of such damages.
          </p>
          <p>
            Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited,
            including liability for fraud, willful misconduct, or gross negligence.
          </p>
        </article>

        <article className="terms__section">
          <h2>13. Indemnification</h2>
          <p>
            You agree to indemnify, defend, and hold harmless Octal Philippines Inc., our affiliates, and our
            respective officers, directors, employees, and agents from any claims, liabilities, damages,
            losses, or expenses, including reasonable attorney&rsquo;s fees, arising out of your violation of
            these Terms, your misuse of the website or services, or your infringement of the rights of any
            third party.
          </p>
        </article>

        <article className="terms__section">
          <h2>14. Suspension and Termination</h2>
          <p>
            We may restrict, suspend, or terminate your access to the website, in whole or in part, at any
            time and without notice, if we reasonably believe you have breached these Terms or applicable law,
            or to protect the security and integrity of our systems and other users. The sections that by
            their nature should survive termination, including intellectual property, disclaimers, limitation
            of liability, indemnification, and governing law, will continue to apply.
          </p>
        </article>

        <article className="terms__section">
          <h2>15. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Any changes will be effective immediately upon posting on
            our site, and the effective date below will be revised. Your continued use of the site after any
            changes constitutes your acceptance of the updated Terms. Please review this page periodically.
          </p>
        </article>

        <article className="terms__section">
          <h2>16. Governing Law and Venue</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the Republic of the
            Philippines, without regard to its conflict of law principles. Any dispute arising out of or
            relating to these Terms or your use of the website shall be submitted to the exclusive
            jurisdiction of the proper courts of Quezon City, Philippines, to the exclusion of all other
            venues.
          </p>
        </article>

        <article className="terms__section">
          <h2>17. General Provisions</h2>
          <ul>
            <li>
              <strong>Severability:</strong> If any provision of these Terms is held invalid or unenforceable,
              that provision will be limited or removed to the minimum extent necessary, and the remaining
              provisions will remain in full force and effect.
            </li>
            <li>
              <strong>No waiver:</strong> Our failure to enforce any provision is not a waiver of our right to
              do so later.
            </li>
            <li>
              <strong>Assignment:</strong> You may not assign or transfer your rights under these Terms. We
              may assign ours to an affiliate or successor in interest.
            </li>
            <li>
              <strong>Entire agreement:</strong> These Terms, together with our{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>, constitute the entire agreement between you
              and us regarding your use of this website, and supersede any prior understanding on that
              subject.
            </li>
          </ul>
        </article>

        <article className="terms__section">
          <h2>18. Contact Information</h2>
          <p>
            If you have questions about these Terms, you may send us a message through the Contact Us form or
            email us at <a href="mailto:info@octaltech.net">info@octaltech.net</a>. Please provide accurate
            contact information to ensure we can respond effectively.
          </p>
        </article>

        <p className="terms__updated">Terms of Use effective as of August 25, 2026.</p>
      </div>
    </section>
  );
}
