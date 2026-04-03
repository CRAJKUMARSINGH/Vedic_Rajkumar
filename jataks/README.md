# Jataks Database

Astrological birth chart database sourced from:
**ASTROLOGICAL CHART DATABASE FEB 2014-DESKTOP-3RRLJHF.xlsx**

## Contents

| File | Name | DOB | Time | Place | In Excel |
|------|------|-----|------|-------|----------|
| rajkumar-profile.json | Rajkumar | 1963-09-15 | 06:00 | Nandli/Aspur, Rajasthan | ✅ Row 6 |
| priyanka-profile.json | Priyanka Jain | 1984-10-23 | 05:50 | Ahmedabad, Gujarat | ✅ Row 9 |
| priyansh-profile.json | Priyansh Singh Chauhan | 2000-10-26 | 00:50 | Indore, MP | ✅ Row 3 |
| vishwaraj-profile.json | Vishwaraj Singh Chauhan | 1994-09-26 | 02:17 | Indore, MP | ✅ Row 4 |
| mummy-profile.json | Mummy | 1947-09-05 | 05:00 | Nandli, Rajasthan | ✅ Row 5 |
| kanchi-profile.json | Kanchi Jain | 2004-09-08 | 01:05 | Aspur, Rajasthan | ✅ Row 7 |
| kiwangi-profile.json | Kiwangi Jain | 2010-12-21 | 10:10 | Idar, Gujarat | ✅ Row 8 |
| ajit-profile.json | Ajit Singh Chauhan | 1975-09-07 | 05:35 | Banswara, Rajasthan | ✅ Row 10 |
| bittu-profile.json | Dhairya Bittu Arthuna | 2021-05-02 | 05:45 | Banswara, Rajasthan | ✅ Row 11 |
| naman-profile.json | Naman Shah | 1997-03-29 | 03:32 | Partapur, Rajasthan | ✅ Row 12 |
| jaya-profile.json | Jaya Sisodia | 1994-06-25 | 11:00 | Indore, MP | ✅ Row 13 |
| pankaj-profile.json | Pankaj Jain | 1979-07-28 | 23:50 | Dungarpur, Rajasthan | ➕ Added |
| hunar-profile.json | Hunar Jain | 1996-09-09 | 12:47 | Dungarpur, Rajasthan | ➕ Added |

## Excel Source Data

Original Excel columns: `NAME | DATE OF BIRTH | TIME | PLACE | HOW U RECALL THIS PERSON?`

Excel serial dates decoded using epoch Jan 1 1900 (with Excel leap-year bug correction):
- 17415 → 1947-09-05 (Mummy)
- 23269 → 1963-09-15 (Rajkumar)
- 27644 → 1975-09-07 (Ajit)
- 34510 → 1994-06-25 (Jaya)
- 34603 → 1994-09-26 (Vishwaraj)
- 35518 → 1997-03-29 (Naman)
- 38238 → 2004-09-08 (Kanchi)
- 44318 → 2021-05-02 (Bittu)

Time fractions decoded (Excel stores time as fraction of 24h):
- 0.20833 → 05:00 (Mummy)
- 0.25 → 06:00 (Rajkumar)
- 0.24305 → 05:50 (Priyanka)

## Format

All profiles use:
- Dates: ISO 8601 `YYYY-MM-DD`
- Times: 24-hour `HH:MM`
- Coordinates: Decimal degrees
- Ayanamsa: Lahiri (Chitrapaksha)
