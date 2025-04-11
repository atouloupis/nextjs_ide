import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export async function POST() {
  try {
    // Run a Docker container in detached mode with exposed port 3001
    const { stdout } = await execAsync(
      'docker run -d -p 3001:3001 --rm --name user_ide_container node:18-slim tail -f /dev/null'
    );
    const containerId = stdout.trim();

    // You might want to customize the image, mount volumes, or run a shell server inside
    // For now, it just starts a dummy container

    return NextResponse.json({
      success: true,
      containerId,
      wsUrl: 'wss://localhost:3001/', // Adjust based on your shell server inside container
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
