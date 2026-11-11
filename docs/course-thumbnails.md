# Course thumbnails: mapping report

- **Thumbnails found:** 79 JPEGs in `public/Thumbnail Samples` (mostly 2000×1126; a few 3000×1688 and 4000×2250, all 16:9)
- **Courses in the catalogue:** 86
- **Mapped:** 35 courses using 34 images. 26 are High confidence and 9 Medium.
- **Courses without a thumbnail:** 51. They keep the existing neutral placeholder.
- **Unused images:** 45

Every image was matched by reading the title printed on the image itself, then checking it against the course's title, Subject, Program Type, Learning Model, Level and Language. Low-confidence matches were **not** applied.

## How it works

- `src/site/data/courseThumbnails.json` maps course IDs (`COURSE-###`, from S.No.) to their source image, with a confidence rating and the reason.
- `scripts/build-course-thumbnails.py` writes a 1280×720 copy of each mapped image to `public/course-thumbnails/<id>.jpg`. These are about 145 KB each, compared with 0.7–2 MB for the originals. The originals are unchanged.
- `src/site/data/courseCatalogue.ts` fills each course's existing `thumbnailUrl` field from the mapping. The course cards and detail pages already used that field.
- The workbook is unchanged; it has no thumbnail column.

To change a match, edit the JSON and run:

```sh
python3 -m pip install -r requirements-catalogue.txt
python3 scripts/build-course-thumbnails.py
```

## Mappings

| Course ID | Course | Image | Confidence |
|---|---|---|---|
| COURSE-001 | Python Transition Program (Hindi/Adaptive Learning) | Python Transition Program - Hindi Adaptive Learning.jpg | High |
| COURSE-002 | Programming Fundamentals with Codely (English/Self Learning) | Programming Fundamentals with Codely (EnglishSelf Learning).jpg | High |
| COURSE-003 | Intellectual Property Course | Intellectual property Thumbnail | High |
| COURSE-004 | Art and Music with Coding Camp | Art and Music with Coding Camp.jpg | High |
| COURSE-005 | Artificial Intelligence & Machine Learning Camp | Artificial Intelligence & Machine Learning Camp .jpg | High |
| COURSE-007 | Blockchain Concepts Camp | Block Chain and Cryptography CAMP | Medium |
| COURSE-010 | Block Coding(VE) - AL | Block Coding(VE) - AL | High |
| COURSE-011 | Grade 1 Assisted Learning Easy | Grade 1 Assisted Learning Easy | High |
| COURSE-012 | Block Coding(M) -AL (Level 2) | Block Coding(M) -AL (Level 2) | High |
| COURSE-013 | Grade 1 Assisted Learning Hard | Grade 1 Assisted Learning Hard | High |
| COURSE-014 | Grade 1 Assisted Learning Moderate | Grade 1 Assisted Learning Moderate | High |
| COURSE-015 | Grade 1 Assisted Learning Very Easy | Grade 1 Assisted Learning Very Easy | High |
| COURSE-017 | Grade 6 Assisted Learning | Grade 6 Assisted Learning | High |
| COURSE-019 | Block-Based Coding Fundamentals (Hindi) | Block Coding Hindi (M) | Medium |
| COURSE-026 | Creative Art with Coding | Art With Coding - AL | High |
| COURSE-029 | JavaScript Fundamentals | Javascript( E) - AL | High |
| COURSE-030 | Foundations of Artificial Intelligence & Machine Learning | AIML Level-1 - AL | Medium |
| COURSE-031 | Block-Based Coding Capstone (Live) | Block Coding Capstone - Live | High |
| COURSE-032 | Web Development Capstone (Live) | Web Development Capstone - Live | High |
| COURSE-033 | Python Programming Capstone (Live) | Python Capstone - Live | High |
| COURSE-034 | Cloud Computing Capstone (Live) | Cloud Computing Capstone - Live | High |
| COURSE-035 | Application Development Capstone (Live) | App Development Capstone - Live | High |
| COURSE-036 | Advanced Web Development (English) | Web Development(H) - ALTS | High |
| COURSE-037 | Advanced Python with Block Coding (English) | Python(Hard) - ALTS | Medium |
| COURSE-038 | Block-Based Coding Applications | Block Coding(Hard) - AL | Medium |
| COURSE-039 | Block-Based Coding Advance | Block Coding(M) - AL | Medium |
| COURSE-040 | Programming Fundamentals with Codely | Codely Course - AL(TM) | Medium |
| COURSE-041 | Programming Fundamentals with Codely (duplicate row of COURSE-040) | Codely Course - AL(TM) | Medium |
| COURSE-044 | Block Coding Level-1 - Live(TM) | Block Coding Level-1 - Live(TM) | Medium |
| COURSE-045 | Intermediate Web Development (English) | Web Development(M) - SL | High |
| COURSE-046 | Block-Based Coding Fundamentals (English/Self Learning) | Block Coding(VE) - SL | High |
| COURSE-047 | ब्लॉक कोडिंग(VE) - SL | ब्लॉक कोडिंग(VE) - SL | High |
| COURSE-066 | Cloud Computing Level-1 - Live(N) | Cloud Computing Level-1 - Live(N) | High |
| COURSE-067 | Block Coding Level-1 - Live(N) | Block Coding Level-1 - Live(N) | High |
| COURSE-068 | App Development Level-1 - Live(N) | App Development Level-1 - Live(N) | High |

