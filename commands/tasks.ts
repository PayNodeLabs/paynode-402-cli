import fs from 'fs';
import { join } from 'path';
import { DEFAULT_TASK_DIR, jsonEnvelope, BaseCliOptions, cleanupOldTasks } from '../utils.ts';

interface TasksOptions extends BaseCliOptions {
  clean?: boolean;
}

export async function tasksAction(subcommand: string | undefined, options: TasksOptions) {
  const isJson = !!options.json;
  const taskDir = DEFAULT_TASK_DIR;

  if (subcommand === 'clean' || options.clean) {
    const cleaned = cleanupOldTasks(taskDir, 0); // Cleanup everything immediately if explicit
    if (isJson) {
      console.log(jsonEnvelope({ status: 'success', message: `Cleaned ${cleaned} task files from ${taskDir}` }));
    } else {
      console.log(`✅ Successfully cleaned ${cleaned} tasks.`);
    }
    return;
  }

  // Default is list
  if (!fs.existsSync(taskDir)) {
    if (isJson) {
      console.log(jsonEnvelope({ status: 'success', tasks: [] }));
    } else {
      console.log('No tasks found (Directory does not exist).');
    }
    return;
  }

  const files = fs.readdirSync(taskDir).filter(f => f.endsWith('.json') && !f.startsWith('.'));
  const tasks = files.map(file => {
    try {
      const content = fs.readFileSync(join(taskDir, file), 'utf-8');
      const data = JSON.parse(content);
      const stats = fs.statSync(join(taskDir, file));
      return {
        id: data.task_id || file.replace('.json', ''),
        status: data.status,
        url: data.url,
        method: data.method,
        created_at: stats.birthtime.toISOString(),
        completed_at: data.completed_at,
        error: data.error
      };
    } catch {
      return null;
    }
  }).filter(Boolean).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isJson) {
    console.log(jsonEnvelope({ status: 'success', total: tasks.length, tasks }));
  } else {
    if (tasks.length === 0) {
      console.log(`No tasks found in ${taskDir}`);
      return;
    }

    console.log(`\n📋 Recent x402 Background Tasks in ${taskDir}:`);
    console.log(`──────────────────────────────────────────────────`);

    for (const t of tasks as any[]) {
      const statusIcon = t.status === 'completed' ? '✅' : t.status === 'failed' ? '❌' : '🕒';
      const indicator = `(${t.status || 'unknown'})`.padEnd(12);
      const urlPart = t.url ? `| ${t.url}` : '';
      console.log(`${statusIcon} ${t.id.padEnd(12)} ${indicator} ${urlPart}`);
      if (t.error) console.log(`   └─ Error: ${t.error}`);
    }
    console.log(`──────────────────────────────────────────────────`);
    console.log(`💡 Usage: 'cat ${taskDir}/<id>.json' for full results.`);
  }
}
