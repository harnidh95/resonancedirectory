// Each word carries editorial themes used by the local recommendation engine.
const groups = {
  feelings: [
    ['calm,rest', 'calm|peaceful|relaxed|serene|rested|still|at ease|grounded'],
    ['joy,play', 'happy|joyful|delighted|cheerful|playful|amused|giddy|lighthearted'],
    ['hope,change', 'hopeful|optimistic|expectant|encouraged|open|ready|renewed|uplifted'],
    ['grief,selfcompassion', 'sad|heartbroken|grieving|melancholy|tearful|sorrowful|bereft|wistful'],
    ['calm,clarity', 'anxious|worried|uneasy|nervous|apprehensive|panicky|uncertain|on edge'],
    ['catharsis,boundaries', 'angry|frustrated|irritated|resentful|furious|indignant|agitated|bitter'],
    ['connection,selfcompassion', 'lonely|isolated|unseen|disconnected|homesick|left out|unwanted|longing'],
    ['rest,selfcompassion', 'overwhelmed|exhausted|drained|weary|depleted|burned out|fragile|heavy'],
    ['confidence,motivation', 'confident|brave|determined|empowered|capable|proud|resolute|bold'],
    ['creativity,awe', 'curious|inspired|fascinated|awed|wonderstruck|intrigued|enchanted|absorbed'],
    ['acceptance,selfcompassion', 'ashamed|guilty|embarrassed|inadequate|insecure|vulnerable|self-conscious|regretful'],
    ['connection,joy', 'loved|loving|tender|affectionate|grateful|connected|compassionate|appreciated'],
    ['clarity,focus', 'confused|scattered|indecisive|distracted|unfocused|conflicted|lost|bewildered'],
    ['change,motivation', 'restless|bored|stuck|impatient|unfulfilled|discontented|eager|adventurous'],
    ['acceptance,hope', 'disappointed|discouraged|deflated|doubtful|cynical|resigned|disillusioned|hesitant'],
    ['acceptance,calm', 'numb|detached|empty|distant|ambivalent|reflective|pensive|nostalgic'],
  ],
  stuck: [
    ['clarity,focus', 'overthinking|too many choices|mental clutter|indecision|second-guessing|information overload|losing focus|not knowing where to start'],
    ['motivation,confidence', 'procrastination|getting started|fear of failure|perfectionism|giving up|finishing things|taking the first step|waiting to feel ready'],
    ['rest,boundaries', 'burnout|doing too much|constant busyness|never switching off|always being available|work taking over|rest guilt|feeling stretched thin'],
    ['connection,selfcompassion', 'loneliness|making friends|feeling misunderstood|asking for help|belonging|social pressure|being left out|feeling invisible'],
    ['grief,acceptance', 'a breakup|missing someone|loss|saying goodbye|a friendship ending|an empty home|what could have been|unspoken goodbyes'],
    ['change,hope', 'a big transition|starting over|uncertainty|moving somewhere new|growing apart|outgrowing old habits|an unfamiliar chapter|fear of change'],
    ['confidence,selfcompassion', 'self-doubt|comparison|imposter feelings|feeling behind|harsh self-talk|needing approval|not feeling enough|fear of being judged'],
    ['boundaries,connection', 'saying no|people-pleasing|difficult conversations|resentment|unspoken needs|family expectations|conflict|unequal effort'],
    ['creativity,play', 'creative block|a blank page|losing inspiration|taking things too seriously|a stale routine|fear of making bad art|too much consuming|forgetting how to play'],
    ['clarity,change', 'finding direction|meaningless work|career questions|what matters to me|choosing a path|changing my mind|someone else’s definition of success|unclear priorities'],
    ['calm,rest', 'a racing mind|worrying about tomorrow|waiting for news|feeling rushed|too much noise|doomscrolling|a difficult day|trouble slowing down'],
    ['acceptance,selfcompassion', 'past mistakes|regret|letting go|unrealistic expectations|needing control|holding a grudge|accepting myself|things I cannot change'],
    ['motivation,focus', 'inconsistent habits|distractions|too many commitments|a stalled project|feeling unproductive|starting but not finishing|a messy schedule|small tasks piling up'],
    ['joy,awe', 'feeling disconnected from life|everything feeling ordinary|the same old days|forgetting what I enjoy|losing my sense of wonder|feeling uninspired|waiting for the weekend|not being present'],
  ],
  needs: [
    ['calm,rest', 'calm|a deep breath|quiet|a slower pace|stillness|grounding|a soft landing|room to breathe'],
    ['rest,selfcompassion', 'rest|permission to pause|gentleness|comfort|ease|a little care|less pressure|a moment for myself'],
    ['connection,selfcompassion', 'to feel understood|connection|belonging|company|to feel seen|reassurance|warmth|a reminder I’m not alone'],
    ['hope,change', 'hope|a fresh start|possibility|a new perspective|light at the end|trust in tomorrow|encouragement|something to look forward to'],
    ['motivation,focus', 'momentum|a small first step|motivation|focus|a reset|structure|follow-through|energy to begin'],
    ['confidence,selfcompassion', 'courage|self-trust|confidence|permission to be myself|a little bravery|to feel capable|my own approval|to take up space'],
    ['grief,catharsis', 'a good cry|space to grieve|release|to sit with sadness|to remember|a way to say goodbye|tenderness|to let it out'],
    ['joy,play', 'joy|laughter|lightness|a little fun|delight|play|a reason to smile|a happy distraction'],
    ['creativity,awe', 'inspiration|wonder|creative energy|beauty|curiosity|a sense of awe|new ideas|something unexpected'],
    ['clarity,focus', 'clarity|perspective|a sense of direction|simplicity|time to think|one thing to focus on|a clearer head|a question worth asking'],
    ['acceptance,selfcompassion', 'self-compassion|acceptance|forgiveness|permission to be imperfect|patience with myself|to make peace|to let go|a kinder inner voice'],
    ['boundaries,confidence', 'boundaries|permission to say no|my own space|to stand up for myself|honesty|balance|to protect my energy|respect for my limits'],
    ['catharsis,motivation', 'to move my body|a burst of energy|a little fire|to feel powerful|a loud song|to shake things off|an emotional release|to feel something'],
    ['awe,connection', 'a wider view|a reminder of the world|time with nature|a sense of meaning|gratitude|to feel present|a little magic|to reconnect with life'],
  ],
};
export const WORDS = Object.fromEntries(Object.entries(groups).map(([category, rows]) => [category, rows.flatMap(([tags, words]) => words.split('|').map(label => ({ label, themes: tags.split(',') })))]));
// Familiar words lead the cloud. Every word remains available through search and Show all.
const highlights = {
  feelings: ['hopeful','anxious','happy','overwhelmed','curious','sad','grateful','restless','lonely','inspired','calm','angry','lost','excited','tender','confused','tired','content','vulnerable','nostalgic','joyful','disconnected','peaceful','uncertain','loved','frustrated','proud','numb','playful','heartbroken','grounded','insecure','optimistic','melancholy','brave','reflective'],
  stuck: ['overthinking','a big transition','self-doubt','burnout','loneliness','finding direction','a breakup','procrastination','creative block','comparison','letting go','saying no','fear of failure','a racing mind','feeling behind','perfectionism','making friends','starting over','missing someone','too many choices','people-pleasing','getting started','uncertainty','family expectations','losing focus','regret','rest guilt','a stale routine','career questions','feeling invisible'],
  needs: ['a deep breath','comfort','clarity','hope','a good cry','inspiration','connection','courage','joy','rest','to feel understood','a fresh start','perspective','laughter','momentum','self-compassion','wonder','a reset','reassurance','lightness','grounding','to let go','focus','belonging','confidence','quiet','release','play','a small first step','beauty','boundaries','a little magic'],
};
// A few everyday feelings supplement the more nuanced vocabulary.
WORDS.feelings.push({label:'excited',themes:['joy','motivation']},{label:'tired',themes:['rest','selfcompassion']},{label:'content',themes:['calm','acceptance']});
Object.keys(WORDS).forEach(key => WORDS[key].sort((a,b) => {
  const ai=highlights[key].indexOf(a.label), bi=highlights[key].indexOf(b.label);
  return (ai<0?999:ai)-(bi<0?999:bi);
}));
