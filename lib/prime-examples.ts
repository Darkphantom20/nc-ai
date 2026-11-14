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
    description: 'A complete event narrative. Select it to guide the AI’s flow and phrasing.',
    guidance: 'Follow the event-report flow: introduce the organizer, event, date, venue, and theme; explain the speaker and key topics; describe documented activities; and close with the writer’s own takeaway only when supplied.',
    sample: `The College of Computing Studies (CCS) held its Pinning and Send-Off Ceremony on May 25, 2026, at the Function Hall of the Campus Administration Building. The ceremony was themed “Pinning Ceremony 2026: Honoring the Commitment and Excellence of BSIS and BSCS Students.” It marked an important step for fourth-year Bachelor of Science in Information Systems (BSIS) and Bachelor of Science in Computer Science (BSCS) students as they prepared to begin their internship.

One of the speakers was Prof. Maurine Aime T. Quiboyen, the Gender and Development (GAD) Director of Jose Rizal Memorial State University. She discussed Republic Act No. 11313, also known as the Safe Spaces Act or Bawal Bastos Law, and Republic Act No. 7877, known as the Anti-Sexual Harassment Act of 1995. She explained different forms of harassment, such as wolf-whistling, offensive name-calling, unwanted staring, inappropriate invitations, and online harassment through social media and text messages. She also reminded us that harassment can happen in public places, schools, workplaces, and other settings. In addition, she emphasized the importance of completing the required gender-related training and obtaining the necessary certification before deployment.

She also discussed the importance of maintaining professional boundaries during OJT. She advised us to avoid inappropriate romantic relationships, overly personal communication, emotional dependence on supervisors, and private meetings in unsafe places. She reminded us to protect ourselves, remain cautious, trust our instincts, and put our faith in God for guidance and protection.

Other speakers also shared helpful advice and reminders about professionalism, responsibility, and proper workplace behavior. After the discussions, the awarding of certificates took place. Each student's name was called, and the students went on stage with their parents or guardians to receive their certificates.

Overall, the ceremony helped us prepare for our internship by teaching us about workplace safety, professional conduct, and our responsibilities as future interns.`,
  },
  {
    id: 'personal-experience',
    title: 'Internship experience',
    description: 'A complete placement narrative. Select it to guide the AI’s flow and phrasing.',
    guidance: 'Follow the internship-experience flow: introduce the training and placements; group actual duties under the correct placement; then describe supported skills and learning before closing with a personal reflection.',
    sample: `My participation in the PRIME program provided me with valuable experience and opportunities to develop my skills in a professional working environment. I was assigned to two offices: LANDBANK – Dipolog Branch and the Registrar’s Office of José Rizal Memorial State University – Tampilisan Campus (JRMSU-TC). These assignments helped me understand different office operations, workplace responsibilities, and the importance of professionalism and teamwork.

During my assignment at LANDBANK – Dipolog Branch, I assisted with customer inquiries, distributed queue numbers, prepared documents, and supported daily office activities. At the Registrar’s Office of JRMSU-TC, I helped organize and file student records, encode information, photocopy and print documents, and assist students with their inquiries. These tasks allowed me to apply my computer skills and improve my communication, time management, and organizational abilities.

Overall, my PRIME experience was meaningful and beneficial to my personal and professional growth. I learned the importance of responsibility, patience, honesty, teamwork, and confidentiality in the workplace. It also allowed me to apply the knowledge I gained from my BS Information Systems course in actual office situations. I am thankful to the staff and employees who guided and supported me throughout my training.`,
  },
];
