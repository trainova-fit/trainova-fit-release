/* Trainova Fit website: muscles per exercise, one group per named muscle.
   Names and roles come from the app's exercise data (supplied 2026-11-08).
   Ids are element ids in the Body Atlas SVGs (assets/muscle-map).
   A group with empty ids has no shape in the atlas: it is named but not drawn.
   Muscle illustrations by Ryan Graves, CC BY 4.0, via flutter_body_atlas (Kit G., BSD-3). */
function lr(base) { return [base + '_l', base + '_r']; }
function all(bases) { return bases.reduce(function (a, b) { return a.concat(lr(b)); }, []); }
function seq(prefix, n) { var o = []; for (var i = 1; i <= n; i++) o = o.concat(lr(prefix + i)); return o; }

const PECS = lr('pectoralis_major');
const FRONT_DELT = lr('anterior_deltoid');
const BICEPS = all(['biceps_brachii_caput_breve', 'biceps_brachii_caput_longum']);
const TRICEPS = all(['triceps_brachii_caput_longum', 'triceps_brachii_caput_laterale', 'triceps_brachii_caput_mediale']);
const BRACHIORADIALIS = lr('brachioradialis');
const GLUTES = lr('gluteus_maximus');
const HAMSTRINGS = all(['biceps_femoris', 'semitendinosus', 'semimembranosus_1', 'semimembranosus_2']);
const CORE = ['rectus_abdominis_1'].concat(all(['rectus_abdominis_2', 'rectus_abdominis_3', 'rectus_abdominis_4']), seq('external_oblique_', 8));
const QUADS = all(['vastus_lateralis', 'vastus_medialis', 'rectus_femoris']);

function g(key, label, role, ids) { return { key: key, label: label, role: role, ids: ids }; }

export const TF_EXERCISES = [
  {
    id: 'biceps-curl', name: 'Biceps Curl', equipment: 'Dumbbells',
    muscles: [
      g('biceps', 'Biceps brachii', 'primary', BICEPS),
      g('brachialis', 'Brachialis', 'secondary', []),
      g('brachioradialis', 'Brachioradialis', 'secondary', BRACHIORADIALIS)
    ],
    faults: ['Arms too high', 'Arm sway', 'Elbow flare', 'Body lean']
  },
  {
    id: 'lateral-raise', name: 'Lateral Raise', equipment: 'Dumbbells',
    muscles: [
      g('lateral-delt', 'Lateral deltoid', 'primary', lr('lateral_deltoid')),
      g('anterior-delt', 'Anterior deltoid', 'secondary', FRONT_DELT),
      g('serratus', 'Serratus anterior', 'secondary', [])
    ],
    faults: ['Raised too high', 'Bent elbows', 'Uneven raise']
  },
  {
    id: 'barbell-row', name: 'Barbell Row', equipment: 'Barbell',
    muscles: [
      g('lats', 'Latissimus dorsi', 'primary', lr('latissimus_dorsi')),
      g('rhomboids', 'Rhomboids', 'primary', []),
      g('traps', 'Trapezius (middle and lower)', 'primary', all(['trapezius_middle', 'trapezius_lower'])),
      g('rear-delts', 'Posterior deltoids', 'primary', lr('posterior_deltoid')),
      g('biceps-brachialis', 'Biceps brachii and brachialis', 'secondary', BICEPS),
      g('forearms', 'Forearms and brachioradialis', 'secondary', BRACHIORADIALIS),
      g('erectors', 'Erector spinae', 'secondary', []),
      g('core', 'Core (abs and obliques)', 'secondary', CORE),
      g('glutes-hams', 'Glutes and hamstrings', 'secondary', GLUTES.concat(HAMSTRINGS))
    ],
    faults: ['Row elbow flare', 'Uneven pull']
  },
  {
    id: 'romanian-deadlift', name: 'Romanian Deadlift', equipment: 'Barbell',
    muscles: [
      g('glutes', 'Gluteus maximus', 'primary', GLUTES),
      g('hamstrings', 'Hamstrings', 'primary', HAMSTRINGS),
      g('quads', 'Quadriceps femoris', 'secondary', QUADS),
      g('soleus', 'Soleus', 'secondary', [])
    ],
    faults: ['Knees bent']
  },
  {
    id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', equipment: 'Dumbbells and an incline bench',
    muscles: [
      g('pec-clavicular', 'Pectoralis major, clavicular head', 'primary', PECS),
      g('pec', 'Pectoralis major', 'primary', PECS),
      g('anterior-delt', 'Anterior deltoid', 'secondary', FRONT_DELT),
      g('triceps', 'Triceps brachii', 'secondary', TRICEPS)
    ],
    faults: ['Uneven press']
  }
];
