import fs from 'fs';
import path from 'path';

const srcDir = path.join(__dirname, '..', 'src')
const distDir = path.join(__dirname)
const skipEXT = new Set(['.ts'])

const queue: Array<string> = [srcDir]

while (queue.length > 0) {

    const currentDir = queue.shift()!;
    const entries = fs.readdirSync(currentDir);

    for (const entry of entries) {

        const fullPath = path.join(currentDir, entry);
        const info = fs.statSync(fullPath);

        if (info.isDirectory()) {

            queue.push(fullPath);

        } else if (info.isFile()) {

            if (skipEXT.has(path.extname(fullPath)))
                continue;

            const rel = path.relative(srcDir, fullPath)
            const relDir = path.dirname(rel);
            
            if (!fs.existsSync(path.join(distDir, relDir)))
                fs.mkdirSync(path.join(distDir, relDir), { recursive: true })
            fs.copyFileSync(fullPath, path.join(distDir, rel))
            
        }

    }
}