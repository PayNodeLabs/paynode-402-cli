import { requestAction } from './request.ts';
import { MarketplaceClient } from '../marketplace/client.ts';
import { reportError, EXIT_CODES, BaseCliOptions } from '../utils.ts';

interface InvokePaidApiOptions extends BaseCliOptions {
  method?: string;
  data?: string;
  header?: string | string[];
  background?: boolean;
  output?: string;
  maxAge?: number;
  taskDir?: string;
  taskId?: string;
}

export function parseKvParams(params: string[]): Record<string, string> {
  const payload: Record<string, string> = {};
  for (const param of params) {
    if (!param.includes('=')) continue;
    const [key, ...value] = param.split('=');
    const normalizedKey = key.trim();
    if (!normalizedKey) continue;
    payload[normalizedKey] = value.join('=').trim();
  }
  return payload;
}

function mergeHeaders(
  marketplaceHeaders: Record<string, string> | undefined,
  cliHeader: string | string[] | undefined
): string[] {
  const merged: string[] = [];

  for (const [key, value] of Object.entries(marketplaceHeaders || {})) {
    merged.push(`${key}: ${value}`);
  }

  if (Array.isArray(cliHeader)) {
    merged.push(...cliHeader);
  } else if (cliHeader) {
    merged.push(cliHeader);
  }

  return merged;
}

function parsePayload(data?: string, isJson?: boolean): any {
  if (!data) return undefined;

  try {
    return JSON.parse(data);
  } catch (err: any) {
    const isJsonLike = data.trim().startsWith('{') || data.trim().startsWith('[');
    if (!isJson) {
        if (isJsonLike) {
        console.warn(`⚠️ [Warning] Invocation data looks like JSON but failed to parse: ${err.message}`);
        console.warn(`Sending as raw string instead. Please verify your JSON syntax.`);
        } else {
        console.warn(`⚠️ [Warning] Invocation data is not valid JSON. Sending as raw string.`);
        }
    }
    return data;
  }
}

export async function invokePaidApiAction(apiId: string, params: string[] = [], options: InvokePaidApiOptions) {
  const isJson = !!options.json;

  try {
    const client = new MarketplaceClient({
      baseUrl: options.marketUrl,
      json: isJson
    });

    const kvPayload = parseKvParams(params);
    const explicitPayload = parsePayload(options.data, isJson);
    const payload = explicitPayload ?? (Object.keys(kvPayload).length > 0 ? kvPayload : undefined);

    const invoke = await client.prepareInvoke(apiId, {
      network: options.network,
      payload
    });

    const requestHeaders = mergeHeaders(invoke.headers, options.header);
    const hasPreparedBody = !!(invoke.body && typeof invoke.body === 'object' && Object.keys(invoke.body).length > 0);
    const requestBody = hasPreparedBody 
      ? JSON.stringify(invoke.body) 
      : (explicitPayload !== undefined
          ? options.data
          : (Object.keys(kvPayload).length > 0 ? JSON.stringify(kvPayload) : undefined));

    await requestAction(invoke.invoke_url, [], {
      json: options.json,
      network: options.network || invoke.network, // Delegate fallback to resolveNetwork
      rpc: options.rpc,
      rpcTimeout: options.rpcTimeout,
      confirmMainnet: options.confirmMainnet,
      method: options.method || invoke.method || 'POST',
      data: requestBody,
      header: requestHeaders,
      background: options.background,
      dryRun: options.dryRun,
      output: options.output,
      maxAge: options.maxAge,
      taskDir: options.taskDir,
      taskId: options.taskId
    });
  } catch (error: any) {
    reportError(error, isJson, EXIT_CODES.NETWORK_ERROR);
  }
}
