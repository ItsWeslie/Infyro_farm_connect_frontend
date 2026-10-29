import { Mail, Linkedin, Instagram, Sprout, ArrowRight } from "lucide-react";

export function ContactSection({ contactForm, setContactForm, setContactToast }) {
  return (
    <section
              className="landing-contact-section"
              id="contact"
              aria-labelledby="landing-contact-title"
            >
              <div className="landing-contact-heading">
                <span className="landing-section-kicker">GET IN TOUCH</span>
                <h2 id="landing-contact-title">
                  Let’s grow <em>together.</em>
                </h2>
                <p>
                  Have a question about Infyro Farms? Send us a message — we’d love
                  to hear from you.
                </p>
              </div>
              <div className="landing-contact-layout">
                <aside className="landing-contact-info">
                  <span className="landing-contact-info-icon">
                    <Mail size={22} />
                  </span>
                  <h3>We’re here to listen.</h3>
                  <p>
                    Share your question, feedback, or idea with the Infyro team.
                  </p>
                  <div className="landing-contact-socials">
                    <a
                      className="landing-contact-email"
                      href="mailto:info@infyroinc.com"
                      aria-label="Email Infyro"
                    >
                      <Mail size={19} />
                    </a>
                    <a
                      href="https://www.linkedin.com/company/infyroinc/posts/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Infyro on LinkedIn"
                    >
                      <Linkedin size={17} />
                    </a>
                    <a
                      href="https://www.instagram.com/infyroinc/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Infyro on Instagram"
                    >
                      <Instagram size={17} />
                    </a>
                  </div>
                  <Sprout
                    className="landing-contact-decoration"
                    size={150}
                    strokeWidth={0.8}
                    aria-hidden="true"
                  />
                </aside>
                <form
                  className="landing-contact-form"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    const name = contactForm.name.trim();
                    const email = contactForm.email.trim();
                    const message = contactForm.message.trim();
                    if (!name || !email || !message) {
                      setContactToast({
                        type: "error",
                        message: "Please fill in your name, email, and message.",
                      });
                      return;
                    }
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setContactToast({
                        type: "error",
                        message: "Please enter a valid email address.",
                      });
                      return;
                    }
                    const subject = encodeURIComponent("Infyro Farms enquiry");
                    const body = encodeURIComponent(
                      "Name: " +
                        name +
                        "\nEmail: " +
                        email +
                        "\n\nMessage:\n" +
                        message,
                    );
                    setContactToast({
                      type: "success",
                      message:
                        "Your email app should open. Please review and send your message there.",
                    });
                    window.location.href =
                      "mailto:info@infyroinc.com?subject=" +
                      subject +
                      "&body=" +
                      body;
                  }}
                >
                  <div className="landing-contact-field">
                    <label htmlFor="landing-contact-name">
                      Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="landing-contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      required
                      value={contactForm.name}
                      onChange={(event) =>
                        setContactForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="landing-contact-field">
                    <label htmlFor="landing-contact-email">
                      Email address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="landing-contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      required
                      value={contactForm.email}
                      onChange={(event) =>
                        setContactForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="landing-contact-field">
                    <label htmlFor="landing-contact-message">
                      Message <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="landing-contact-message"
                      name="message"
                      placeholder="How can we help?"
                      rows={5}
                      required
                      value={contactForm.message}
                      onChange={(event) =>
                        setContactForm((current) => ({
                          ...current,
                          message: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <button
                    className="landing-button landing-contact-submit"
                    type="submit"
                  >
                    Send message <ArrowRight size={17} />
                  </button>
                  <p className="landing-contact-form-note">
                    Your email app will open so you can review and send the message.
                  </p>
                </form>
              </div>
            </section>
  );
}
