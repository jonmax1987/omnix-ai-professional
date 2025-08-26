#!/usr/bin/env node
import 'source-map-support/register';
import { CoreStack } from '../lib/stacks/core-stack';
import { StreamingStack } from '../lib/stacks/streaming-stack';
import { MonitoringStack } from '../lib/stacks/monitoring-stack';
declare const coreStack: CoreStack;
declare const streamingStack: StreamingStack;
declare const monitoringStack: MonitoringStack;
export { coreStack, streamingStack, monitoringStack };