Each image file name above omits its `-page-00001.jpg` ending. The reason for every match is recorded in the JSON.

## Decisions needed

1. **Blockchain/cryptography camps.** One image, "Block Chain and Cryptography Camp", fits three courses: COURSE-007 Blockchain Concepts Camp (used), COURSE-070 Block Chain Camp - Live and COURSE-071 Cryptography Camp - Live. Should they share it?
2. **AI & ML camps.** The "Artificial Intelligence & Machine Learning Camp" image is used for COURSE-005. COURSE-069 Machine Learning Camp - Live could share it.
3. **Block Coding Level-1.** The image filed as "(TM)" reads only "Block Coding Level-1 LIVE", so it could equally be COURSE-059 Block Coding Level-1 - Live. It is assigned to COURSE-044 by its file name.
4. **Demo images.** "Demo - Music" fits COURSE-009 Music Creation with Coding, and "Demo - Art Factory" fits COURSE-026. Both have **DEMO** printed on them, so they were not used.
5. **Hindi coding course.** "हिंदी कोडिंग पाठ्यक्रम" (Hindi coding course, showing block coding) could be COURSE-016 Programming Fundamentals with Codely (Hindi) or COURSE-019. It was not used.
6. **"Web Development (Completed)".** A general web-development image. It could suit COURSE-021 Web Development Applications or a Web Development Level course, but nothing identifies which one. It was not used.
7. **Demo Grade images.** "Demo Grade 1/2/3/5/6/9/11 (ALTS)" do not match the "Silver Grade-N - Live" courses: they say Demo and ALTS, not Live. They were not used.

## Courses without a thumbnail (51)

- **Camps:** 006 Data Science Camp, 008 Block-Based Coding Camp, 018 Python Programming Camp, 020 Web Development Camp, 069 Machine Learning Camp, 070 Block Chain Camp, 071 Cryptography Camp, 072 Python Camp, 073 Web Development Camp, 074 Block Coding Camp
- **Assisted Learning courses:** 009 Music Creation with Coding, 016 Codely (Hindi), 021 Web Development Applications, 022 Game Development Fundamentals with Codely, 023 Game Development using p5.js, 024 Creative Coding with p5.js, 025 Introduction to Cryptography, 027 Introduction to Blockchain, 028 Foundations of Data Science
- **Live levels:** 042, 043, 048–065 (Python, Web Development, Cloud Computing, Block Coding and App Development Levels 1–3, plus the (N)/(TM) variants without an image), and 075 Python Level-2 (Ayushman)
- **Other:** 076–083 Silver Grade 1–8, 084 App Development Level-1 Copy, 085 Theme Web Development, 086 Adaptive Learning (Moderate)

## Unused images (45)

- **C-NAT practice sets (22).** These are for the C-NAT olympiad, not catalogue courses: App Development (Easy, Hard); Block Coding (Easy, Easy (TM) ×2, Hard); Python (and TM); Web Development; AIML (Easy, Very Easy); Cryptography (Easy, Very Easy); Data Science (Easy, Very Easy); Python Block Coding (Easy, Very Easy); Python Syntax Coding (Easy, Very Easy); Web Development Block Coding (Very Easy); Web Development Syntax Coding (Easy, Very Easy).
- **Demo classes (13):** Block Coding Demo; Demo - App Development, Art Factory, Music, Python, Web Development; Demo Grade 1, 2, 3, 5, 6, 9, 11 (ALTS).
- **Second designs for already-mapped capstones (5):** Block Coding Capstone (second design), Web Development Capstone ("Live Project"), and the "copy" versions of Python, Cloud Computing and App Development Capstone.
- **Other (5):** Coding Book, Grade-6 Computer Workbook, Testing Block Coding Moderate (Instructions Images), Web Development (Completed), हिंदी कोडिंग पाठ्यक्रम.
