# Course thumbnails: mapping report

- **Source:** 79 images in `public/Thumbnail Samples`, named after LMS course names (the `LMS Course Name (original)` column of `docs/Course_Catalogue_Website.xlsx`).
- **Courses in the catalogue:** 108 (active Course, Camp and Capstone records in Course Master).
- **Courses with a thumbnail:** 55, using 40 images. **Without:** 53 (they keep the placeholder; no matching image exists).

## Rules

- Each image's printed title was checked against the course's LMS name, display name, type, learning model and level.
- An image is shared only by records the workbook groups under the same LMS name (its *Name Key* column).
- Each capstone has two LMS records and two image designs, so each record gets its own design.
- Demo, C-NAT practice-set, workbook, book and testing images are not used: those types are not in the catalogue.
- To change a match, edit `src/site/data/courseThumbnails.json`, then run `python3 scripts/build-course-thumbnails.py` (writes 1280×720 copies to `public/course-thumbnails/`).

## Mappings

| Course | Title | Type | Image | Confidence |
|---|---|---|---|---|
| CRS-001 | Python Transition Program | Course | Python Transition Program - Hindi Adaptive Learning.jpg | High |
| CRS-002 | Programming Fundamentals with Codely | Course | Programming Fundamentals with Codely (EnglishSelf Learning).jpg | High |
| CRS-003 | Intellectual Property Course | Course | Intellectual property Thumbnail | High |
| CRS-004 | Art and Music with Coding | Camp | Art and Music with Coding Camp.jpg | High |
| CRS-005 | Artificial Intelligence & Machine Learning | Camp | Artificial Intelligence & Machine Learning Camp .jpg | High |
| CRS-007 | Blockchain Concepts | Camp | Block Chain and Cryptography CAMP | High |
| CRS-018 | Artificial Intelligence & Machine Learning | Camp | Artificial Intelligence & Machine Learning Camp .jpg | High |
| CRS-021 | Block Coding | Course | Block Coding(VE) - AL | High |
| CRS-024 | Grade 1 Assisted Learning | Course | Grade 1 Assisted Learning Easy | High |
| CRS-025 | Block Coding | Course | Block Coding(M) -AL (Level 2) | High |
| CRS-026 | Grade 1 Assisted Learning | Course | Grade 1 Assisted Learning Hard | High |
| CRS-027 | Grade 1 Assisted Learning | Course | Grade 1 Assisted Learning Moderate | High |
| CRS-028 | Grade 1 Assisted Learning | Course | Grade 1 Assisted Learning Very Easy | High |
| CRS-030 | Grade 6 Assisted Learning | Course | Grade 6 Assisted Learning | High |
| CRS-031 | Art and Music with Coding | Camp | Art and Music with Coding Camp.jpg | High |
| CRS-032 | Artificial Intelligence & Machine Learning | Camp | Artificial Intelligence & Machine Learning Camp .jpg | High |
| CRS-047 | Block Chain and Cryptography Concepts | Camp | Block Chain and Cryptography CAMP | High |
| CRS-049 | Block-Based Coding Fundamentals | Course | Block Coding Hindi (M) | High |
| CRS-052 | Web Development Applications | Course | Web Development (Completed) | High |
| CRS-058 | Creative Art with Coding | Course | Art With Coding - AL | High |
| CRS-061 | JavaScript Fundamentals | Course | Javascript( E) - AL | High |
| CRS-069 | Foundations of Artificial Intelligence & Machine Learning | Course | AIML Level-1 - AL | High |
| CRS-070 | Block-Based Coding | Capstone | Block Coding Capstone - Live | High |
| CRS-071 | Web Development | Capstone | Web Development Capstone - Live | High |
| CRS-072 | Python Programming | Capstone | Python Capstone - Live | High |
| CRS-073 | Cloud Computing | Capstone | Cloud Computing Capstone - Live | High |
| CRS-074 | Application Development | Capstone | App Development Capstone - Live | High |
| CRS-075 | Advanced Web Development | Course | Web Development(H) - ALTS | High |
| CRS-076 | Advanced Python with Block Coding | Course | Python(Hard) - ALTS | High |
| CRS-079 | Block-Based Coding Applications | Course | Block Coding(Hard) - AL | High |
| CRS-080 | Block-Based Coding Advance | Course | Block Coding(M) - AL | High |
| CRS-082 | Programming Fundamentals with Codely | Course | Codely Course - AL(TM)   | High |
| CRS-084 | Block-Based Coding Applications | Course | Block Coding(Hard) - AL | High |
| CRS-092 | Web Development Application | Course | Web Development(H) - ALTS | High |
| CRS-098 | Block Coding Level-1 - Live(TM) | Course | Block Coding Level-1 - Live(TM) | Medium |
| CRS-101 | Web Development | Course | Web Development(M) - SL | High |
| CRS-102 | Block Coding | Course | Block Coding(VE) - SL | High |
| CRS-122 | Block Coding | Course | ब्लॉक कोडिंग(VE) - SL | High |
| CRS-123 | Block Coding | Course | Block Coding(M) - AL | High |
| CRS-143 | Cloud Computing (N) | Course | Cloud Computing Level-1 - Live(N) | High |
| CRS-144 | Block Coding (N) | Course | Block Coding Level-1 - Live(N) | High |
| CRS-145 | App Development (N) | Course | App Development Level-1 - Live(N) | High |
| CRS-147 | Cloud Computing | Capstone | Cloud Computing Capstone - Live copy | High |
| CRS-148 | Block Coding | Capstone | Block Coding Capstone - Live   | High |
| CRS-149 | Web Development | Capstone | Web Development Capstone - Live   | High |
| CRS-150 | Python | Capstone | Python Capstone - Live copy | High |
| CRS-151 | App Development | Capstone | App Development Capstone - Live copy | High |
| CRS-154 | Block Coding(H) - AL | Course | Block Coding(Hard) - AL | High |
| CRS-170 | Block Coding | Course | ब्लॉक कोडिंग(VE) - SL | High |
| CRS-171 | Block Coding | Course | Block Coding(VE) - SL | High |
| CRS-172 | Block Coding | Course | Block Coding(VE) - SL | High |
| CRS-203 | Block-Based Coding Fundamentals | Course | Block Coding(VE) - SL | High |
| CRS-204 | Block-Based Coding Fundamentals | Course | Block Coding(VE) - SL | High |
| CRS-207 | Block-Based Coding | Course | Block Coding(M) - AL | High |
| CRS-210 | Block-Based Coding | Course | Block Coding(Hard) - AL | High |

