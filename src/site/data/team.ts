/**
 * Leadership team for the About page "Meet Our Team" section, rendered in order.
 *
 * `photo` is a web-sized square crop of the original in public/images/team
 * (made by scripts/build-team-photos.py); `originalPhoto` records which original it came from.
 */
export type TeamMember = {
  id: string;
  name: string;
  role: string;
  description: string;
  photo: string;
  originalPhoto: string;
};

export const team: TeamMember[] = [
  {
    id: "gaurav-agrawal",
    name: "Mr. Gaurav Agrawal",
    role: "Founder & CEO",
    description:
      "An alumnus of IIT Bombay and a former EdTech industry professional, Mr. Gaurav Agrawal founded APTCODER with a vision to make coding and technology education accessible to every child.",
    photo: "/images/team/web/gaurav-agrawal.jpg",
    originalPhoto: "/images/team/gaurav-agrawal.png",
  },
  {
    id: "ashish-bhatt",
    name: "Ashish Bhatt",
    role: "Technical Head & Founding Member",
    description:
      "An alumnus of IIT Bombay, Ashish Bhatt leads the technical vision and development at APTCODER, helping build engaging and scalable technology-driven learning solutions.",
    photo: "/images/team/web/ashish-bhatt.jpg",
    originalPhoto: "/images/team/ashish_bhatt.png",
  },
];
