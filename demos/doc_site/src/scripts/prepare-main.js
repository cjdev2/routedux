// @flow

'use strict';

import runnerBuilder from './prepare';

const runner = runnerBuilder();

runner().then(console.log);