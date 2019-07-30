import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | site navigation');

test('visiting /', async function(assert) {
  await visit('/');
    
  assert.equal(currentURL(), '/overview');
});

test('visiting /overview', async function(assert) {
  await visit('/');
    
  assert.equal(currentURL(), '/overview');
});

test('visiting /time-series', async function(assert) {
  await visit('/time-series');
    
  assert.equal(currentURL(), '/time-series');
});

test('visiting /horizontal-bar', async function(assert) {
  await visit('/horizontal-bar');
    
  assert.equal(currentURL(), '/horizontal-bar');
});

test('visiting /pie', async function(assert) {
  await visit('/pie');
    
  assert.equal(currentURL(), '/pie');
});

test('visiting /scatter', async function(assert) {
  await visit('/scatter');
    
  assert.equal(currentURL(), '/scatter');
});
