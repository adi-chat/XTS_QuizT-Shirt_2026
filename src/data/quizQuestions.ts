import type { QuizQuestion } from '../types/quiz';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // =========================================================================
  // ACT 1: THE AUDITION (BAND 1)
  // =========================================================================
  {
    id: 1,
    band: 1,
    prompt: "You forget your line in front of a packed auditorium. What's your move?",
    options: [
      {
        id: '1a',
        label: 'Improvise a dramatic 3-minute monologue to cover.',
        archetype: 'mastermind',
        hatComments: [
          'Bold strategy! Let’s hope Shakespeare’s ghost doesn’t sue you for defamation.',
          'Ah, weaponized arrogance. You will either get a standing ovation or an inquiry.',
        ],
      },
      {
        id: '1b',
        label: 'Freeze and stare intensely at the audience like it is art.',
        archetype: 'dramatic_rebel',
        hatComments: [
          'The avant-garde stare of pure panic. Chilling... and cheap.',
          'A staring contest with 300 paying patrons? I respect the sheer nerve.',
        ],
      },
      {
        id: '1c',
        label: 'Blame the sound tech with a sharp, pointed glare.',
        archetype: 'glamour_icon',
        hatComments: [
          'Classic! When in doubt, sacrifice the tech engineer to the auditorium gods.',
          'Remind me never to leave you near the soundboard. Cold-blooded.',
        ],
      },
      {
        id: '1d',
        label: 'Bow dramatically and exit the stage entirely.',
        archetype: 'chaos_engine',
        hatComments: [
          'Cowardice? No, you call it an unscripted exit. Unhinged!',
          'Leave them wanting more—or at least wanting an explanation. Incredible.',
        ],
      },
    ],
  },
  {
    id: 2,
    band: 1,
    prompt: 'Pick your ultimate late-night rehearsal fuel:',
    options: [
      {
        id: '2a',
        label: 'Black coffee and pure unadulterated adrenaline.',
        archetype: 'method_purist',
        hatComments: [
          'Your resting heart rate sounds like a frantic tap-dance number.',
          'Caffeine and desperation: the true foundational pillars of collegiate theater.',
        ],
      },
      {
        id: '2b',
        label: 'Instant noodles cooked backstage at 2:00 AM.',
        archetype: 'production_anchor',
        hatComments: [
          'The sodium intake of an absolute survivor. A backstage kitchen legend.',
          'Midnight carbs hit different when opening night is forty-eight hours away.',
        ],
      },
      {
        id: '2c',
        label: 'Craft boba or boutique iced espresso.',
        archetype: 'scene_stealer',
        hatComments: [
          'High-maintenance, aesthetic, and completely broke. You fit right in.',
          'Sipping tapioca pearls while the director screams? Pure emotional poise.',
        ],
      },
      {
        id: '2d',
        label: 'Whatever someone else accidentally left in the greenroom.',
        archetype: 'reluctant_prodigy',
        hatComments: [
          'Scavenger instincts detected! Someone keep you out of the prop bins.',
          'Unlabeled biscuits from three days ago? You live on the edge, my friend.',
        ],
      },
    ],
  },
  {
    id: 3,
    band: 1,
    prompt: 'You discover a secret room behind the auditorium stage. What is inside?',
    options: [
      {
        id: '3a',
        label: 'A hidden costume vault from the 1920s with vintage velvet.',
        archetype: 'glamour_icon',
        hatComments: [
          'I smell vintage velvet, mothballs, and unbearable main-character ambitions.',
          'You would raid the wardrobe before checking for fire exits. Admirable vanity.',
        ],
      },
      {
        id: '3b',
        label: 'The ultimate quiet, sound-proof nap corner.',
        archetype: 'ghost_in_wings',
        hatComments: [
          'Exhaustion meets opportunity. Just do not snore during the tragic monologue.',
          'A theater kid’s holy grail: three square feet of silence away from the director.',
        ],
      },
      {
        id: '3c',
        label: 'An illegal espresso machine with whole bean coffee.',
        archetype: 'production_anchor',
        hatComments: [
          'The campus fire marshal would weep, but the ensemble would worship you.',
          'Smuggling commercial steam wands into the greenroom? A genius at work.',
        ],
      },
      {
        id: '3d',
        label: 'The original annotated scripts of forgotten productions.',
        archetype: 'golden_idealist',
        hatComments: [
          'Unearthing buried society secrets and forgotten disasters... macabre!',
          'Looking for forgotten lines or dirt on the alumni? I will never tell.',
        ],
      },
    ],
  },

  // =========================================================================
  // ACT 2: REHEARSAL GRIND (BAND 2)
  // =========================================================================
  {
    id: 4,
    band: 2,
    prompt: "What's your primary role in every group production?",
    options: [
      {
        id: '4a',
        label: 'The visionary leader taking credit for the overall masterpiece.',
        archetype: 'mastermind',
        hatComments: [
          'A dictator in the making! You will either run this society or be overthrown.',
          'All the glory, zero manual labor. Truly the director mindset incarnate.',
        ],
      },
      {
        id: '4b',
        label: 'The silent worker carrying the entire technical load.',
        archetype: 'ghost_in_wings',
        hatComments: [
          'The martyr of the tech bay! Someone get this person a trophy and a chiropractor.',
          'Doing all the heavy lifting while others bow? Your spine is made of tungsten.',
        ],
      },
      {
        id: '4c',
        label: 'The chaos agent pitching unscripted explosions at midnight.',
        archetype: 'chaos_engine',
        hatComments: [
          '“What if we add fireworks in Scene 2?” Please, spare the stage crew!',
          'You do not just think outside the box; you incinerate the box during tech week.',
        ],
      },
      {
        id: '4d',
        label: 'The emotional support supplying snacks, safety pins, and hugs.',
        archetype: 'production_anchor',
        hatComments: [
          'No notes. You are the only reason this production has not burned to the ground.',
          'Forget talent; a box of warm canteen samosas earns unconditional cast loyalty.',
        ],
      },
    ],
  },
  {
    id: 5,
    band: 2,
    prompt: 'Pick an aesthetic for your ideal wardrobe:',
    options: [
      {
        id: '5a',
        label: 'Vintage Film Noir (Trench coats, shadows, and brooding drama).',
        archetype: 'dramatic_rebel',
        hatComments: [
          'Dramatically silhouetted in venetian blinds. Bring your own smoke machine.',
          'Mood: broody. Agenda: solving crimes that you probably committed yourself.',
        ],
      },
      {
        id: '5b',
        label: 'Stained Glass Gothic & Velvet (Deep crimsons and gold embroidery).',
        archetype: 'glamour_icon',
        hatComments: [
          'Ah, melodrama! You do not walk into rooms; you haunt them with grandeur.',
          'Rich velvet and gothic angst. Perfect for brooding backstage in the wings.',
        ],
      },
      {
        id: '5c',
        label: 'Casual Stagehand Utility (All black, heavy boots, pure function).',
        archetype: 'ghost_in_wings',
        hatComments: [
          'Gaffer tape in your belt, steel-toed boots on your feet. Backstage royalty!',
          'Invisible to the spotlight, essential to the universe. Pure operational steel.',
        ],
      },
      {
        id: '5d',
        label: 'Tailored Sartorial Swagger (Bespoke suits and pocket squares).',
        archetype: 'scene_stealer',
        hatComments: [
          'Sartorial perfection! If the acting falters, at least the wardrobe wins.',
          'Dressing for the Tony Awards while rehearsing in a humid college basement.',
        ],
      },
    ],
  },
  {
    id: 6,
    band: 2,
    prompt: "You're 20 minutes late to call time. What's your excuse?",
    options: [
      {
        id: '6a',
        label: '“I was mentally preparing my character’s emotional arc.”',
        archetype: 'method_purist',
        hatComments: [
          'The director’s blood pressure just spiked, but you look committed.',
          'Method acting is no excuse for making the lighting tech wait in the dark!',
        ],
      },
      {
        id: '6b',
        label: '“Traffic was a tragedy of epic Greek proportions.”',
        archetype: 'golden_idealist',
        hatComments: [
          'Turning a college bus ride into a three-act tragedy. Points for flair.',
          'A chorus of horns, a protagonist caught in gridlock... save it for the script!',
        ],
      },
      {
        id: '6c',
        label: '“I was already here in spirit.”',
        archetype: 'chaos_engine',
        hatComments: [
          'Spiritual presence does not move heavy painted flats onto the stage apron!',
          'Metaphysical evasion! Let us see if the director gives you an astral detention.',
        ],
      },
      {
        id: '6d',
        label: '“I wasn’t late. Rehearsal starts when I enter the room.”',
        archetype: 'glamour_icon',
        hatComments: [
          'Cold, calculating, and iconic. The Greenroom Empress has arrived.',
          'Pure queen bee energy. Somewhere, a director is writing an apology note to you.',
        ],
      },
    ],
  },
  {
    id: 7,
    band: 2,
    prompt: 'Which artifact are you smuggling into rehearsal?',
    options: [
      {
        id: '7a',
        label: 'A Time-Turner to fix ruined cues and missed lines.',
        archetype: 'golden_idealist',
        hatComments: [
          'Rewinding time just because you missed an entrance? Typical perfectionist.',
          'Careful—loop back too many times and you will end up cueing yourself.',
        ],
      },
      {
        id: '7b',
        label: 'An Invisibility Cloak to skip vocal warmups.',
        archetype: 'reluctant_prodigy',
        hatComments: [
          'Vocal warmups beneath you? The vocal coach can still hear your throat click!',
          'Disappearing during physical stretches... lazy, sneaky, and shockingly effective.',
        ],
      },
      {
        id: '7c',
        label: 'The Elder Wand to command the stage and set crew.',
        archetype: 'mastermind',
        hatComments: [
          'Directorial power unchecked! Keep that wand away from the stage spotlights.',
          'Power-hungry, aren’t we? Just do not let it go to your head when blocking scenes.',
        ],
      },
      {
        id: '7d',
        label: 'The Marauder’s Map to locate free canteen food on campus.',
        archetype: 'scene_stealer',
        hatComments: [
          '“I solemnly swear that I am scouting the faculty lounge for leftover catering.”',
          'The ultimate reconnaissance: locating untouched samosas in the dean’s lobby.',
        ],
      },
    ],
  },

  // =========================================================================
  // ACT 3: THE CURTAIN CALL (BAND 3)
  // =========================================================================
  {
    id: 8,
    band: 3,
    prompt: 'How do you handle sudden, catastrophic backstage chaos?',
    options: [
      {
        id: '8a',
        label: 'Take total command and bark directions with drill-sergeant volume.',
        archetype: 'production_anchor',
        hatComments: [
          'Authoritarian crisis management! At least someone has a pulse on things.',
          'Loud, decisive, slightly terrifying. A future production manager is born.',
        ],
      },
      {
        id: '8b',
        label: 'Grab a prop, walk out, and smile like everything was scripted.',
        archetype: 'reluctant_prodigy',
        hatComments: [
          'Holding a rubber prop while the set collapses behind you? Peak stoicism.',
          'Smile through the catastrophe. The audience knows nothing unless you flinch.',
        ],
      },
      {
        id: '8c',
        label: 'Silently grab a hammer and fix the broken brace before anyone notices.',
        archetype: 'ghost_in_wings',
        hatComments: [
          'No panic, just mechanics. The silent backbone saves the day once again.',
          'Tools out, catastrophe neutralized. The actors will never know how close they were.',
        ],
      },
      {
        id: '8d',
        label: 'Walk to the dressing room. Self-preservation comes first.',
        archetype: 'dramatic_rebel',
        hatComments: [
          'Survival instinct: 10/10. Loyalty: questionable. Self-preservation at its finest!',
          'If you did not see the flat break, you do not have to fix it. Clean maneuver.',
        ],
      },
    ],
  },
  {
    id: 9,
    band: 3,
    prompt: "What is your secret to commanding the audience's attention?",
    options: [
      {
        id: '9a',
        label: 'Unapologetic main-character energy and pure theatrical wattage.',
        archetype: 'scene_stealer',
        hatComments: [
          'The spotlight doesn’t follow you—you drag the spotlight by its collar.',
          'Confidence bordering on a felony. You command the boards whether they like it or not.',
        ],
      },
      {
        id: '9b',
        label: 'A single raised eyebrow and lethal, calculated comedic timing.',
        archetype: 'mastermind',
        hatComments: [
          'A subtle glance that speaks louder than a thirty-line monologue. Precision.',
          'Subtlety in a room full of screamers? You truly understand the craft.',
        ],
      },
      {
        id: '9c',
        label: 'Raw emotional devastation that brings the first three rows to tears.',
        archetype: 'method_purist',
        hatComments: [
          'Projecting genuine psychological ruin. The auditorium is completely frozen.',
          'You do not perform scenes; you perform emotional autopsies. Intense.',
        ],
      },
      {
        id: '9d',
        label: 'Looking sharp in the official Society print with custom embroidery.',
        archetype: 'glamour_icon',
        hatComments: [
          'Now you are speaking my language! Half the battle is the fabric on your back.',
          'Style over script! If the lines slip, at least the aesthetic is unmatched.',
        ],
      },
    ],
  },
  {
    id: 10,
    band: 3,
    prompt: 'Final decision: What makes a college theater production truly legendary?',
    options: [
      {
        id: '10a',
        label: 'The raw, unfiltered passion and sweat left on the floorboards.',
        archetype: 'method_purist',
        hatComments: [
          'A purist at heart! Blood, sweat, and Shakespearean tears under hot lamps.',
          'The flame of high drama burns bright in you. An artist through and through!',
        ],
      },
      {
        id: '10b',
        label: 'The late-night bond and mutual suffering between cast and crew.',
        archetype: 'golden_idealist',
        hatComments: [
          'Trauma-bonding at 3:00 AM over broken set pieces. The real magic of theater.',
          'A family of creative misfits. The applause fades, but the ensemble remains.',
        ],
      },
      {
        id: '10c',
        label: 'Flawless, invisible backstage mechanics running without a hitch.',
        archetype: 'production_anchor',
        hatComments: [
          'Without the wings, the stage collapses. You appreciate the unseen architects!',
          'Cues hit on the millisecond, flats shifted in silence. Pure elegance.',
        ],
      },
      {
        id: '10d',
        label: 'Looking incredible together in matching official society t-shirts.',
        archetype: 'chaos_engine',
        hatComments: [
          'AHA! You crack the code! The truth is revealed—the wardrobe makes the society!',
          'Bingo! You see through the veil. It all comes down to the cotton on your back!',
        ],
      },
    ],
  },
];
