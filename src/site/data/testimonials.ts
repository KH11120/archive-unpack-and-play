/**
 * Testimonials for the homepage "Voices from the APTCODER Ecosystem" section.
 * Add more entries here; the section renders them in order.
 *
 * - "video": opens an on-page player. `poster` is a still frame from the video itself
 *   (public/Feedback/posters), so the video file is only downloaded when someone presses play.
 * - "quote": a written testimonial. `attributionApproved: false` keeps the person's name and
 *   details off the page until they have approved the wording; set it to true once they have.
 */

type TestimonialBase = {
  id: string;
  /** Small orange label at the top of the card. */
  label: string;
};

export type VideoTestimonial = TestimonialBase & {
  type: "video";
  /** One line under the video thumbnail describing who is speaking. */
  speaker: string;
  video: string;
  poster: string;
  posterAlt: string;
  /** Intrinsic video size, used to size the player before the video loads. */
  width: number;
  height: number;
  /** Shown on the thumbnail, e.g. "1:03". */
  duration: string;
};

export type QuoteTestimonial = TestimonialBase & {
  type: "quote";
  quote: string;
  name: string;
  /** Role, class or designation. */
  role: string;
  /** School or organisation, when relevant. */
  organisation?: string;
  /** Shown instead of the name and details while the attribution is not approved. */
  anonymousAttribution: string;
  attributionApproved: boolean;
  /** Icon in the attribution circle; without it the circle shows the person's initial. */
  avatarIcon?: "student";
};

export type Testimonial = VideoTestimonial | QuoteTestimonial;

/** Files in public/Feedback have spaces in their names; encode them for use as URLs. */
const feedbackFile = (name: string) => `/Feedback/${encodeURIComponent(name)}`;

export const testimonials: Testimonial[] = [
  {
    id: "student-vaibhav",
    type: "quote",
    label: "STUDENT VOICE",
    quote:
      "Before joining APTCODER, I didn’t know much about coding. Now I have learned how to create programs and understand how coding works. The classes are fun, and I really enjoy learning new things and trying them myself. I want to learn more and make my own projects!",
    name: "Vaibhav Maurya",
    role: "Class 8",
    anonymousAttribution: "APTCODER student",
    // Attribution approved for publishing (12 Nov 2026).
    attributionApproved: true,
    avatarIcon: "student",
  },
  {
    id: "parent-experience",
    type: "video",
    label: "PARENT EXPERIENCE",
    speaker: "A parent shares their child’s APTCODER journey",
    video: feedbackFile("sanidhya parent.mp4"),
    poster: "/Feedback/posters/parent-experience.jpg",
    posterAlt: "A parent speaking about APTCODER",
    width: 576,
    height: 1024,
    duration: "1:03",
  },
  {
    id: "teacher-pinky",
    type: "quote",
    label: "TEACHER PERSPECTIVE",
    quote:
      "Students thoroughly enjoyed the APTCODER classes and gained a lot of new knowledge through the sessions. Coding was a completely new concept for many of them, but they understood the lessons very well and participated enthusiastically. It is wonderful to see children learning new concepts, exploring technology and developing their skills through APTCODER.",
    name: "Pinky",
    role: "Computer Teacher",
    organisation: "Government Model Sanskriti Primary School, Budhanpur, Panchkula, Haryana",
    anonymousAttribution: "Computer Teacher",
    attributionApproved: true,
  },
  {
    id: "school-perspective",
    type: "video",
    label: "SCHOOL PERSPECTIVE",
    speaker: "Principal, Atal Awasiya Vidyalaya, Varanasi",
    video: feedbackFile("Atal Awasiya Vidyalaya VNS Principal Feedback.mp4"),
    poster: "/Feedback/posters/school-perspective.jpg",
    posterAlt: "The principal of Atal Awasiya Vidyalaya speaking about APTCODER",
    width: 478,
    height: 850,
    duration: "2:37",
  },
];
