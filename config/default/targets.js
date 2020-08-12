const extras = require('./nools-extras');
const {
  getMostRecentLMPDateForPregnancy,
  isActivePregnancy,
  countANCFacilityVisits,
} = extras;

module.exports = [
  // HTS tested
  {
    id: 'hts-number-tested-this-month',
    type: 'count',
    icon: 'icon-person',
    goal: 100,
    translation_key: 'targets.clients_tested.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    appliesIf: function (contact, report) {
      if (!report) {return false;}
      return getMostRecentLMPDateForPregnancy(contact, report);
    },
    date: 'reported',
    idType: 'contact'
  },

  // HTS number positive
  {
    id: 'hts-number-positive-this-month',
    type: 'count',
    icon: 'icon-person',
    goal: -1,
    translation_key: 'targets.clients_positive.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    appliesIf: function (contact, report) {
      return isActivePregnancy(contact, report);
    },
    date: 'now',
    idType: 'contact'
  },

  // HTS number linked
  {
    id: 'hts-number-linked-this-month',
    type: 'count',
    icon: 'icon-clinic',
    goal: -1,
    translation_key: 'targets.clients_linked.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    appliesIf: function (contact, report) {
      if (!isActivePregnancy(contact, report)) {return false;}
      const visitCount = countANCFacilityVisits(contact, report);
      return visitCount > 0;
    },
    date: 'now',
    idType: 'contact'
  }
];
