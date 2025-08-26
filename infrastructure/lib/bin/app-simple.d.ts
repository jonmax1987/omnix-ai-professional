#!/usr/bin/env node
import 'source-map-support/register';
import { CoreStack } from '../lib/stacks/core-stack-simple';
declare const coreStack: CoreStack;
export { coreStack };
