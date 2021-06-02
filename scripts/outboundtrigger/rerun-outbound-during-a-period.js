/*
Resends all documents of contact and data_record types to the EMR
*/

const { URL } = require('url');
const PouchDB = require('pouchdb-core');

PouchDB.plugin(require('pouchdb-adapter-http'));
PouchDB.plugin(require('pouchdb-mapreduce'));

if (!process.env.COUCH_URL) {
  throw new Error('COUCH_URL env var not set.');
}

// configure the start and stop datetime. These can be obtained from the documents in Afyastat
const startDatetime = 1622380518000;
const stopDatetime = 1622471225682;

let COUCH_URL;
let COUCH_USER_URL;
try {
  COUCH_URL = new URL(process.env.COUCH_URL);
  COUCH_USER_URL = new URL(process.env.COUCH_URL);
  COUCH_USER_URL.pathname = '_users';
  console.log('User URL: ' + COUCH_USER_URL);

  if (COUCH_URL.pathname !== '/medic') {
    COUCH_URL.pathname = '/medic';
  }
} catch (err) {
  console.error(`You need to define a valid COUCH_URL`);
  console.error(err.stack);
  console.error('Exiting');
  process.exit(-1);
}

const couchdb = new PouchDB(COUCH_URL.href);

const outboundConfigs = require('../../config/default/app_settings.json').outbound;

const logger = {
  error: console.error,
  isDebugEnabled: () => true,
  debug: console.log,
  info: console.info,

};
const outbound = require('medic/shared-libs/outbound')(logger);

(async () => {

const options = {
    include_docs: true,
  };
  // find all cht-docs of interest
  const allDocs = await couchdb.allDocs(options);
  const TypesToResend = ['data_record', 'contact'];


  const toResend = allDocs.rows.filter(row => TypesToResend.includes(row.doc.type) && (row.doc.reported_date >= startDatetime && row.doc.reported_date <= stopDatetime));

toResend.forEach(row => {

    const infoDoc = {};
    if (row.doc.type === 'contact' && row.doc.contact_type === 'universal_client' && row.doc.new_registration === 'yes' && (row.doc.record_originator && row.doc.record_originator === 'cht')) {
        console.log('Sending registration data');
        outbound.send(outboundConfigs.cht_client_registration, 'reset-contact-state-script', row.doc, infoDoc);
    } else if (row.doc.type === 'contact' && row.doc.contact_type === 'universal_client' && row.doc.new_registration === 'false' && (row.doc.record_originator && row.doc.record_originator === 'cht')) {
        console.log('Sending registration updates data');
        outbound.send(outboundConfigs.cht_client_registration_update, 'reset-contact-state-script', row.doc, infoDoc);
    } else if (row.doc.type === 'contact' && row.doc.contact_type === 'patient_contact' && row.doc.record_originator === 'cht') {
        console.log('Sending contact listing data');
        outbound.send(outboundConfigs.cht_contact_listing, 'reset-contact-state-script', row.doc, infoDoc);
    } else if (row.doc.type === 'data_record' && ['hts_initial_form','hts_retest_form','hts_referral','hts_linkage','hiv_treatment_verification','contact','prep_treatment_verification','tracking','hts_client_tracing'].includes(row.doc.form)) {
        console.log('Sending encounter data');
        outbound.send(outboundConfigs.cht_form_data, 'reset-contact-state-script', row.doc, infoDoc);
    } else if (row.doc.type === 'data_record' && ['hts_screening_form'].includes(row.doc.form) && (row.doc.fields.hts_service !== 'confirmPositiveResult' && row.doc.fields.hts_service !== 'linkage')) {
        console.log('Sending HTS screening encounter data');
        outbound.send(outboundConfigs.cht_hts_screening_form, 'reset-contact-state-script', row.doc, infoDoc);
    } else if (row.doc.type === 'data_record' && row.doc.form === 'contact_follow_up') {
        console.log('Sending contact followup data');
        outbound.send(outboundConfigs.contact_follow_up, 'reset-contact-state-script', row.doc, infoDoc);
    }

});

})();
