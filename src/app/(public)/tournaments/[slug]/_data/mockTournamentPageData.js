/** @type {import('../_lib/tournamentPageTypes').TournamentPageData} */
export const mockTournamentPageData = {
  "slug": "central-texas-championship",
  "brandTitle": "JOMG PCC",
  "brandSubtitle": "Pickleball Club Championship",
  "title": "Central Texas Championship",
  "badge": "CLUB VS CLUB",
  "bannerUrl": "/tournaments/central-texas-championship-banner.jpg",
  "volairLogoUrl": "/tournaments/volair-logo.png",
  "infoBar": [
    {
      "icon": "calendar",
      "label": "Masters 50+",
      "value": "Sat, Aug 8"
    },
    {
      "icon": "calendar",
      "label": "Open 18+",
      "value": "Sat, Sep 19"
    },
    {
      "icon": "format",
      "label": "Format",
      "value": "MLP Style"
    },
    {
      "icon": "clubs",
      "label": "Club",
      "value": "14"
    }
  ],
  "venue": {
    "name": "Apex Pickleball Clubs",
    "address": "1435 Main Street \u00b7 Cedar Park, TX 78613",
    "mapsUrl": "https://www.google.com/maps/search/?api=1&query=Apex+Pickleball+Clubs+1435+Main+Street+Cedar+Park+TX+78613"
  },
  "organizer": {
    "initials": "SK",
    "name": "Sarah Kim",
    "role": "Tournament Director",
    "email": "sarah@jomgpb.com",
    "phone": "(512) 555-0142",
    "phoneHref": "tel:+15125550142"
  },
  "tabs": {
    "details": {
      "about": [
        "The Central Texas Championship is an invite-only club-vs-club battle on the JOMG PCC circuit \u2014 the strongest teams in the region across nine skill divisions.",
        "This is MLP team play: every team fields its starters contesting men's doubles, women's doubles, two mixed games, and a Dream Breaker when tied 2\u20132."
      ],
      "courts": "Played on Apex's championship indoor courts with cushioned surfacing and pro-grade nets.",
      "officialBall": "Sriya Designs match ball \u2014 the official tournament ball used for every match. Tournament balls provided on court.",
      "instructions": [
        {
          "label": "Stay & Travel",
          "text": "Hampton Inn Austin (tournament rate code: APBO25)."
        },
        {
          "label": "On-Site Food",
          "text": "Food trucks on-site 8am\u20134pm. Water stations at every court."
        },
        {
          "label": "Parking & Arrival",
          "text": "Free parking on-site. Shuttle available from Hampton Inn every 30 min."
        },
        {
          "label": "What to Bring",
          "text": "Own paddle required. Tournament balls provided. Court-appropriate shoes mandatory."
        },
        {
          "label": "Waiver / Liability",
          "text": "By registering, players agree to the Austin Pickleball Club liability waiver and release of claims."
        }
      ],
      "duprPolicyText": "DUPR is enforced and recorded for 18+ Open divisions — match results are submitted to DUPR. For 50+ Masters, DUPR is enforced but not recorded. A DUPR profile is mandatory; duplicate profiles are not allowed. Players without a DUPR rating are not allowed in 18+. A player's DUPR overall rating is taken into consideration — not age- or gender-based ratings."
    },
    "format": {
      "tag": "MLP Style",
      "intro": "Major League Pickleball format \u2014 team play with men's doubles, women's doubles, and mixed doubles segments plus a Dream Breaker tiebreaker.",
      "mlpScoring": [
        {
          "label": "Men's Doubles",
          "value": "1 game to 11, win by 2"
        },
        {
          "label": "Women's Doubles",
          "value": "1 game to 11, win by 2"
        },
        {
          "label": "Mixed Doubles 1",
          "value": "1 game to 11, win by 2"
        },
        {
          "label": "Mixed Doubles 2",
          "value": "1 game to 11, win by 2"
        }
      ],
      "dreamBreaker": [
        {
          "label": "Scoring",
          "value": "1 game to 21, win by 1"
        },
        {
          "label": "Rotation",
          "value": "Singles rally \u2014 1 server switches"
        },
        {
          "label": "Trigger",
          "value": "Only when games tied 2\u20132"
        }
      ],
      "teamSetup": [
        {
          "label": "Starters",
          "value": "2F + 2M"
        },
        {
          "label": "Substitutes (Optional)",
          "value": "1F & 1M"
        },
        {
          "label": "Game Order",
          "value": "Women's D \u2192 Men's D \u2192 Mixed"
        }
      ],
      "scoringTiming": [
        {
          "label": "Scoring Type",
          "value": "Traditional (side-out)"
        },
        {
          "label": "Warm-up Time",
          "value": "3 min"
        }
      ],
      "notes": [
        {
          "label": "Substitutions",
          "text": "Allowed for injury or before the next match (not between games)."
        },
        {
          "label": "Coach on Court",
          "text": "Off \u2014 no non-playing coach during timeouts."
        }
      ]
    },
    "pointsAdvance": {
      "tag": "How Teams Advance",
      "intro": "Teams don't just advance on wins and losses. They earn standings points based on how a match is won or lost, and those points decide playoff qualification.",
      "pointCards": [
        {
          "points": 3,
          "label": "Regulation Win",
          "example": "Won the match 3\u20131 or 4\u20130",
          "variant": "win"
        },
        {
          "points": 2,
          "label": "Dream Breaker Win",
          "example": "Won 3\u20132 in the 2\u20132 tiebreaker",
          "variant": "db-win"
        },
        {
          "points": 1,
          "label": "Dream Breaker Loss",
          "example": "Lost 2\u20133 in the 2\u20132 tiebreaker",
          "variant": "db-loss"
        },
        {
          "points": 0,
          "label": "Regulation Loss",
          "example": "Lost the match 1\u20133 or 0\u20134",
          "variant": "loss"
        }
      ],
      "poolNote": "Every team plays a full round robin within its pool. A team's standings points are added up across all of its pool matches, and the teams with the most points advance to the playoff bracket.",
      "dreamBreakerNote": "The Dream Breaker is the singles tiebreaker played only when a team match is level at 2\u20132. It decides who wins the match and sets the standings points above \u2014 but it does not count toward game differential tiebreakers.",
      "tiebreakers": [
        {
          "rank": 1,
          "name": "Head-to-head result",
          "desc": "Used when exactly two teams are tied \u2014 the winner of their match is seeded higher"
        },
        {
          "rank": 2,
          "name": "Game differential",
          "desc": "Games won minus games lost across pool play (the four regular matches only)"
        },
        {
          "rank": 3,
          "name": "Point differential",
          "desc": "Total points won minus points lost across pool play"
        },
        {
          "rank": 4,
          "name": "Head-to-head point differential",
          "desc": "Points won minus lost in only the matches between the tied teams"
        },
        {
          "rank": 5,
          "name": "Coin flip",
          "desc": "If every measure above is identical, the tournament director decides by random draw",
          "last": true,
          "tag": "Last resort"
        }
      ],
      "multiTeamNote": "When three or more teams are tied, head-to-head often can't settle it (the teams may have split their matches in a loop), so game differential is used first, then point differential."
    },
    "divisions": {
      "note": "The championship runs across two separate event dates \u2014 the 50+ Masters divisions play Saturday, August 8, and the 18+ Open divisions play Saturday, September 19. Select a date below to see its divisions.",
      "days": [
        {
          "id": "aug-8",
          "label": "August 8",
          "subtitle": "Sat \u00b7 50+ Masters \u00b7 4 divisions",
          "divisions": [
            {
              "id": "50-dupr-12",
              "time": "8:30 AM",
              "name": "50+ \u00b7 DUPR 12",
              "sub": "Team cap 12.30 \u00b7 Max individual 3.60",
              "teamCount": 8,
              "playerCount": 32,
              "barLabel": "8 teams \u00b7 seeded by team DUPR",
              "hasDetail": true,
              "previewTeam": {
                "seed": 1,
                "initials": "NB",
                "name": "New Braunfels",
                "location": "New Braunfels, TX \u00b7 NB Pickleball",
                "teamDupr": "11.8",
                "players": [
                  {
                    "firstName": "Marcus",
                    "lastName": "Reed",
                    "initials": "MR",
                    "dupr": 3.2,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Evan",
                    "lastName": "Vasquez",
                    "initials": "EV",
                    "dupr": 3.1,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Sara",
                    "lastName": "Garcia",
                    "initials": "SG",
                    "dupr": 2.8,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Liv",
                    "lastName": "Wood",
                    "initials": "LW",
                    "dupr": 2.7,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            },
            {
              "id": "50-dupr-14",
              "time": "9:45 AM",
              "name": "50+ \u00b7 DUPR 14",
              "sub": "Team cap 14.30 \u00b7 Max individual 4.10",
              "teamCount": 16,
              "playerCount": 64,
              "barLabel": "16 teams \u00b7 seeded by team DUPR",
              "hasDetail": false,
              "previewTeam": {
                "seed": 1,
                "initials": "CP",
                "name": "Cedar Park 50+",
                "location": "Cedar Park, TX \u00b7 Cedar Park Pickleball",
                "teamDupr": "13.2",
                "players": [
                  {
                    "firstName": "Dan",
                    "lastName": "Cole",
                    "initials": "DC",
                    "dupr": 3.5,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Ray",
                    "lastName": "Mills",
                    "initials": "RM",
                    "dupr": 3.3,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Ann",
                    "lastName": "Park",
                    "initials": "AP",
                    "dupr": 3.2,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Kim",
                    "lastName": "Tran",
                    "initials": "KT",
                    "dupr": 3.2,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            },
            {
              "id": "50-dupr-16",
              "time": "11:00 AM",
              "name": "50+ \u00b7 DUPR 16",
              "sub": "Team cap 16.30 \u00b7 Max individual 4.60",
              "teamCount": 12,
              "playerCount": 48,
              "barLabel": "12 teams \u00b7 seeded by team DUPR",
              "hasDetail": false,
              "previewTeam": {
                "seed": 1,
                "initials": "PF",
                "name": "Pflugerville Spin",
                "location": "Pflugerville, TX \u00b7 Spin Club",
                "teamDupr": "15.1",
                "players": [
                  {
                    "firstName": "Tom",
                    "lastName": "Reed",
                    "initials": "TR",
                    "dupr": 4.0,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Jay",
                    "lastName": "Kim",
                    "initials": "JK",
                    "dupr": 3.8,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Eva",
                    "lastName": "Shaw",
                    "initials": "ES",
                    "dupr": 3.7,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Liz",
                    "lastName": "Vo",
                    "initials": "LV",
                    "dupr": 3.6,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            },
            {
              "id": "50-dupr-18",
              "time": "1:30 PM",
              "name": "50+ \u00b7 DUPR 18",
              "sub": "Team cap 18.30 \u00b7 Max individual 5.10",
              "teamCount": 8,
              "playerCount": 32,
              "barLabel": "8 teams \u00b7 seeded by team DUPR",
              "hasDetail": false,
              "previewTeam": {
                "seed": 1,
                "initials": "GT",
                "name": "Georgetown Aces",
                "location": "Georgetown, TX \u00b7 Georgetown Pickle Co.",
                "teamDupr": "17.4",
                "players": [
                  {
                    "firstName": "Pat",
                    "lastName": "Marsh",
                    "initials": "PM",
                    "dupr": 4.5,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Evan",
                    "lastName": "Patterson",
                    "initials": "EP",
                    "dupr": 4.3,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Dana",
                    "lastName": "Brown",
                    "initials": "DB",
                    "dupr": 4.2,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Tara",
                    "lastName": "Park",
                    "initials": "TP",
                    "dupr": 4.4,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            }
          ]
        },
        {
          "id": "sep-19",
          "label": "September 19",
          "subtitle": "Sat \u00b7 18+ Open \u00b7 5 divisions",
          "divisions": [
            {
              "id": "open-dupr-12",
              "time": "8:00 AM",
              "name": "Open \u00b7 DUPR 12",
              "sub": "Team cap 12.30 \u00b7 Max individual 3.60",
              "teamCount": 12,
              "playerCount": 48,
              "barLabel": "12 teams \u00b7 seeded by team DUPR",
              "hasDetail": false,
              "previewTeam": {
                "seed": 1,
                "initials": "KY",
                "name": "Kyle Elite",
                "location": "Kyle, TX \u00b7 Kyle Picklers",
                "teamDupr": "11.9",
                "players": [
                  {
                    "firstName": "James",
                    "lastName": "Vasquez",
                    "initials": "JV",
                    "dupr": 3.1,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Ben",
                    "lastName": "Kim",
                    "initials": "BK",
                    "dupr": 3.0,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Tara",
                    "lastName": "Tran",
                    "initials": "TT",
                    "dupr": 2.8,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Dana",
                    "lastName": "Rodriguez",
                    "initials": "DR",
                    "dupr": 3.0,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            },
            {
              "id": "open-dupr-14",
              "time": "9:30 AM",
              "name": "Open \u00b7 DUPR 14",
              "sub": "Team cap 14.30 \u00b7 Max individual 4.10",
              "teamCount": 16,
              "playerCount": 64,
              "barLabel": "16 teams \u00b7 seeded by team DUPR",
              "hasDetail": false,
              "previewTeam": {
                "seed": 1,
                "initials": "AA",
                "name": "Apex Aces B",
                "location": "Cedar Park, TX \u00b7 Apex PB",
                "teamDupr": "13.8",
                "players": [
                  {
                    "firstName": "Chris",
                    "lastName": "Lee",
                    "initials": "CL",
                    "dupr": 3.6,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Dev",
                    "lastName": "Park",
                    "initials": "DP",
                    "dupr": 3.5,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Amy",
                    "lastName": "White",
                    "initials": "AW",
                    "dupr": 3.4,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Gail",
                    "lastName": "Lee",
                    "initials": "GL",
                    "dupr": 3.3,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            },
            {
              "id": "open-dupr-16",
              "time": "11:00 AM",
              "name": "Open \u00b7 DUPR 16",
              "sub": "Team cap 16.30 \u00b7 Max individual 4.60",
              "teamCount": 8,
              "playerCount": 32,
              "barLabel": "8 teams \u00b7 seeded by team DUPR",
              "hasDetail": false,
              "previewTeam": {
                "seed": 1,
                "initials": "AA",
                "name": "Apex Aces",
                "location": "Cedar Park, TX \u00b7 Apex PB",
                "teamDupr": "15.6",
                "players": [
                  {
                    "firstName": "Marcus",
                    "lastName": "Reed",
                    "initials": "MR",
                    "dupr": 4.0,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Evan",
                    "lastName": "Vasquez",
                    "initials": "EV",
                    "dupr": 3.9,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Sara",
                    "lastName": "Garcia",
                    "initials": "SG",
                    "dupr": 3.8,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Liv",
                    "lastName": "Wood",
                    "initials": "LW",
                    "dupr": 3.9,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            },
            {
              "id": "open-dupr-18",
              "time": "1:00 PM",
              "name": "Open \u00b7 DUPR 18",
              "sub": "Team cap 18.30 \u00b7 Max individual 5.10",
              "teamCount": 12,
              "playerCount": 48,
              "barLabel": "12 teams \u00b7 seeded by team DUPR",
              "hasDetail": false,
              "previewTeam": {
                "seed": 1,
                "initials": "LS",
                "name": "Lone Star Pro",
                "location": "Round Rock, TX \u00b7 Lone Star PB",
                "teamDupr": "17.2",
                "players": [
                  {
                    "firstName": "Tim",
                    "lastName": "Vasquez",
                    "initials": "TV",
                    "dupr": 4.4,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Rick",
                    "lastName": "Frost",
                    "initials": "RF",
                    "dupr": 4.3,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Jess",
                    "lastName": "White",
                    "initials": "JW",
                    "dupr": 4.2,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Gail",
                    "lastName": "Ruiz",
                    "initials": "GR",
                    "dupr": 4.3,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            },
            {
              "id": "open-dupr-20",
              "time": "3:00 PM",
              "name": "Open \u00b7 DUPR 20",
              "sub": "Team cap 20.30 \u00b7 Max individual 5.80 \u00b7 Open Age only",
              "teamCount": 8,
              "playerCount": 32,
              "barLabel": "8 teams \u00b7 seeded by team DUPR",
              "hasDetail": false,
              "previewTeam": {
                "seed": 1,
                "initials": "PF",
                "name": "Pflugerville Elite",
                "location": "Pflugerville, TX \u00b7 Spin Club",
                "teamDupr": "19.1",
                "players": [
                  {
                    "firstName": "Tom",
                    "lastName": "Reed",
                    "initials": "TR",
                    "dupr": 4.8,
                    "captain": true,
                    "sub": false
                  },
                  {
                    "firstName": "Jay",
                    "lastName": "Kim",
                    "initials": "JK",
                    "dupr": 4.7,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Eva",
                    "lastName": "Shaw",
                    "initials": "ES",
                    "dupr": 4.8,
                    "captain": false,
                    "sub": false
                  },
                  {
                    "firstName": "Liz",
                    "lastName": "Vo",
                    "initials": "LV",
                    "dupr": 4.8,
                    "captain": false,
                    "sub": false
                  }
                ],
                "subs": []
              }
            }
          ]
        }
      ],
      "details": {
        "50-dupr-12": {
          "title": "50+ \u00b7 DUPR 12",
          "subtitle": "\u2264 12.0 team cap \u00b7 8 teams \u00b7 Day 1 \u00b7 8:30 AM \u00b7 2 pools \u2192 Single Elimination \u00b7 Sponsored by Merge Barbershop",
          "overview": {
            "cards": [
              {
                "label": "Format",
                "value": "2 Pools \u2192 Single Elim"
              },
              {
                "label": "Teams",
                "value": "8 \u00b7 32 players"
              },
              {
                "label": "Pool Play",
                "value": "Round robin \u00b7 to 15"
              },
              {
                "label": "Bracket",
                "value": "Top 2 / pool \u00b7 to 11"
              }
            ],
            "howItWorks": "Eight teams split into two pools of four. Each team plays a round-robin within its pool. The top two from each pool advance to a 4-team single-elimination bracket. Pool games are MLP-format (four doubles games to 15, Dream Breaker at 2\u20132); bracket games play to 11, win by 2.",
            "status": "Completed \u00b7 final standings posted",
            "champion": "New Braunfels def. Round Rock Smash 3\u20131"
          },
          "teams": [
            {
              "seed": 1,
              "initials": "NB",
              "name": "New Braunfels",
              "location": "New Braunfels, TX \u00b7 NB Pickleball",
              "teamDupr": "11.8",
              "players": [
                {
                  "firstName": "Marcus",
                  "lastName": "Reed",
                  "initials": "MR",
                  "dupr": 3.2,
                  "captain": true,
                  "sub": false
                },
                {
                  "firstName": "Evan",
                  "lastName": "Vasquez",
                  "initials": "EV",
                  "dupr": 3.1,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Sara",
                  "lastName": "Garcia",
                  "initials": "SG",
                  "dupr": 2.8,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Liv",
                  "lastName": "Wood",
                  "initials": "LW",
                  "dupr": 2.7,
                  "captain": false,
                  "sub": false
                }
              ],
              "subs": [
                {
                  "firstName": "Jake",
                  "lastName": "Trent",
                  "initials": "JT",
                  "dupr": 2.9,
                  "captain": false,
                  "sub": true
                },
                {
                  "firstName": "Nora",
                  "lastName": "Pace",
                  "initials": "NP",
                  "dupr": 2.6,
                  "captain": false,
                  "sub": true
                }
              ]
            },
            {
              "seed": 2,
              "initials": "LD",
              "name": "Leander Drop",
              "location": "Leander, TX \u00b7 Leander Pickleball",
              "teamDupr": "11.6",
              "players": [
                {
                  "firstName": "Paul",
                  "lastName": "Moore",
                  "initials": "PM",
                  "dupr": 3.2,
                  "captain": true,
                  "sub": false
                },
                {
                  "firstName": "Sam",
                  "lastName": "Kessler",
                  "initials": "SK",
                  "dupr": 3.0,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Mia",
                  "lastName": "Boyd",
                  "initials": "MB",
                  "dupr": 2.8,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Lisa",
                  "lastName": "Kim",
                  "initials": "LK",
                  "dupr": 2.6,
                  "captain": false,
                  "sub": false
                }
              ],
              "subs": []
            },
            {
              "seed": 3,
              "initials": "RR",
              "name": "Round Rock Smash",
              "location": "Round Rock, TX \u00b7 Round Rock Picklers",
              "teamDupr": "11.4",
              "players": [
                {
                  "firstName": "Rick",
                  "lastName": "Jones",
                  "initials": "RJ",
                  "dupr": 3.1,
                  "captain": true,
                  "sub": false
                },
                {
                  "firstName": "Dale",
                  "lastName": "Greer",
                  "initials": "DG",
                  "dupr": 3.0,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Amy",
                  "lastName": "White",
                  "initials": "AW",
                  "dupr": 2.7,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Gail",
                  "lastName": "Lee",
                  "initials": "GL",
                  "dupr": 2.6,
                  "captain": false,
                  "sub": false
                }
              ],
              "subs": []
            },
            {
              "seed": 4,
              "initials": "GT",
              "name": "Georgetown",
              "location": "Georgetown, TX \u00b7 Georgetown Pickle Co.",
              "teamDupr": "11.2",
              "players": [
                {
                  "firstName": "Pat",
                  "lastName": "Marsh",
                  "initials": "PM",
                  "dupr": 3.1,
                  "captain": true,
                  "sub": false
                },
                {
                  "firstName": "Evan",
                  "lastName": "Patterson",
                  "initials": "EP",
                  "dupr": 2.9,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Dana",
                  "lastName": "Brown",
                  "initials": "DB",
                  "dupr": 2.6,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Tara",
                  "lastName": "Park",
                  "initials": "TP",
                  "dupr": 2.5,
                  "captain": false,
                  "sub": false
                }
              ],
              "subs": []
            },
            {
              "seed": 5,
              "initials": "LS",
              "name": "Lone Star Smash",
              "location": "Round Rock, TX \u00b7 Lone Star PB",
              "teamDupr": "11.0",
              "players": [
                {
                  "firstName": "Tim",
                  "lastName": "Vasquez",
                  "initials": "TV",
                  "dupr": 3.0,
                  "captain": true,
                  "sub": false
                },
                {
                  "firstName": "Rick",
                  "lastName": "Frost",
                  "initials": "RF",
                  "dupr": 2.9,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Jess",
                  "lastName": "White",
                  "initials": "JW",
                  "dupr": 2.6,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Gail",
                  "lastName": "Ruiz",
                  "initials": "GR",
                  "dupr": 2.5,
                  "captain": false,
                  "sub": false
                }
              ],
              "subs": []
            },
            {
              "seed": 6,
              "initials": "WW",
              "name": "Westlake Elite",
              "location": "Westlake, TX \u00b7 Westlake Athletic Club",
              "teamDupr": "10.8",
              "players": [
                {
                  "firstName": "Cole",
                  "lastName": "Mills",
                  "initials": "CM",
                  "dupr": 3.0,
                  "captain": true,
                  "sub": false
                },
                {
                  "firstName": "Will",
                  "lastName": "Lee",
                  "initials": "WL",
                  "dupr": 2.9,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Lily",
                  "lastName": "Vo",
                  "initials": "LV",
                  "dupr": 2.6,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Cyn",
                  "lastName": "Tran",
                  "initials": "CT",
                  "dupr": 2.4,
                  "captain": false,
                  "sub": false
                }
              ],
              "subs": []
            },
            {
              "seed": 7,
              "initials": "KY",
              "name": "Kyle Smash",
              "location": "Kyle, TX \u00b7 Kyle Picklers",
              "teamDupr": "10.6",
              "players": [
                {
                  "firstName": "James",
                  "lastName": "Vasquez",
                  "initials": "JV",
                  "dupr": 2.9,
                  "captain": true,
                  "sub": false
                },
                {
                  "firstName": "Ben",
                  "lastName": "Kim",
                  "initials": "BK",
                  "dupr": 2.8,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Tara",
                  "lastName": "Tran",
                  "initials": "TT",
                  "dupr": 2.5,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Dana",
                  "lastName": "Rodriguez",
                  "initials": "DR",
                  "dupr": 2.4,
                  "captain": false,
                  "sub": false
                }
              ],
              "subs": []
            },
            {
              "seed": 8,
              "initials": "CP",
              "name": "Cedar Park Smash",
              "location": "Cedar Park, TX \u00b7 Cedar Park Pickleball",
              "teamDupr": "10.4",
              "players": [
                {
                  "firstName": "Derek",
                  "lastName": "Boyd",
                  "initials": "DB",
                  "dupr": 2.9,
                  "captain": true,
                  "sub": false
                },
                {
                  "firstName": "Hank",
                  "lastName": "Kessler",
                  "initials": "HK",
                  "dupr": 2.8,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Elena",
                  "lastName": "Shaw",
                  "initials": "ES",
                  "dupr": 2.5,
                  "captain": false,
                  "sub": false
                },
                {
                  "firstName": "Lily",
                  "lastName": "Park",
                  "initials": "LP",
                  "dupr": 2.3,
                  "captain": false,
                  "sub": false
                }
              ],
              "subs": []
            }
          ],
          "pools": [
            {
              "id": "a",
              "name": "Pool A",
              "rows": [
                {
                  "seed": 1,
                  "initials": "NB",
                  "team": "New Braunfels",
                  "w": 3,
                  "l": 0,
                  "games": "11\u20131",
                  "pts": 9,
                  "advance": true
                },
                {
                  "seed": 2,
                  "initials": "RR",
                  "team": "Round Rock Smash",
                  "w": 2,
                  "l": 1,
                  "games": "8\u20134",
                  "pts": 6,
                  "advance": true
                },
                {
                  "seed": 3,
                  "initials": "GT",
                  "team": "Georgetown",
                  "w": 1,
                  "l": 2,
                  "games": "4\u20138",
                  "pts": 3,
                  "advance": false
                },
                {
                  "seed": 4,
                  "initials": "CP",
                  "team": "Cedar Park Smash",
                  "w": 0,
                  "l": 3,
                  "games": "1\u201311",
                  "pts": 0,
                  "advance": false
                }
              ]
            },
            {
              "id": "b",
              "name": "Pool B",
              "rows": [
                {
                  "seed": 1,
                  "initials": "LD",
                  "team": "Leander Drop",
                  "w": 3,
                  "l": 0,
                  "games": "10\u20132",
                  "pts": 9,
                  "advance": true
                },
                {
                  "seed": 2,
                  "initials": "LS",
                  "team": "Lone Star Smash",
                  "w": 2,
                  "l": 1,
                  "games": "7\u20135",
                  "pts": 6,
                  "advance": true
                },
                {
                  "seed": 3,
                  "initials": "KY",
                  "team": "Kyle Smash",
                  "w": 1,
                  "l": 2,
                  "games": "5\u20137",
                  "pts": 3,
                  "advance": false
                },
                {
                  "seed": 4,
                  "initials": "WW",
                  "team": "Westlake Sr.",
                  "w": 0,
                  "l": 3,
                  "games": "3\u20139",
                  "pts": 0,
                  "advance": false
                }
              ]
            }
          ],
          "matches": [
            {
              "type": "pool",
              "time": "8:30 AM",
              "court": "Court 3",
              "team1": {
                "initials": "NB",
                "name": "New Braunfels"
              },
              "team2": {
                "initials": "CP",
                "name": "Cedar Park Smash"
              },
              "score": "3\u20131",
              "status": "Final \u00b7 Pool A",
              "winner": 1
            },
            {
              "type": "pool",
              "time": "8:30 AM",
              "court": "Court 5",
              "team1": {
                "initials": "LD",
                "name": "Leander Drop"
              },
              "team2": {
                "initials": "WW",
                "name": "Westlake Sr."
              },
              "score": "3\u20130",
              "status": "Final \u00b7 Pool B",
              "winner": 1
            },
            {
              "type": "pool",
              "time": "9:15 AM",
              "court": "Court 3",
              "team1": {
                "initials": "RR",
                "name": "Round Rock Smash"
              },
              "team2": {
                "initials": "GT",
                "name": "Georgetown"
              },
              "score": "3\u20131",
              "status": "Final \u00b7 Pool A",
              "winner": 1
            },
            {
              "type": "pool",
              "time": "9:15 AM",
              "court": "Court 5",
              "team1": {
                "initials": "LS",
                "name": "Lone Star Smash"
              },
              "team2": {
                "initials": "KY",
                "name": "Kyle Smash"
              },
              "score": "3\u20132",
              "status": "Final \u00b7 Pool B",
              "winner": 1
            },
            {
              "type": "bracket",
              "time": "2:00 PM",
              "court": "Court 1",
              "team1": {
                "initials": "NB",
                "name": "New Braunfels"
              },
              "team2": {
                "initials": "LS",
                "name": "Lone Star Smash"
              },
              "score": "3\u20131",
              "status": "Final \u00b7 Semifinal",
              "winner": 1
            },
            {
              "type": "bracket",
              "time": "2:00 PM",
              "court": "Court 2",
              "team1": {
                "initials": "LD",
                "name": "Leander Drop"
              },
              "team2": {
                "initials": "RR",
                "name": "Round Rock Smash"
              },
              "score": "2\u20133",
              "status": "Final \u00b7 Semifinal",
              "winner": 2
            },
            {
              "type": "bracket",
              "time": "3:30 PM",
              "court": "CC1",
              "team1": {
                "initials": "NB",
                "name": "New Braunfels"
              },
              "team2": {
                "initials": "RR",
                "name": "Round Rock Smash"
              },
              "score": "3\u20131",
              "status": "Final \u00b7 Gold",
              "winner": 1
            }
          ],
          "brackets": [
            {
              "round": "Semifinals",
              "matches": [
                {
                  "teams": [
                    {
                      "initials": "NB",
                      "name": "New Braunfels",
                      "score": 3,
                      "win": true
                    },
                    {
                      "initials": "LS",
                      "name": "Lone Star Smash",
                      "score": 1,
                      "win": false
                    }
                  ]
                },
                {
                  "teams": [
                    {
                      "initials": "LD",
                      "name": "Leander Drop",
                      "score": 2,
                      "win": false
                    },
                    {
                      "initials": "RR",
                      "name": "Round Rock Smash",
                      "score": 3,
                      "win": true
                    }
                  ]
                }
              ]
            },
            {
              "round": "Final",
              "matches": [
                {
                  "teams": [
                    {
                      "initials": "NB",
                      "name": "New Braunfels",
                      "score": 3,
                      "win": true
                    },
                    {
                      "initials": "RR",
                      "name": "Round Rock Smash",
                      "score": 1,
                      "win": false
                    }
                  ]
                }
              ]
            }
          ],
          "playoffs": [
            {
              "round": "Semifinals",
              "matches": [
                {
                  "teams": [
                    {
                      "initials": "NB",
                      "name": "New Braunfels",
                      "score": 3,
                      "win": true
                    },
                    {
                      "initials": "LS",
                      "name": "Lone Star Smash",
                      "score": 1,
                      "win": false
                    }
                  ]
                },
                {
                  "teams": [
                    {
                      "initials": "LD",
                      "name": "Leander Drop",
                      "score": 2,
                      "win": false
                    },
                    {
                      "initials": "RR",
                      "name": "Round Rock Smash",
                      "score": 3,
                      "win": true
                    }
                  ]
                }
              ]
            }
          ],
          "standings": [
            {
              "medal": "\ud83e\udd47",
              "place": "1st Place",
              "team": "New Braunfels",
              "location": "New Braunfels, TX \u00b7 NB Pickleball",
              "gold": true
            },
            {
              "medal": "\ud83e\udd48",
              "place": "2nd Place",
              "team": "Round Rock Smash",
              "location": "Round Rock, TX \u00b7 Round Rock Picklers",
              "gold": false
            },
            {
              "medal": "\ud83e\udd49",
              "place": "3rd Place",
              "team": "Leander Drop",
              "location": "Leander, TX \u00b7 Leander Pickleball",
              "gold": false
            },
            {
              "medal": "4",
              "place": "4th Place",
              "team": "Lone Star Smash",
              "location": "Round Rock, TX \u00b7 Lone Star PB",
              "gold": false
            }
          ]
        }
      }
    },
    "sponsors": {
      "intro": "The Central Texas Championship is made possible by the partners below.",
      "tiers": [
        {
          "name": "Title Sponsor",
          "feature": true,
          "items": [
            {
              "name": "Volair",
              "url": "https://volair.com",
              "logo": ""
            }
          ]
        },
        {
          "name": "Ball Sponsor",
          "feature": false,
          "items": [
            {
              "name": "Sriya Designs",
              "url": "#",
              "logo": ""
            }
          ]
        },
        {
          "name": "Championship Court",
          "feature": false,
          "items": [
            {
              "name": "Dink Ninjas",
              "url": "#",
              "logo": ""
            },
            {
              "name": "PaddleOn",
              "url": "#",
              "logo": ""
            },
            {
              "name": "IO Pickleball",
              "url": "#",
              "logo": ""
            }
          ]
        },
        {
          "name": "Hydration Partner",
          "feature": false,
          "items": [
            {
              "name": "LMNT",
              "url": "https://drinklmnt.com",
              "logo": ""
            }
          ]
        },
        {
          "name": "Division Sponsors",
          "feature": false,
          "items": [
            {
              "name": "Merge Barbershop",
              "url": "#",
              "logo": ""
            },
            {
              "name": "H.O.G",
              "url": "#",
              "logo": ""
            },
            {
              "name": "Selkirk",
              "url": "https://selkirk.com",
              "logo": ""
            },
            {
              "name": "Diadem",
              "url": "https://diadem.com",
              "logo": ""
            },
            {
              "name": "LifeTime Fitness",
              "url": "https://lifetime.life",
              "logo": "",
              "darkLogo": true
            }
          ]
        }
      ]
    },
    "refund": {
      "title": "WHAT IF I CAN'T MAKE IT?",
      "blocks": [
        {
          "label": "Full Refund Window",
          "text": "Players or clubs receive a full refund up until the week before the tournament date. No refunds are issued after that."
        },
        {
          "label": "Replacement Players",
          "text": "Players with a replacement can swap by reaching out to us."
        },
        {
          "label": "Questions",
          "text": "Reach out to JOMG Pickleball at info@jomgpickleball.com.",
          "email": "info@jomgpickleball.com"
        }
      ]
    },
    "livePlay": {
      "enabled": false,
      "bannerText": "Live scoring \u2014 matches update throughout the day. Championship courts stream on YouTube.",
      "courts": [
        {
          "id": "cc1",
          "number": "CC1",
          "championship": true,
          "youtubeUrl": "https://youtube.com/@jomgpickleball/live",
          "live": true,
          "status": "Live now \u00b7 Mixed Doubles 1",
          "division": "Open \u00b7 DUPR 16 \u00b7 Semifinal",
          "teams": [
            {
              "initials": "CP",
              "name": "Cedar Park Smash",
              "score": 9,
              "lead": true
            },
            {
              "initials": "AU",
              "name": "Austin Elite",
              "score": 7,
              "lead": false
            }
          ],
          "meta": "Match 2 of 4 \u00b7 Cedar Park leads series 1\u20130"
        },
        {
          "id": "cc2",
          "number": "CC2",
          "championship": true,
          "youtubeUrl": "https://youtube.com/@jomgpickleball/streams",
          "live": true,
          "status": "Live now \u00b7 Women's Doubles",
          "division": "35+ \u00b7 DUPR 14 \u00b7 Semifinal",
          "teams": [
            {
              "initials": "HT",
              "name": "Hill Toppers",
              "score": 5,
              "lead": false
            },
            {
              "initials": "TC",
              "name": "Travis Co. Elite",
              "score": 8,
              "lead": true
            }
          ],
          "meta": "Match 3 of 4 \u00b7 Series tied 1\u20131"
        },
        {
          "id": "3",
          "number": "3",
          "live": true,
          "status": "Live now \u00b7 Men's Doubles",
          "division": "50+ \u00b7 DUPR 12 \u00b7 Pool A",
          "teams": [
            {
              "initials": "NB",
              "name": "New Braunfels",
              "score": 11,
              "lead": true
            },
            {
              "initials": "GT",
              "name": "Georgetown",
              "score": 6,
              "lead": false
            }
          ],
          "meta": "Match 1 of 4"
        },
        {
          "id": "7",
          "number": "7",
          "idle": true,
          "division": "Open \u00b7 DUPR 12 \u00b7 Pool A",
          "teams": [
            {
              "initials": "CP",
              "name": "Cedar Park Smash",
              "score": null
            },
            {
              "initials": "AU",
              "name": "Austin Elite",
              "score": null
            }
          ],
          "meta": "Up next \u00b7 11:15 AM"
        },
        {
          "id": "9",
          "number": "9",
          "idle": true,
          "idleMessage": "Court resurfacing \u00b7 back at 11:30 AM"
        },
        {
          "id": "11",
          "number": "11",
          "idle": true,
          "idleMessage": "Open \u2014 no match assigned"
        },
        {
          "id": "15",
          "number": "15",
          "idle": true,
          "idleMessage": "Warm-up / practice court"
        }
      ]
    }
  }
};
