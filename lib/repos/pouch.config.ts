import PouchDB from 'pouchdb-browser';
import PouchFind from 'pouchdb-find';
import PouchUpsert from 'pouchdb-upsert';

PouchDB.plugin(PouchFind).plugin(PouchUpsert);

export default PouchDB;