## Shared images (same LMS name in the workbook)

- Art and Music with Coding Camp.jpg: CRS-004, CRS-031
- Artificial Intelligence & Machine Learning Camp .jpg: CRS-005, CRS-018, CRS-032
- Block Chain and Cryptography CAMP: CRS-007, CRS-047
- Web Development(H) - ALTS: CRS-075, CRS-092
- Block Coding(Hard) - AL: CRS-079, CRS-084, CRS-154, CRS-210
- Block Coding(M) - AL: CRS-080, CRS-123, CRS-207
- Block Coding(VE) - SL: CRS-102, CRS-171, CRS-172, CRS-203, CRS-204
- ब्लॉक कोडिंग(VE) - SL: CRS-122, CRS-170

## Courses without a thumbnail

CRS-006 Data Science, CRS-008 Block-Based Coding, CRS-015 Music Creation with Coding, CRS-029 Programming Fundamentals with Codely, CRS-044 Data Science, CRS-048 Python Programming, CRS-050 Web Development, CRS-051 Block-Based Coding, CRS-054 Game Development Fundamentals with Codely, CRS-055 Game Development using p5.js, CRS-056 Creative Coding with p5.js, CRS-057 Introduction to Cryptography, CRS-059 Introduction to Blockchain, CRS-060 Foundations of Data Science, CRS-081 Programming Fundamentals with Codely, CRS-096 Python Level-1 - Live(TM), CRS-097 Web Development Level-1 - Live(TM), CRS-125 Web Development, CRS-126 Web Development, CRS-127 Web Development, CRS-128 Python, CRS-129 Python, CRS-130 Python, CRS-131 Cloud Computing, CRS-132 Cloud Computing, CRS-133 Cloud Computing, CRS-134 Block Coding, CRS-135 Block Coding, CRS-136 Block Coding, CRS-137 App Development, CRS-138 App Development, CRS-139 App Development, CRS-140 Python (N), CRS-141 Web Development (N), CRS-142 Python (N), CRS-164 Machine Learning, CRS-165 Block Chain, CRS-166 Cryptography, CRS-167 Python, CRS-168 Web Development, CRS-169 Block Coding Camp, CRS-173 Python (Ayushman), CRS-175 Silver Grade-8, CRS-176 Silver Grade-7, CRS-177 Silver Grade-6, CRS-178 Silver Grade-5, CRS-179 Silver Grade-4, CRS-180 Silver Grade-3, CRS-181 Silver Grade-2, CRS-182 Silver Grade-1, CRS-221 App Development, CRS-222 Theme Web Development, CRS-225 Adaptive Learning (Moderate)

## Unused images

- **Not a catalogue type:** Block Coding Demo; C-NAT - App Development(E) Practice Set; C-NAT - App Development(H) Practice Set; C-NAT - Block Coding(E) Practice Set(TM); C-NAT - Block Coding(E) Practice Set; C-NAT - Block Coding(Easy) Practice Set(TM); C-NAT - Block Coding(H) Practice Set; C-NAT - Python Practice Set(TM); C-NAT - Python Practice Set; C-NAT - Web Development Practice Set; C-NAT AIML (E) - Practice Set; C-NAT AIML (VE) - Practice Set; C-NAT Cryptography (E) - Practice Set; C-NAT Cryptography (VE) - Practice Set; C-NAT Data Science (Easy) - Practice Set; C-NAT Data Science (VE) - Practice Set; C-NAT Python Block Coding (E) - Practice Set; C-NAT Python Block Coding (VE) - Practice Set; C-NAT Python Syntax Coding (E) - Practice Set; C-NAT Python Syntax Coding (VE) - Practice Set; C-NAT Web Development Block Coding (VE) - Practice Set; C-NAT Web Development Syntax Coding (EASY) - Practice Set; C-NAT Web Development Syntax Coding (Very Easy) - Practice Set; Coding Book; Demo - App Development; Demo - Art Factory; Demo - Music; Demo - Python; Demo - Web Development; Demo-Grade-1 (ALTS); Demo-Grade-11(ALTS) - All Levels; Demo-Grade-2 (ALTS) - All Levels; Demo-Grade-3 (ALTS) - All Levels; Demo-Grade-5 (ALTS) - All Level; Demo-Grade-6 (ALTS) - All Level; Demo-Grade-9 (ALTS) - All Levels; Grade-6 Computer Workbook; Testing Block Coding Moderate(Instructions Images)
- **Not confidently matched:** हिंदी कोडिंग पाठ्यक्रम ("Hindi coding course"). The closest course, CRS-029 (LMS name "…कोडली पाठ्यक्रम", "Hindi Codely course"), uses a different word, so it was left on the placeholder.
