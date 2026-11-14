export type PrimeWritingExample = {
  id: string;
  title: string;
  description: string;
  guidance: string;
  sample: string;
};

export const primeWritingExamples: PrimeWritingExample[] = [
  {
    id: 'event-reflection',
    title: 'Event or seminar',
    description: 'A full narrative of the pinning, seminar discussions, and event activities.',
    guidance: 'Follow the event-report flow: introduce the pinning/seminar, organizer, date, venue, and theme; explain the speakers and topics; describe documented activities; and close with an OJT-preparation takeaway only when supplied.',
    sample: `The College of Computing Studies (CCS) held its Pinning and Send-Off Ceremony on May 25, 2026, at the Function Hall of the Campus Administration Building. The ceremony was themed “Pinning Ceremony 2026: Honoring the Commitment and Excellence of BSIS and BSCS Students.” It marked an important step for fourth-year Bachelor of Science in Information Systems (BSIS) and Bachelor of Science in Computer Science (BSCS) students as they prepared to begin their internship.

One of the speakers was Prof. Maurine Aime T. Quiboyen, the Gender and Development (GAD) Director of Jose Rizal Memorial State University. She discussed Republic Act No. 11313, also known as the Safe Spaces Act or Bawal Bastos Law, and Republic Act No. 7877, known as the Anti-Sexual Harassment Act of 1995. She explained different forms of harassment, such as wolf-whistling, offensive name-calling, unwanted staring, inappropriate invitations, and online harassment through social media and text messages. She also reminded us that harassment can happen in public places, schools, workplaces, and other settings. In addition, she emphasized the importance of completing the required gender-related training and obtaining the necessary certification before deployment.

She also discussed the importance of maintaining professional boundaries during OJT. She advised us to avoid inappropriate romantic relationships, overly personal communication, emotional dependence on supervisors, and private meetings in unsafe places. She reminded us to protect ourselves, remain cautious, trust our instincts, and put our faith in God for guidance and protection.

Other speakers also shared helpful advice and reminders about professionalism, responsibility, and proper workplace behavior. After the discussions, the awarding of certificates took place. Each student's name was called, and the students went on stage with their parents or guardians to receive their certificates.

Overall, the ceremony helped us prepare for our internship by teaching us about workplace safety, professional conduct, and our responsibilities as future interns.`,
  },
  {
    id: 'seminar-readiness',
    title: 'Seminar and OJT readiness',
    description: 'Focus on the pinning/seminar as preparation and evaluation of OJT conduct, not completed placement duties.',
    guidance: 'Describe the pinning and seminar, then synthesize its documented guidance about proper attitude, safety, boundaries, and expected conduct in OJT areas. Frame the event as preparation or reflection on readiness only when supported. Do not summarize the student’s placements, daily tasks, or entire OJT experience.',
    sample: `The CCS Pinning and Send-Off Ceremony marked an important step as we prepared to begin our OJT. Along with the pinning, the seminar helped us consider the conduct and attitude expected of interns in the workplace.

Prof. Maurine Aime T. Quiboyen discussed the Safe Spaces Act and the Anti-Sexual Harassment Act, explaining that harassment can occur in public places, schools, workplaces, and online. She also emphasized completing the required gender-related training and certification before deployment. Her reminders about professional boundaries, personal safety, and responsible behavior highlighted important expectations for students entering OJT.

The discussions gave us a point to evaluate our readiness to enter OJT and the standards we should follow there. The awarding of certificates with our parents or guardians made the ceremony a meaningful send-off. Overall, the event reminded me that preparing for OJT includes understanding proper conduct, safety, and respectful workplace behavior.`,
  },
];
