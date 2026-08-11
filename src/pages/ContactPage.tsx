import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Container, Section } from '@/components/ui/Section';
import { business, whatsappLink } from '@/data/business';
import { isValidEmail } from '@/lib/validation';

interface EnquiryForm {
  name: string;
  email: string;
  message: string;
}

export function ContactPage() {
  const [form, setForm] = useState<EnquiryForm>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryForm, string>>>({});
  const [isSent, setSent] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof EnquiryForm, string>> = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Please tell us your name.';
    if (!isValidEmail(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (form.message.trim().length < 10) {
      nextErrors.message = 'A little more detail would help us answer properly.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // No backend in this build — nothing is sent. See src/lib/payment.ts for the
    // equivalent seam on the order path.
    setSent(true);
  }

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <h1 className="text-4xl font-semibold sm:text-5xl">Contact us</h1>
            <p className="mt-4 text-lg text-ink-soft">
              Questions about an order, a bulk enquiry, or a flavour you think we should
              make. We read everything.
            </p>

            {isSent ? (
              <div
                role="status"
                className="mt-8 rounded-card border border-line bg-sand p-6"
              >
                <h2 className="font-display text-lg font-semibold">Thanks — got it.</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  We usually reply within one working day. In this demo build nothing is
                  actually sent, so use WhatsApp or email for anything urgent.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-8 grid max-w-lg gap-5">
                <Field label="Your name" error={errors.name} required>
                  {(props) => (
                    <input
                      {...props}
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                  )}
                </Field>

                <Field label="Email" error={errors.email} required>
                  {(props) => (
                    <input
                      {...props}
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  )}
                </Field>

                <Field label="Message" error={errors.message} required>
                  {(props) => (
                    <textarea
                      {...props}
                      rows={5}
                      value={form.message}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, message: event.target.value }))
                      }
                    />
                  )}
                </Field>

                <Button type="submit" size="lg" className="justify-self-start">
                  Send message
                </Button>
              </form>
            )}
          </div>

          <aside className="lg:pt-20">
            <div className="rounded-card border border-line p-6">
              <h2 className="font-display text-lg font-semibold">Faster ways to reach us</h2>
              <ul className="mt-4 space-y-4 text-sm">
                <li>
                  <span className="block text-ink-muted">WhatsApp</span>
                  <a
                    href={whatsappLink('Hi Nuto, I have a question.')}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 transition-colors hover:text-cashew-deep"
                  >
                    {business.phone}
                  </a>
                </li>
                <li>
                  <span className="block text-ink-muted">Email</span>
                  <a
                    href={`mailto:${business.email}`}
                    className="underline underline-offset-4 transition-colors hover:text-cashew-deep"
                  >
                    {business.email}
                  </a>
                </li>
                <li>
                  <span className="block text-ink-muted">Instagram</span>
                  <a
                    href={business.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 transition-colors hover:text-cashew-deep"
                  >
                    @nutoproducts
                  </a>
                </li>
                <li>
                  <span className="block text-ink-muted">Address</span>
                  <address className="not-italic">
                    {business.address.line1}
                    <br />
                    {business.address.line2}
                    <br />
                    {business.address.city} {business.address.pincode}
                    <br />
                    {business.address.state}
                  </address>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
