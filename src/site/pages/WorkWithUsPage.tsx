import {
  GraduationCap,
  Handshake,
  Lightbulb,
  Mail,
  MessageCircle,
  Phone,
  School,
} from "lucide-react";
import type { SiteNavigate } from "../page";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF } from "../data/contact";
import { WHATSAPP_NUMBER } from "../components/WhatsAppButton";

interface Props {
  navigate: SiteNavigate;
}

/**
 * Work with Us: an invitation to get in touch. It lists no openings, benefits or hiring steps
 * (none have been provided); people reach APTCODER through the site's existing contact channels.
 */
const EMAIL_SUBJECT = "Work with APTCODER";
export const WORK_WITH_US_EMAIL = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;
export const WORK_WITH_US_WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hello APTCODER, I would like to explore working with you.",
)}`;

const ways = [
  {
    icon: GraduationCap,
    title: "Educators & Mentors",
    text: "Share your passion for teaching coding, AI and robotics with young learners.",
  },
  {
    icon: Lightbulb,
    title: "Technology & Content Creators",
    text: "Help shape engaging, practical learning experiences for children.",
  },
  {
    icon: Handshake,
    title: "Partners & Organisations",
    text: "Collaborate with us to bring technology education to more children.",
  },
];

export default function WorkWithUsPage({ navigate }: Props) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-peach" aria-labelledby="work-heading">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <div className="section-label mb-4 justify-center">WORK WITH US</div>
          <h1
            id="work-heading"
            className="mb-5 text-balance text-4xl font-black leading-tight tracking-tight text-dark sm:text-5xl"
          >
            Help Children Create with <span className="text-primary">Technology.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl leading-relaxed text-gray-600">
            APTCODER is on a mission to make coding and technology education accessible to every
            child. If you would like to contribute to that mission, we would love to hear from you.
          </p>
          <a
            href={WORK_WITH_US_EMAIL}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Get in Touch →
          </a>
        </div>
      </section>

      {/* Who we'd like to hear from */}
      <section className="bg-white py-16 sm:py-20" aria-labelledby="work-ways-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 id="work-ways-heading" className="mb-3 text-3xl font-black text-dark sm:text-4xl">
              Ways to Work with APTCODER
            </h2>
            <p className="text-sm text-gray-500 sm:text-base">
              Whatever your background, tell us how you would like to contribute.
            </p>
          </div>
          <ul className="grid gap-5 md:grid-cols-3">
            {ways.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="rounded-3xl border border-red-100 bg-white p-7 shadow-[0_2px_12px_-6px_rgba(17,24,39,0.15)]"
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-peach text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mb-2 text-lg font-black text-dark">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-gray-600">
            <School className="h-4 w-4 text-primary" aria-hidden="true" />
            Representing a school?
            <a
              href="/school"
              onClick={(event) => {
                event.preventDefault();
                navigate("school");
              }}
              className="font-bold text-primary underline-offset-2 hover:underline"
            >
              See our school partnerships
            </a>
          </p>
        </div>
      </section>

      {/* Get in touch */}
      <section className="bg-gray-50 py-16 sm:py-20" aria-labelledby="work-contact-heading">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2
              id="work-contact-heading"
              className="mb-3 text-3xl font-black text-dark sm:text-4xl"
            >
              Express Your Interest
            </h2>
            <p className="text-sm text-gray-500 sm:text-base">
              Send us a short introduction about yourself, your experience and how you would like to
              work with APTCODER. Our team will get back to you.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            <li>
              <a
                href={WORK_WITH_US_EMAIL}
                className="flex h-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
              >
                <Mail className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                <span className="text-sm font-black text-dark">Email</span>
                <span className="mt-1 text-sm font-semibold text-primary">{CONTACT_EMAIL}</span>
              </a>
            </li>
            <li>
              <a
                href={WORK_WITH_US_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
              >
                <MessageCircle className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                <span className="text-sm font-black text-dark">WhatsApp</span>
                <span className="mt-1 text-sm font-semibold text-primary">Message us</span>
              </a>
            </li>
            <li>
              <a
                href={CONTACT_PHONE_HREF}
                className="flex h-full flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
              >
                <Phone className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
                <span className="text-sm font-black text-dark">Call</span>
                <span className="mt-1 text-sm font-semibold text-primary">{CONTACT_PHONE}</span>
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
