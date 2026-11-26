import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronDown, Instagram, Leaf, Linkedin, List, Mail, MapPin, MessageSquare, Phone, Send, Sprout, UserRound } from "lucide-react";
import "./ContactSection.css";

const contactEmail = "info@infyroinc.com";
const subjects = ["General enquiry", "Product support", "Feedback or suggestion", "Partnership or collaboration", "Other"];

function Landscape() {
  return <div className="ifc-nc-landscape" aria-hidden="true">
    <svg viewBox="0 0 1440 400" preserveAspectRatio="xMidYMax slice">
      <defs>
        <radialGradient id="ifc-nc-sun-glow"><stop stopColor="var(--nc-sun)" stopOpacity=".85" /><stop offset="1" stopColor="var(--nc-sun)" stopOpacity="0" /></radialGradient>
        <linearGradient id="ifc-nc-fields" x1="0" y1="0" x2="0" y2="1"><stop stopColor="var(--nc-field-a)" /><stop offset="1" stopColor="var(--nc-field-b)" /></linearGradient>
      </defs>
      <circle cx="365" cy="115" r="106" fill="url(#ifc-nc-sun-glow)" />
      <circle cx="365" cy="115" r="23" fill="var(--nc-sun)" opacity=".9" />
      <path d="M0 153Q120 97 244 148T500 143T766 125T1025 160T1440 103V400H0Z" fill="var(--nc-hill-a)" />
      <path d="M0 206Q150 143 301 193T574 192T900 156T1180 201T1440 152V400H0Z" fill="var(--nc-hill-b)" />
      <path d="M0 252Q176 193 327 226T615 245T941 195T1212 228T1440 191V400H0Z" fill="var(--nc-hill-c)" />
      <path d="M0 285Q284 238 562 274T1006 254T1440 265V400H0Z" fill="url(#ifc-nc-fields)" />
      {Array.from({length:19},(_,i) => <path key={i} d={`M${440 + i*21} 266 Q${330+i*42} 312 ${-260+i*109} 400`} fill="none" stroke="var(--nc-field-a)" strokeWidth="9" opacity=".73" />)}
      <g transform="translate(145 188)">
        <path d="M12 28 68 3 127 28V82H12Z" fill="var(--nc-house)" />
        <path d="M0 31 68 -6 140 31 125 36 68 10 15 36Z" fill="var(--nc-roof)" />
        <rect x="56" y="49" width="22" height="33" rx="2" fill="var(--nc-roof)" />
        <rect x="22" y="42" width="19" height="18" rx="2" fill="var(--nc-hill-c)" />
        <rect x="94" y="42" width="19" height="18" rx="2" fill="var(--nc-hill-c)" />
        <path d="M22 51H41M31 42V60M94 51H113M103 42V60" stroke="var(--nc-house)" strokeWidth="1.5" />
        <path d="M120 36H151V82H120Z" fill="var(--nc-house)" /><path d="M111 38 135 21 161 38Z" fill="var(--nc-roof)" />
      </g>
      {[[65,258,1.2],[310,268,.62],[550,278,.55],[925,242,.55],[1320,255,.8]].map(([x,y,s]) => <g key={x} transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 0V-55M0 -22 -19 -39M0 -28 21 -46" stroke="var(--nc-roof)" strokeWidth="6" strokeLinecap="round" /><g fill="var(--nc-leaf)"><circle cx="-23" cy="-49" r="24" /><circle cx="14" cy="-59" r="29" /><circle cx="35" cy="-40" r="19" /><circle cx="-5" cy="-74" r="24" /></g></g>)}
      <path d="M0 371Q105 340 219 400H0ZM1440 361Q1360 344 1258 400H1440Z" fill="var(--nc-leaf)" opacity=".8" />
    </svg>
  </div>;
}

function ContactDetail({ icon: Icon, title, value, href }) {
  const children = <><span className="ifc-nc-symbol"><Icon size={19} strokeWidth={1.9} aria-hidden="true" /></span><span><strong>{title}</strong><small>{value}</small></span></>;
  return href ? <a className="ifc-nc-detail" href={href}>{children}</a> : <div className="ifc-nc-detail">{children}</div>;
}

function Field({ name, label, icon: Icon, error, children }) {
  return <div className="ifc-nc-field">
    <label htmlFor={"ifc-nc-" + name}>{label} <span aria-hidden="true">*</span></label>
    <div className="ifc-nc-input-wrap"><Icon className="ifc-nc-input-icon" size={18} strokeWidth={1.8} aria-hidden="true" />{children}</div>
    {error && <span className="ifc-nc-error" id={"ifc-nc-" + name + "-error"}>{error}</span>}
  </div>;
}

export function ContactSection({ contactForm, setContactForm, setContactToast }) {
  const [errors, setErrors] = useState({});
  const reduced = useReducedMotion();
  const animate = !reduced && typeof IntersectionObserver !== "undefined";
  const entrance = delay => ({
    initial: animate ? { opacity: 0, y: 18 } : false,
    whileInView: animate ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, amount: .15 },
    transition: { duration: reduced ? 0 : .65, delay, ease: [.2,.7,.2,1] },
  });

  function change(event) {
    const { name, value } = event.target;
    setContactForm(current => ({ ...current, [name]: value }));
    setErrors(current => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function fieldProps(name) {
    return {
      id: "ifc-nc-" + name, name, value: contactForm[name] ?? "", onChange: change,
      required: true, "aria-invalid": !!errors[name],
      "aria-describedby": errors[name] ? "ifc-nc-" + name + "-error" : undefined,
    };
  }

  function submit(event) {
    event.preventDefault();
    const { name, email, subject, message } = Object.fromEntries(["name","email","subject","message"].map(key => [key, (contactForm[key] ?? "").trim()]));
    const next = {};
    if (!name) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!subjects.includes(subject)) next.subject = "Select a subject.";
    if (!message) next.message = "Enter your message.";
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      event.currentTarget.elements.namedItem(first)?.focus();
      setContactToast({ type: "error", message: "Please review the highlighted fields." });
      return;
    }
    const emailSubject = encodeURIComponent("Infyro Farms — " + subject);
    const body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\nMessage:\n" + message);
    setContactToast({ type: "success", message: "Your email app should open. Please review and send your message there." });
    window.location.href = "mailto:" + contactEmail + "?subject=" + emailSubject + "&body=" + body;
  }

  return <section className="ifc-nature-contact" id="contact" aria-labelledby="landing-contact-title">
    <Landscape />
    <div className="ifc-nc-corner" aria-hidden="true" />
    <Leaf className="ifc-nc-botanical" strokeWidth={.65} aria-hidden="true" />
    <div className="ifc-nc-layout">
      <motion.div className="ifc-nc-copy" {...entrance(0)}>
        <span className="ifc-nc-kicker"><Sprout size={20} strokeWidth={1.8} aria-hidden="true" />CONTACT US</span>
        <h2 id="landing-contact-title">We’re here to <em>listen.</em></h2>
        <p>Share your question, feedback, or idea with the Infyro team.</p>
        <div className="ifc-nc-details">
          <ContactDetail icon={Mail} title="Email Us" value={contactEmail} href={"mailto:" + contactEmail} />
          <ContactDetail icon={Phone} title="Call Us" value="+91 8438938918" href="tel:+918438938918" />
          <ContactDetail icon={MapPin} title="Our Location" value="Tiruchirapalli, Tamil Nadu, India" />
        </div>
        <div className="ifc-nc-socials">
          <a href="https://www.linkedin.com/company/infyroinc/posts/" target="_blank" rel="noopener noreferrer" aria-label="Infyro on LinkedIn"><Linkedin size={18} aria-hidden="true" /></a>
          <a href="https://www.instagram.com/infyroinc/" target="_blank" rel="noopener noreferrer" aria-label="Infyro on Instagram"><Instagram size={18} aria-hidden="true" /></a>
        </div>
      </motion.div>
      <motion.form className="ifc-nc-form" onSubmit={submit} noValidate aria-labelledby="ifc-nc-form-title" {...entrance(.1)}>
        <div className="ifc-nc-form-head"><span className="ifc-nc-symbol"><Sprout size={29} strokeWidth={1.8} aria-hidden="true" /></span><div><h3 id="ifc-nc-form-title">Send Us a Message</h3><p>Fill in the details below to prepare your message.</p></div></div>
        <div className="ifc-nc-field-row">
          <Field name="name" label="Full Name" icon={UserRound} error={errors.name}><input {...fieldProps("name")} type="text" autoComplete="name" placeholder="Your name" /></Field>
          <Field name="email" label="Email Address" icon={Mail} error={errors.email}><input {...fieldProps("email")} type="email" autoComplete="email" placeholder="Your email" /></Field>
        </div>
        <Field name="subject" label="Subject" icon={List} error={errors.subject}>
          <select {...fieldProps("subject")}><option value="" disabled>Select a subject</option>{subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}</select>
          <ChevronDown className="ifc-nc-select-arrow" size={18} aria-hidden="true" />
        </Field>
        <Field name="message" label="Message" icon={MessageSquare} error={errors.message}><textarea {...fieldProps("message")} rows={5} placeholder="Write your message..." /></Field>
        <button type="submit" className="ifc-nc-submit"><Send size={19} aria-hidden="true" />Send Message</button>
        <p className="ifc-nc-note">Your email app will open so you can review and send the message.</p>
      </motion.form>
    </div>
  </section>;
}
